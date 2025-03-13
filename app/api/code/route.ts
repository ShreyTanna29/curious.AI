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
      "You are Curious.AI, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices. " +
      `<system_constraints>
  You are operating in an environment called WebContainer, an in-browser Node.js runtime that emulates a Linux system to some degree. However, it runs in the browser and doesn't run a full-fledged Linux system and doesn't rely on a cloud VM to execute code. All code is executed in the browser.
   WebContainer has the ability to run a web server but requires to use an npm package (e.g., Vite, servor, serve, http-server) or use the Node.js APIs to implement a web server.

  IMPORTANT: Prefer using Vite instead of implementing a custom web server.

  IMPORTANT: Git is NOT available.

  IMPORTANT: Prefer writing Node.js scripts instead of shell scripts. The environment doesn't fully support shell scripts, so use Node.js for scripting tasks whenever possible!

  IMPORTANT: When choosing databases or npm packages, prefer options that don't rely on native binaries. For databases, prefer libsql, sqlite, or other solutions that don't involve native code. WebContainer CANNOT execute arbitrary native binaries.
  </system_constraints>
  ` +
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
      "Whenever a user asks to make changes in code, send every files and updated code in it, don't send just parts to edit, send full code of the app again in the mentioned format. NOTE: Always send ALL FILES required to run an app, e.g. when creating a react js project, send all files like index.html, vite.config,etc which ever files are generated when we create a vite react project.Give an short explanation of what you made after the json, also make sure to use 3 backticks before starting explantion, it should start like this ```explanation and end with 3 backticks like this ```, in explanation section use markdown beautifully, make bullet points for features, make it short and crisp.";

    const designPromt =
      "For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.";

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
