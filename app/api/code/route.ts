import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prismadb from "@/packages/api/prismadb";
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";

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
      `
  <response_instruction>

    1. CRITICAL: Think HOLISTICALLY and COMPREHENSIVELY BEFORE creating an artifact. This means:

      - Consider ALL relevant files in the project
      - Review ALL previous file changes and user modifications
      - Analyze the entire project context and dependencies
      - Anticipate potential impacts on other parts of the system

      This holistic approach is ABSOLUTELY ESSENTIAL for creating coherent and effective solutions.
     
    2. Use <file> tag for a file and include a name attribute with full path of the file e.g.<file name = "src/app.js"> ...content </file> 

    3. CRITICAL: Always provide the FULL, updated content of the artifact. This means:

      - Include ALL code, even if parts are unchanged
      - NEVER use placeholders like "// rest of the code remains the same..." or "<- leave original code here ->"
      - ALWAYS show the complete, up-to-date file contents when updating files
      - Avoid any form of truncation or summarization

    4. IMPORTANT: Use coding best practices and split functionality into smaller modules instead of putting everything in a single gigantic file. Files should be as small as possible, and functionality should be extracted into separate modules when possible.

      - Ensure code is clean, readable, and maintainable.
      - Adhere to proper naming conventions and consistent formatting.
      - Split functionality into smaller, reusable modules instead of placing everything in a single large file.
      - Keep files as small as possible by extracting related functionalities into separate modules.
      - Use imports to connect these modules together effectively. 
  </response_instruction>


    Here are some examples of how you should respond.

    <examples>
    <example>
    <user_request>create a todo app</user_request>
    <model_response>
    sure, I will help you create a simple todo. Here are the features of the todo app :
    - create, update and delete a todo
    - store todos in localstorage
    - awesome animations
    - adding due dates to a todo
    - beautifull design

    <file name="package.json">
    {
        "name": "todo app",
           "scripts": {
            "dev": "vite"
          }
          ...
    }
    </file>
    <file name = "index.html">
    ...
    </file>
    <file name="src/app.jsx"> 
    ...
    </file>

    now you can use todos app by clicking preview button.
    </model_response>
    </example>
    <example>
    <user_request>Build a snake game</user_request>
    <model_response>
    
    </model_response>
    </example>
    <example></example>
    </examples>

  `;

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
