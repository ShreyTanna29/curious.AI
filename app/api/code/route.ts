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
    const { prompt, userMessages, modelMessages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("prompt is required", { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt =
      "You are an expert code generator. Generate clean, well-documented, and efficient code. Include comments explaining the code logic. " +
      "your first line should be the file structure of the app in an json object" +
      "this is an example of how your json object should look like : {index.html: code of index.html,style.css: code , 'index.js' : 'code'}, key of the object should be name of the file and it's value should be the code in that file, and use only double quotes, don't use any bad control characters, e.g. line breaks" +
      "Make sure to properly escape all double quotes within the code content using backslashes. " +
      "Whenever a user asks to make changes in code, send every files and updated code in it, don't send just parts to edit, send full code of the app again in the mentioned format";

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
