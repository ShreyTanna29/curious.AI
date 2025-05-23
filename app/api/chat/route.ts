import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ChatSession, GoogleGenerativeAI } from "@google/generative-ai";
import prismadb from "@/packages/api/prismadb";
import { NEXT_AUTH_CONFIG } from "@/packages/api/nextAuthConfig";
import toast from "react-hot-toast";

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

let chat: ChatSession | null = null;

async function seedChats(chat:ChatSession, groupChatId:string){
  try {
    const response = await prismadb.groupChat.findFirst({where:{id:groupChatId}, include:{chats:true}});
    const previousChats = response?.chats;
    const chatHistoryPrompt = previousChats?.map(entry => 
    `User: ${entry.prompt}\nAssistant: ${entry.response}`
  ).join('\n\n');
    const promptToGetContext = `
  The following is a conversation I previously had with you. Use this context to answer my next question appropriately.
  ${chatHistoryPrompt}
  `;  
    await chat.sendMessage(promptToGetContext)
  } catch (error) {
    console.log(error)
    toast.error("Somewent Went Wrong")
  }
}

async function initChat(groupChatId:string) {
  if (!chat) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    chat = model.startChat();
    await seedChats(chat, groupChatId);
  }
  return chat;
}
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
   
    const chat = await initChat(groupChatId);
  
    const result = await chat.sendMessage(prompt);
    const response = result.response.candidates?.[0].content.parts[0].text;
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
  return NextResponse.json({ 
    response, 
    groupChatId
  });
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}


