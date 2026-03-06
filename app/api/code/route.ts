import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import prismadb from "@/packages/api/prismadb";
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";
import { designPromt, systemPrompt } from "@/lib/prompts";

const GROQ_API_KEY =
  process.env.EXPO_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY || "";
const groq = new Groq({ apiKey: GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    if (!GROQ_API_KEY) {
      return new NextResponse("Missing Groq API key", { status: 500 });
    }

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

    const history = (userMessages || [])
      .map((msg: { text: string }, i: number) => [
        { role: "user" as const, content: msg.text },
        {
          role: "assistant" as const,
          content: modelMessages?.[i]?.text || "",
        },
      ])
      .flat();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "system", content: designPromt },
        ...history,
        { role: "user", content: prompt },
      ],
    });

    const response = completion.choices[0]?.message?.content ?? "";

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
