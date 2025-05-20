import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prismadb from "@/packages/api/prismadb";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface Chat {
  id: string;
  groupId: string;
  userId: string;
  prompt: string;
  response: string;
  createdAt: Date;
}

export interface GroupChat {
  id: string;
  title: string;
  chats?: Chat[];
  createdAt?: Date;
  updatedAt?: Date;
}
type Props = {
  params: {
    id: string;
  };
};
export async function POST(req: Request) {
  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG!);
    const userId = session?.user?.id;
    const body = await req.json();
    let { groupChatId } = body || '';
    const { prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("prompt is required", { status: 400 });
    }
    console.log("here working")
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    console.log("here working 2")
    const chat = model.startChat();
    const result = await chat.sendMessage(prompt);
    console.log("here working 3")
    const response = result.response.candidates?.[0].content.parts[0].text;
    console.log("here working 4")
    // whenever the chat starts we need to know the title of the chat
    const chatData = {
      prompt,
      response: String(response),
    };
    if (groupChatId) {
      await prismadb.groupChat.update({
        where: { id: groupChatId },
        data: {
          chats: { create: chatData },
        },
      });
    }
    else{
      const promptForTitle = await chat.sendMessage(`Generate a short and relevant title (max 6–8 words) that summarizes the topic of this conversation: \n User:${prompt} \n Assistant:${response} \n Only return the title text — no explanation or extra content.`);
      const title = promptForTitle.response.candidates?.[0].content.parts[0].text ?? "Untitled";

      const responseOfGroupChat = await prismadb.groupChat.create({
        data: {
          title: String(title),
          chats: { create: chatData },
          userId
        },
      });
      if(!groupChatId || groupChatId==='') groupChatId = responseOfGroupChat.id
    }
    console.log("response ", response, groupChatId)
  return NextResponse.json({ 
    response, 
    groupChatId
  });
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}


export async function GET({ params }: Props) {
  const groupChatId = params.id;

  try {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const groupChat = await prismadb.groupChat.findUnique({
      where: { id: groupChatId },
      include: {
        chats: true, // include related chats if you want
      },
    });
      console.log("gruopchats ", groupChat)
    if (!groupChat || groupChat.userId !== userId) {
      return new NextResponse("Not found or forbidden", { status: 403 });
    }

    return NextResponse.json(groupChat);
  } catch (error) {
    console.error("[GROUP_CHAT_GET_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}