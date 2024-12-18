import prismadb from "@/packages/api/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { url } = body;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prismadb.image.delete({
      where: {
        url,
        userId,
      },
    });

    return new NextResponse("SUCCESS", { status: 200 });
  } catch (error) {
    console.log("ERROR :: Delete-images ::" + error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
