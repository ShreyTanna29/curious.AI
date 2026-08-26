import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { getServerSession } from "next-auth";

import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";
import prismadb from "@/packages/api/prismadb";

fal.config({
  credentials: process.env.FAL_AI_API_KEY,
});

export async function GET() {
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const history = await prismadb.speech.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("[SPEECH_HISTORY_GET_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    const userId = session?.user?.id;
    const { text, voicePreset } = await req.json();
    const prompt = typeof text === "string" ? text.trim() : "";

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!voicePreset || typeof voicePreset !== "string") {
      return NextResponse.json(
        { error: "Voice preset is required" },
        { status: 400 }
      );
    }

    const result = await fal.subscribe("fal-ai/minimax/speech-02-turbo", {
      input: {
        text: prompt,
        voice_setting: {
          voice_id: voicePreset,
        },
        language: "en",
      },
    });

    if (!result.data?.audio?.url) {
      throw new Error("No audio URL received from the model");
    }

    const interaction = await prismadb.speech.create({
      data: {
        userId,
        prompt,
        audioUrl: result.data.audio.url,
        voicePreset,
      },
    });

    return NextResponse.json({
      audioUrl: interaction.audioUrl,
      interaction,
    });
  } catch (error) {
    console.error("[TEXT_TO_SPEECH_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to convert text to speech" },
      { status: 500 }
    );
  }
}
