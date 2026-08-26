import { NextResponse } from "next/server";
import { z } from "zod";

import prismadb from "@/packages/api/prismadb";
import { requireSessionAccess } from "@/lib/server/app-session";
import {
  GUEST_MAX_CHAT_CONVERSATIONS,
  GUEST_MAX_CODE_ENTRIES,
} from "@/lib/guest-session";

const guestMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(10_000),
});

const guestConversationSchema = z.object({
  title: z.string().trim().max(120).optional().default("Untitled guest chat"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  messages: z
    .array(guestMessageSchema)
    .max(24)
    .default([]),
});

const guestCodeEntrySchema = z.object({
  prompt: z.string().trim().min(1).max(20_000),
  response: z.string().trim().min(1).max(150_000),
  createdAt: z.string().optional(),
});

const upgradePayloadSchema = z.object({
  guestId: z.string().trim().min(1).max(120),
  guestExpiresAt: z.string().optional(),
  chats: z
    .array(guestConversationSchema)
    .max(GUEST_MAX_CHAT_CONVERSATIONS)
    .default([]),
  codeEntries: z
    .array(guestCodeEntrySchema)
    .max(GUEST_MAX_CODE_ENTRIES)
    .default([]),
});

function buildChatPairs(
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>
) {
  const chatPairs: Array<{ prompt: string; response: string }> = [];
  let pendingPrompt = "";

  for (const message of messages) {
    if (message.role === "user") {
      if (pendingPrompt) {
        chatPairs.push({ prompt: pendingPrompt, response: "" });
      }

      pendingPrompt = message.content.trim();
      continue;
    }

    if (!pendingPrompt) {
      continue;
    }

    chatPairs.push({
      prompt: pendingPrompt,
      response: message.content.trim(),
    });
    pendingPrompt = "";
  }

  if (pendingPrompt) {
    chatPairs.push({ prompt: pendingPrompt, response: "" });
  }

  return chatPairs.filter((pair) => pair.prompt);
}

function buildChatTitle(conversation: z.infer<typeof guestConversationSchema>) {
  const normalizedTitle = conversation.title?.trim();
  if (normalizedTitle) {
    return normalizedTitle;
  }

  const firstPrompt =
    conversation.messages.find((message) => message.role === "user")?.content ||
    "Untitled guest chat";

  return firstPrompt.length > 60
    ? `${firstPrompt.slice(0, 60).trimEnd()}...`
    : firstPrompt;
}

export async function POST(req: Request) {
  try {
    const access = await requireSessionAccess({
      guestMessage:
        "Create an account before trying to move guest work into saved history.",
    });

    if (!access.ok) {
      return access.response;
    }

    if (access.isGuest) {
      return NextResponse.json(
        {
          code: "GUEST_UPGRADE_REQUIRED",
          message: "Sign in to a registered account before importing guest work.",
        },
        { status: 403 }
      );
    }

    const payload = upgradePayloadSchema.parse(await req.json());
    const chatConversations = payload.chats
      .map((conversation) => ({
        title: buildChatTitle(conversation),
        pairs: buildChatPairs(conversation.messages),
      }))
      .filter((conversation) => conversation.pairs.length > 0);

    const codeEntries = payload.codeEntries.filter(
      (entry) => entry.prompt && entry.response
    );

    if (chatConversations.length === 0 && codeEntries.length === 0) {
      return NextResponse.json({
        chatsImported: 0,
        codeEntriesImported: 0,
      });
    }

    const operations = [
      ...chatConversations.map((conversation) =>
        prismadb.groupChat.create({
          data: {
            userId: access.userId,
            title: conversation.title,
            chats: {
              create: conversation.pairs.map((pair) => ({
                prompt: pair.prompt,
                response: pair.response,
              })),
            },
          },
        })
      ),
      ...codeEntries.map((entry) =>
        prismadb.code.create({
          data: {
            userId: access.userId,
            prompt: entry.prompt,
            response: entry.response,
          },
        })
      ),
    ];

    await prismadb.$transaction(operations);

    return NextResponse.json({
      chatsImported: chatConversations.length,
      codeEntriesImported: codeEntries.length,
    });
  } catch (error) {
    console.error("[GUEST_UPGRADE_IMPORT_ERROR]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          code: "INVALID_GUEST_IMPORT",
          message: "Guest data was malformed and could not be imported.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        code: "GUEST_IMPORT_FAILED",
        message: "Failed to import guest work.",
      },
      { status: 500 }
    );
  }
}
