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
      "your first line should be the file structure of the app in an json object," +
      `this is an example of how your json object should look like :{"src": {"name": "src",
        "type": "folder",
          "children": [{ "name": "index.ts", "type": "file", "content": "content of file", "language": "typescript" }, { "name": "app.tsx", "type": "file", "content": "content of the file", "language": "typescriptreact" }]},"package.json": {"name": "package.json","type": "file","content": "content of package.json","language": "json"},"README.MD": {"name": "README.md","type": "file","content": "content in this file","language": "markdown"}}, key of the object should be name of files or folders of root folder only, do not use any other name, values of that keys would be name of the node,type of the node and then children of the node, if children is a file then it should also have content property and language property and type should be file but if the children is a folder then it should have type as folder and should have children property if it has more files or folders in it, also every file should have an id and ` +
      "don't use any bad control characters, e.g. line breaks" +
      "Make sure to properly escape all double quotes within the code content using backslashes. " +
      "also always make sure to teminate strings, do not leave unterminated strings in JSON, your sent JSON should be parsed by JSON parser." +
      "Always include a package.json in root folder and mention a dev script to run the app.If you are creating app using any framework or library then mention its command to run in dev mode in dev script but if you are not using any framework or library then use vite bundler by default and mention its dev script in package.json." +
      "NOTE : Always mention a dev script in package.json and do not mention any port number in it." +
      "Include package.json first and then send other files" +
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
