import prismadb from "@/packages/api/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userChat = await prismadb.chat.findMany({
    where: {
      userId,
    },
  });

  return NextResponse.json(userChat);
}
