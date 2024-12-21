import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";
import prismadb from "@/packages/api/prismadb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(NEXT_AUTH_CONFIG);
  const userId = session.user.id;

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
