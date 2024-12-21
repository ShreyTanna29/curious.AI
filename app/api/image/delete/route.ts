import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";
import prismadb from "@/packages/api/prismadb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    const userId = session?.user.id;
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
