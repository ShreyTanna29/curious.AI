import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    const response = await fetch(imageUrl);
    const imageBlob = await response.blob();

    return new NextResponse(imageBlob, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="ai-generated-image.png"',
      },
    });
  } catch (error: unknown) {
    console.log(error);

    return new NextResponse("Failed to download image", { status: 500 });
  }
}
