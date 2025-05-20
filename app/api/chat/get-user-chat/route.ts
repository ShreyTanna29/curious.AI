import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";
import prismadb from "@/packages/api/prismadb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(NEXT_AUTH_CONFIG);
  const userId = session.user.id;
  console.log("user id ", userId)

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userChat = await prismadb.groupChat.findMany({
    where: {
      userId,
    },
  });
  console.log("user chat is ", userChat)
  return NextResponse.json(userChat);
}
