import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userImages = await prismadb.image.findMany({
      where: {
        userId,
      },
    });

    return NextResponse.json(userImages);
  } catch (error) {
    console.log(error);
  }
}