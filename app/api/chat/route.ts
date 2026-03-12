import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import prismadb from "@/packages/api/prismadb";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";
import { generateAndStoreImage } from "@/lib/server/generate-image";

const GROQ_API_KEY =
  process.env.EXPO_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY || "";
const groq = new Groq({ apiKey: GROQ_API_KEY });

export interface Chat {
  id: string;
  groupId: string;
  userId: string;
  prompt: string;
  response: string;
  createdAt: Date;
}

export interface GroupChat {
  id: string;
  title: string;
  chats?: Chat[];
  createdAt?: Date;
  updatedAt?: Date;
}

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

const IMAGE_INTENT_REGEX =
  /\b(create|generate|draw|make|design|render|illustrate)\b[\s\S]{0,80}\b(image|picture|photo|art|artwork|logo|poster|icon|avatar|visual|illustration)\b|\b(image|picture|photo|art|artwork|logo|poster|icon|avatar|visual|illustration)\b[\s\S]{0,80}\b(create|generate|draw|make|design|render|illustrate)\b|\b(image of|picture of|photo of|illustration of)\b/i;

function isImageRequest(input: string): boolean {
  return IMAGE_INTENT_REGEX.test(input);
}

function hasMarkdownImage(input: string): boolean {
  return /!\[[^\]]*\]\((?:data:image|https?:\/\/)[^)]+\)/i.test(input);
}

function sanitizeForTitle(input: string): string {
  return input
    .replace(/!\[[^\]]*\]\((?:data:image|https?:\/\/)[^)]+\)/gi, "[image]")
    .replace(/data:image\/[a-zA-Z+.-]+;base64,[a-zA-Z0-9+/=]+/g, "[base64-image]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function parseClientMessages(input: unknown): ConversationMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((message) => {
      if (
        !message ||
        typeof message !== "object" ||
        !("role" in message) ||
        !("content" in message)
      ) {
        return null;
      }

      const role = (message as { role: unknown }).role;
      const content = (message as { content: unknown }).content;

      if (
        (role !== "user" && role !== "assistant") ||
        typeof content !== "string" ||
        !content.trim()
      ) {
        return null;
      }

      return { role, content };
    })
    .filter((message): message is ConversationMessage => Boolean(message));
}

