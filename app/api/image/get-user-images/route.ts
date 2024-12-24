import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";
import prismadb from "@/packages/api/prismadb";
import { getServerSession } from "next-auth";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    const userId = session.user.id;
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
