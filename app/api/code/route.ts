import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prismadb from "@/packages/api/prismadb";
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";
import { designPromt, systemPrompt } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    const userId = session?.user.id;
    const body = await req.json();
    const { prompt, userMessages, modelMessages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("prompt is required", { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Ok, I understand. I will generate code according to the specified format.",
            },
          ],
        },
        {
          role: "user",
          parts: [{ text: designPromt }],
        },
        {
          role: "model",
          parts: [{ text: "Ok, I got it, I will make UI as you specified." }],
        },
        ...userMessages
          .map((msg: { text: string }, i: number) => [
            {
              role: "user",
              parts: [{ text: msg.text }],
            },
            {
              role: "model",
              parts: [{ text: modelMessages[i].text }],
            },
          ])
          .flat(),
      ],
    });

    const result = await chat.sendMessage(prompt);

    const response = result.response.candidates?.[0].content.parts[0].text;

    await prismadb.code.create({
      data: {
        userId,
        prompt,
        response: String(response),
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.log("[CODE_GENERATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
