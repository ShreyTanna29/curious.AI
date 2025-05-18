import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, voicePreset } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Call the Fal AI speech model
    const result = await fal.subscribe("fal-ai/minimax/speech-02-turbo", {
      input: {
        text,
        voice_setting: {
          voice_id: voicePreset,
        },
        language: "en",
      },
    });

    if (!result.data?.audio?.url) {
      throw new Error("No audio URL received from the model");
    }

    // Return the audio URL directly
    return NextResponse.json({ audioUrl: result.data.audio.url });
  } catch (error) {
    console.error("Text-to-speech error:", error);
    return NextResponse.json(
      { error: "Failed to convert text to speech" },
      { status: 500 }
    );
  }
}
