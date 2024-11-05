import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import axios from "axios";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt } = body;
    console.log(prompt);

    const url = "https://modelslab.com/api/v6/realtime/text2img";

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required.", { status: 400 });
    }

    const freeTrail = await checkApiLimit();

    if (!freeTrail) {
      return new NextResponse("Free trail has expired", { status: 403 });
    }

    const response = await axios.post(url, {
      key: process.env.MODEL_LABS_IMAGE_API_KEY,
      prompt: prompt,
    });

    await increaseApiLimit();
    return NextResponse.json(response.data);
  } catch (error) {
    console.log("ERROR :: Image Generation API :: ", error);
  }
}
