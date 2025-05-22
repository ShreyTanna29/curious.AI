"use client";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Loader from "@/components/loaders/loader";
import { cn } from "@/lib/utils";
import BotAvatar from "@/components/extra/bot.avatar";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";
import remarkGfm from "remark-gfm";
import { useParams } from 'next/navigation';
import gsap from "gsap";
import { HistorySidebar } from "@/components/sidebar/history-sidebar";
import { useRouter } from "next/navigation";


type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [windowWidth, setWindowWidth] = useState<number>(800);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

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
          const chats = response.data.chats;
          const combinedMessages = chats.flatMap((chat: any) => [
            { role: "user", content: chat.prompt },
            { role: "assistant", content: String(chat.response) }
          ]);
          setMessages(combinedMessages);
        }
      } catch (error) {
        toast.error("Failed to load conversation");
        console.log(error)
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [id]);

  // window width handler
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // GSAP animations
  useEffect(() => {
    gsap.to(".slideUp", {
      opacity: 1,
      duration: 0.5,
      stagger: 0.2,
      y: 0,
    });
  }, []);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const userMessage: Message = {
      role: "user",
      content: values.prompt,
    };
    try {
      const response = await axios.post("/api/chat", {
        prompt: values.prompt,
        groupChatId: id
      });
      
      const newMessage: Message = {
        role: "assistant",
        content: String(response.data.response),
      };
      
      setMessages(current => [...current, userMessage, newMessage]);
      form.reset();
    } catch (error) {
      toast.error("Failed to send message ");
      console.log(error);
      // Remove optimistic update on error
      setMessages(current => current.filter(msg => msg !== userMessage));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

return (
  <div className="w-full transition-all duration-300 ease-in-out">
    <div className="flex items-center justify-between px-4 pt-4">
    <HistorySidebar />
      <Button
        variant="outline"
        onClick={() => {
          setMessages([]); // Clear current chat messages
          // Optionally, also reset form if needed
          router.push(`/chat`)
          form.reset();
        }}
        className="ml-2"
      >
        New Chat
      </Button>
    </div>

    
    {/* Main chat container with padding bottom to account for fixed input */}
    <div className="flex items-center justify-center pb-24"> {/* Added pb-24 for bottom padding */}
      <div className="w-full px-4 lg:px-8 lg:w-[60%] lg:max-w-[60%] overflow-auto md:h-[80vh] h-[65svh] scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="w-full space-y-4 mt-4 mx-auto">
          <div className="flex flex-col gap-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 flex items-center gap-x-6 w-fit",
                  message.role === "user"
                    ? "bg-neutral-200 rounded-xl ml-auto md:p-5 max-w-[70%] dark:bg-[#212121]"
                    : "md:p-6 max-w-[100%] rounded-r-2xl rounded-tl-2xl dark:bg-black"
                )}
              >
                <p className="text-sm flex justify-center gap-3 md:text-xl text-muted-foreground dark:text-white">
                  {message.role === "user" ? null : <BotAvatar />}
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        pre: ({ ...props }) => (
                          <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                            <pre {...props} />
                          </div>
                        ),
                        code: ({ ...props }) => (
                          <code
                            className="bg-black/10 rounded-lg p-1"
                            {...props}
                          />
                        ),
                      }}
                      className="text-sm md:text-xl overflow-hidden leading-7"
                    >
                      {message.content || ""}
                    </ReactMarkdown>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    
    {/* Fixed input container - reduced padding bottom */}
    <div className="flex items-center justify-center">
      <div className="flex items-center px-4 w-full md:w-[70%] lg:w-[55%] fixed bottom-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-2xl bg-neutral-200 dark:bg-[#212121] border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2 transition-transform duration-100"
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-10 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Textarea
                      className=" border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent resize-none transition-all duration-200 text-lg"
                      disabled={isLoading}
                      placeholder="Ask anything..."
                      {...field}
                      rows={windowWidth < 800 ? 1 : 5}
                      onInput={(e) => {
                        const textarea = e.target as HTMLTextAreaElement;
                        textarea.style.height = "auto";
                        textarea.style.height = `${textarea.scrollHeight}px`;
                      }}
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
              className="col-span-12 lg:col-span-2 w-full"
              disabled={isLoading}
            >
              {isLoading ? <Loader className="w-7 h-7" /> : "Ask"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  </div>
);
}