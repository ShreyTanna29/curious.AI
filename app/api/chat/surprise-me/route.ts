import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";

const GROQ_API_KEY =
  process.env.EXPO_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY || "";
const groq = new Groq({ apiKey: GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    if (!GROQ_API_KEY) {
      return new NextResponse("Missing Groq API key", { status: 500 });
    }

    const session = await getServerSession(NEXT_AUTH_CONFIG!);
    const userId = session?.user?.id;

    const body = await req.json();
    const { prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("prompt is required", { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    const response = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json(response);
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
