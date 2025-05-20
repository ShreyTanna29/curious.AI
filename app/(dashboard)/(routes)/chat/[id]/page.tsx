"use client";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BotAvatar from "@/components/extra/bot.avatar";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";
import { History } from "lucide-react";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  params: {
    id: string;
  };
};

export default function ConversationPage({ params }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const id = params.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  // Fetch conversation history
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await axios.get(`/api/chat/${id}`);
        if (response.data?.chats) {
          setMessages(response.data.chats);
        }
      } catch (error) {
        toast.error("Failed to load conversation");
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [id]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: Message = {
        role: "user",
        content: values.prompt,
      };

      // Optimistic update
      setMessages(prev => [...prev, userMessage]);
      form.reset();

      const response = await axios.post("/api/chat", {
        prompt: values.prompt,
        groupChatId: params.id
      });

      const botMessage: Message = {
        role: "assistant",
        content: String(response.data.response),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast.error("Failed to send message");
      // Remove optimistic update on error
      setMessages(prev => prev.filter(msg => msg !== userMessage));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with history button */}
      <header className="border-b p-4 flex justify-end">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/chat')}
          className="flex items-center gap-2"
        >
          <History size={18} />
          <span>History</span>
        </Button>
      </header>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex max-w-3xl mx-auto",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-3",
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-800"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1">
                  <BotAvatar />
                  <span className="font-medium">Assistant</span>
                </div>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose dark:prose-invert"
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t p-4 bg-white dark:bg-gray-800">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-3xl mx-auto flex gap-2"
          >
            <FormField
              name="prompt"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Type your message..."
                      className="min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="self-end h-[60px]"
            >
              Send
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}