async function seedChats(groupChatId: string) {
  try {
    const response = await prismadb.groupChat.findFirst({
      where: { id: groupChatId },
      include: { chats: true },
    });

    const previousChats = response?.chats || [];
    return previousChats.flatMap((entry: Pick<Chat, "prompt" | "response">) => [
      { role: "user" as const, content: entry.prompt },
      { role: "assistant" as const, content: String(entry.response) },
    ]);
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    if (!GROQ_API_KEY) {
      return new NextResponse("Missing Groq API key", { status: 500 });
    }

    const session = await getServerSession(NEXT_AUTH_CONFIG!);
    const userId = session?.user?.id;
    const body = await req.json();
    let groupChatId =
      typeof body?.groupChatId === "string" ? body.groupChatId : "";
    const prompt = typeof body?.prompt === "string" ? body.prompt : "";
    const isIncognito = Boolean(body?.incognito);
    const clientMessages = parseClientMessages(body?.messages);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("prompt is required", { status: 400 });
    }

    const previousMessages =
      isIncognito && clientMessages.length > 0
        ? clientMessages
        : groupChatId
        ? await seedChats(groupChatId)
        : [];
    const userMessage = { role: "user" as const, content: prompt };
    const baseMessages = [...previousMessages, userMessage];

    const systemMessage = {
      role: "system" as const,
      content:
        "You are a helpful assistant. For normal questions, respond with text directly. Only call the generate_image tool when the user explicitly asks to create/generate/draw/make an image, artwork, illustration, photo, logo, or visual.",
    };

    const wantsImage = isImageRequest(prompt);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [systemMessage, ...baseMessages],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_image",
            description:
              "Generate an image from a text prompt when the user asks for visual/image/art creation.",
            parameters: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                  description: "Detailed text prompt for image generation.",
                },
              },
              required: ["prompt"],
            },
          },
        },
      ],
      tool_choice: wantsImage
        ? ({ type: "function", function: { name: "generate_image" } } as any)
        : "auto",
    });

    const assistantMessage = completion.choices[0]?.message;
    let response = assistantMessage?.content ?? "";
    const toolCalls = assistantMessage?.tool_calls ?? [];

    if (toolCalls.length > 0) {
      const generatedImages: Array<{ imageUrl: string; prompt: string }> = [];
      const toolErrors: string[] = [];
      const toolResults: Array<{
        role: "tool";
        tool_call_id: string;
        name: string;
        content: string;
      }> = [];

      for (const toolCall of toolCalls) {
        if (toolCall.type !== "function" || !toolCall.function) continue;

        if (toolCall.function.name === "generate_image") {
          let parsedArgs: { prompt?: string } = {};
          try {
            parsedArgs = JSON.parse(toolCall.function.arguments || "{}");
          } catch {
            parsedArgs = {};
          }

          const toolPrompt = parsedArgs.prompt?.trim() || prompt;
          try {
            const imageUrl = await generateAndStoreImage({
              prompt: toolPrompt,
              userId,
            });
            generatedImages.push({ imageUrl, prompt: toolPrompt });

            toolResults.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: "generate_image",
              content: JSON.stringify({
                imageUrl,
                prompt: toolPrompt,
              }),
            });
          } catch (toolError) {
            toolErrors.push(
              toolError instanceof Error
                ? toolError.message
                : "Image generation failed"
            );
            toolResults.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: "generate_image",
              content: JSON.stringify({
                error:
                  toolError instanceof Error
                    ? toolError.message
                    : "Image generation failed",
              }),
            });
          }
        }
      }

      if (toolResults.length > 0) {
        if (generatedImages.length > 0) {
          const markdownImages = generatedImages
            .map(
              (image, index) =>
                `![Generated image ${index + 1}](${image.imageUrl})`
            )
            .join("\n\n");
          response = markdownImages;
        } else {
          const finalCompletion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              systemMessage,
              ...baseMessages,
              {
                role: "assistant",
                content: assistantMessage?.content || "",
                tool_calls: toolCalls as any,
              },
              ...toolResults,
            ] as any,
          });

          response = finalCompletion.choices[0]?.message?.content ?? response;
          if (toolErrors.length > 0 && !response?.trim()) {
            response = `I could not generate the image.\n\nReason: ${toolErrors[0]}`;
          }
        }
      }
    }

    if (wantsImage && !hasMarkdownImage(response)) {
      try {
        const imageUrl = await generateAndStoreImage({
          prompt,
          userId,
        });
        response = `![Generated image](${imageUrl})`;
      } catch (fallbackError) {
        response = `I could not generate the image.\n\nReason: ${
          fallbackError instanceof Error
            ? fallbackError.message
            : "Image generation failed"
        }`;
      }
    }

    if (!isIncognito) {
      const chatData = {
        prompt,
        response: String(response),
      };

      if (groupChatId) {
        await prismadb.groupChat.update({
          where: { id: groupChatId },
          data: {
            chats: { create: chatData },
          },
        });
      } else {
        const titlePrompt = sanitizeForTitle(prompt);
        const titleResponse = sanitizeForTitle(response);

        const titleCompletion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content:
                "Generate a short and relevant title (max 6-8 words) that summarizes the topic of this conversation. Only return the title text.\n" +
                `User: ${titlePrompt}\nAssistant: ${titleResponse}`,
            },
          ],
        });

        const title = titleCompletion.choices[0]?.message?.content ?? "Untitled";

        const responseOfGroupChat = await prismadb.groupChat.create({
          data: {
            title: String(title),
            chats: { create: chatData },
            userId,
          },
        });

        if (!groupChatId || groupChatId === "") {
          groupChatId = responseOfGroupChat.id;
        }
      }
    } else {
      groupChatId = "";
    }

    return NextResponse.json({
      response,
      groupChatId,
    });
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
