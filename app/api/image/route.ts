import { NextResponse } from "next/server";
import axios from "axios";
import prismadb from "@/packages/api/prismadb";
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";

export const maxDuration = 20;
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    const userId = session.user.id;
    const body = await req.json();
    const { prompt } = await body;

    const url = "https://api.thehive.ai/api/v3/black-forest-labs/flux-schnell";

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required.", { status: 400 });
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
    console.log(
      "ERROR :: Image Generation API :: ",
      JSON.stringify(error, null, 2)
    );
    return new NextResponse("Internal server error", { status: 500 });
  }
}
