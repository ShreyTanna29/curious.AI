import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import axios from "axios";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt } = body;
    console.log(prompt);

    const url = "https://api.edenai.run/v2/image/generation";

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
        providers: "amazon",
        text: prompt,
        resolution: "512x512",
      },
      {
        headers: {
          authorization: "Bearer " + process.env.EDEN_AI_API_KEY,
        },
      }
    );

    if (!isPro) {
      await increaseApiLimit();
    }

    console.log(response.data);

    await prismadb.image.create({
      data: {
        userId: userId,
        url: response.data.amazon.items[0].image_resource_url,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.log("ERROR :: Image Generation API :: ", error);
  }
}
