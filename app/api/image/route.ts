import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import axios from "axios";
import { checkApiLimit, increaseApiLimit } from "@/packages/api/api-limit";
import { checkSubscription } from "@/packages/features/subscription";
import prismadb from "@/packages/api/prismadb";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt } = body;

    const url = "https://api.thehive.ai/api/v3/black-forest-labs/flux-schnell";

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required.", { status: 400 });
    }

    const freeTrail = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrail && !isPro) {
      return new NextResponse("Free trail has expired", { status: 403 });
    }

    const response = await axios.post(
      url,
      {
        input: {
          prompt,
          num_images: 1,
          output_format: "png",
        },
      },
      {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${process.env.HIVE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!isPro) {
      await increaseApiLimit();
    }


    const imgUrl = await response.data.output[0].url;

    await prismadb.image.create({
      data: {
        userId: userId,
        url: String(imgUrl),
        prompt,
      },
    });

    return NextResponse.json(await imgUrl);
  } catch (error) {
    console.log("ERROR :: Image Generation API :: ", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
