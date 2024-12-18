import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prismadb from "@/packages/api/prismadb";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("prompt is required", { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat();
    const result = await chat.sendMessage(prompt);
    const response = result.response.candidates?.[0].content.parts[0].text;

    await prismadb.chat.create({
      data: {
        userId,
        prompt,
        response: String(response),
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
