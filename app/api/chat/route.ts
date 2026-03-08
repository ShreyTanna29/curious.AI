import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import prismadb from "@/packages/api/prismadb";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";

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
    let { groupChatId } = body || "";
    const { prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("prompt is required", { status: 400 });
    }

    const previousMessages = groupChatId ? await seedChats(groupChatId) : [];
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [...previousMessages, { role: "user", content: prompt }],
    });

    const response = completion.choices[0]?.message?.content ?? "";

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
      const titleCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content:
              "Generate a short and relevant title (max 6-8 words) that summarizes the topic of this conversation. Only return the title text.\n" +
              `User: ${prompt}\nAssistant: ${response}`,
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

    return NextResponse.json({
      response,
      groupChatId,
    });
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
