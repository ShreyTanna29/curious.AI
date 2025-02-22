import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prismadb from "@/packages/api/prismadb";
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    const userId = session.user.id;
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
    const result = await chat.sendMessage(
      "You are an expert code generator. Generate clean, well-documented, and efficient code. Include comments explaining the code logic. " +
      "your first line should be the file structure of the app in an json object" +
      "this is an example of how your json object should look like : {index.html: code of index.html,style.css: code , 'index.js' : 'code'}, key of the object should be name of the file and it's value should be the code in that file, and use only double quotes, don't use any bad control characters, e.g. line breaks" + "Make sure to properly escape all double quotes within the code content using backslashes. " +
      "Here is the user request: " +
      prompt
    );
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
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
