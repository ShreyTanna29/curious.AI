import prismadb from "@/packages/api/prismadb";
import { NextResponse } from "next/server";
import { requireSessionAccess } from "@/lib/server/app-session";

export async function GET() {
  const access = await requireSessionAccess({
    guestMessage: "Create an account to access saved chat history.",
  });

  if (!access.ok) {
    return access.response;
  }

  const userChat = await prismadb.groupChat.findMany({
    where: {
      userId: access.userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return NextResponse.json(userChat);
}
