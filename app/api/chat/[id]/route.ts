import prismadb from "@/packages/api/prismadb";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";

export async function GET(
  request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
  const groupChatId = (await params).id

  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const groupChat = await prismadb.groupChat.findUnique({
      where: { id: groupChatId },
      include: {
        chats: true,
      },
    });
    if (!groupChat || groupChat.userId !== userId) {
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
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const title = String(body?.title || "").trim();

    if (!title) {
      return new NextResponse("title is required", { status: 400 });
    }

    const groupChat = await prismadb.groupChat.findUnique({
      where: { id: groupChatId },
    });

    if (!groupChat || groupChat.userId !== userId) {
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
