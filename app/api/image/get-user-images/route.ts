import prismadb from "@/packages/api/prismadb";
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
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(userImages);
  } catch (error) {
    console.log("ERROR :: Get-user-images ::" + error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
