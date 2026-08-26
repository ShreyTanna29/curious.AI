import prismadb from "@/packages/api/prismadb";
import { NextRequest, NextResponse } from "next/server";

import { requireSessionAccess } from "@/lib/server/app-session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const groupChatId = (await params).id;

  try {
    const access = await requireSessionAccess({
      guestMessage: "Create an account to access saved chat threads.",
    });

    if (!access.ok) {
      return access.response;
    }

    const groupChat = await prismadb.groupChat.findUnique({
      where: { id: groupChatId },
      include: {
        chats: true,
      },
    });

    if (!groupChat || groupChat.userId !== access.userId) {
      return new NextResponse("Not found or forbidden", { status: 403 });
    }

    return NextResponse.json(groupChat);
  } catch (error) {
    console.error("[GROUP_CHAT_GET_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const groupChatId = (await params).id;

  try {
    const access = await requireSessionAccess({
      guestMessage: "Create an account to rename saved chat threads.",
    });

    if (!access.ok) {
      return access.response;
    }

    const body = await request.json();
    const title = String(body?.title || "").trim();

    if (!title) {
      return new NextResponse("title is required", { status: 400 });
    }

    const groupChat = await prismadb.groupChat.findUnique({
      where: { id: groupChatId },
    });

    if (!groupChat || groupChat.userId !== access.userId) {
      return new NextResponse("Not found or forbidden", { status: 403 });
    }

    const updatedGroupChat = await prismadb.groupChat.update({
      where: { id: groupChatId },
      data: { title },
    });

    return NextResponse.json(updatedGroupChat);
  } catch (error) {
    console.error("[GROUP_CHAT_PATCH_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
