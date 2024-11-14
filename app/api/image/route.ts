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

    const url = "https://api.novita.ai/v3/async/txt2img";

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
        request: {
          model_name: "majicmixRealistic_v6_65516.safetensors",
          prompt: prompt,
          width: 512,
          height: 512,
          image_num: 1,
          steps: 50,
          guidance_scale: 10,
          sampler_name: "Euler a",
        },
      },
      {
        headers: {
          Authorization: "Bearer " + process.env.NOVITA_AI_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!isPro) {
      await increaseApiLimit();
    }

    console.log(response.data);

    const task_id = await response.data.task_id;

    const taskUrl = `https://api.novita.ai/v3/async/task-result?task_id=${task_id}`;

    const output = await axios.get(taskUrl, {
      headers: {
        Authorization: "Bearer " + process.env.NOVITA_AI_API_KEY,
        "Content-Type": "application/json",
      },
    });
    const imgUrl = await (output).data.images[0].image_url;
    console.log("imgUrl", imgUrl);

    await prismadb.image.create({
      data: {
        userId: userId,
        url: String(imgUrl),
      },
    });

    return NextResponse.json(await imgUrl);
  } catch (error) {
    console.log("ERROR :: Image Generation API :: ", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
