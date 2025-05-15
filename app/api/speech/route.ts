import { NextResponse } from 'next/server';
import {fal} from '@fal-ai/client';

// Initialize the Fal AI client
fal.config({
  credentials: process.env.FAL_AI_API_KEY,
});

// Available voice presets for the model
export const VOICE_PRESETS = {
    male: [
        { id: "male", name: "Announcer", description: "Professional and authoritative voice", gender: "male" },
        { id: "male_2", name: "Narrator", description: "Deep and engaging storytelling voice", gender: "male" },
        { id: "male_casual", name: "Casual", description: "Friendly and conversational tone", gender: "male" },
        { id: "male_professional", name: "Professional", description: "Clear and business-like voice", gender: "male" }
    ],
    female: [
        { id: "female", name: "Announcer", description: "Clear and professional voice", gender: "female" },
        { id: "female_2", name: "Narrator", description: "Warm and engaging storytelling voice", gender: "female" },
        { id: "female_casual", name: "Gentle", description: "Soft and soothing voice", gender: "female" },
        { id: "female_professional", name: "Professional", description: "Natural and friendly tone", gender: "female" }
    ]
} as const;

export type VoiceGender = keyof typeof VOICE_PRESETS;
export type VoicePreset = typeof VOICE_PRESETS[VoiceGender][number]['id'];

export async function POST(req: Request) {
    try {
        const { text, voicePreset = "male" } = await req.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }
        
        // Call the Fal AI speech model
        const result = await fal.subscribe('fal-ai/minimax/speech-02-turbo', {
            input: {
                text,
                voice_preset: voicePreset,
                language: "en"
            },
        });

        if (!result.data?.audio?.url) {
            throw new Error('No audio URL received from the model');
        }

        // Return the audio URL directly
        return NextResponse.json({ audioUrl: result.data.audio.url });
        
    } catch (error) {
        console.error('Text-to-speech error:', error);
        return NextResponse.json(
            { error: 'Failed to convert text to speech' },
            { status: 500 }
        );
    }
}
