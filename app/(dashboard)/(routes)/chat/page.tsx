"use client";
import axios from "axios";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/loaders/loader";
import { cn } from "@/lib/utils";
import BotAvatar from "@/components/extra/bot.avatar";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";
import { FileText, History, Newspaper, Quote, TrendingUp } from "lucide-react";
import Balancer from "react-wrap-balancer";
import gsap from "gsap";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function ConversationPage() {
  const router = useRouter();
  const [windowWidth, setWindowWidth] = useState<number>(800);
  const [messages, setMessages] = useState<Message[]>([]);
  const [previousMessages, setPreviuosMessages] = useState<Message[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [gettingUserChats, setGettingUserChats] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const getUserChats = async () => {
    setGettingUserChats(true);
    const response = await axios.get("/api/chat/get-user-chat");
    if (response.data) {
      response.data.map((chat: any) =>
        setPreviuosMessages((prev) => [
          ...prev,
          { role: "user", content: chat.prompt },
          { role: "assistant", content: chat.response.toString("utf8") },
        ])
      );
    }
    if (!response.data || response.data.length === 0) {
      toast.error("You don't have any previous chats.");
      setShowHistory(false);
    }
    setGettingUserChats(false);
  };

  // window width handler useEffect
  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //GSAP handler useEffect
  useEffect(() => {
    gsap.to(".slideUp", {
      opacity: 1,
      duration: 0.5,
      stagger: 0.2,
      y: 0,
    });
  }, [showHistory]);

  const isLoading = form.formState.isSubmitting;

  const tabsHandler = (topic: "trending" | "news" | "quote" | "summarize") => {
    switch (topic) {
      case "trending": {
        form.setValue("prompt", "What's trending today?");
        break;
      }
      case "news": {
        form.setValue("prompt", "Tell me today's latest news");
        break;
      }
      case "quote": {
        form.setValue("prompt", "Share an motivating quote with me.");
        break;
      }
      case "summarize": {
        form.setValue("prompt", "Summarize this text :");
        break;
      }
    }
    form.setFocus("prompt");
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: Message = {
        role: "user",
        content: values.prompt,
      };

      const response = await axios.post("/api/chat", {
        prompt: values.prompt,
      });

      const newMessage: Message = {
        role: "assistant",
        content: String(response.data),
      };

      setMessages((current) => [...current, userMessage, newMessage]);
      form.reset();
    } catch (error: any) {
      console.log(error);
      toast.error("Something went wrong.");
    } finally {
      router.refresh();
    }
  };

  const historyHandler = async () => {
    setShowHistory(!showHistory);
    if (previousMessages.length === 0) {
      await getUserChats();
    }
  };

  return (
    <div className="w-full transition-all duration-300 ease-in-out ">
      <Button
        variant={"custom"}
        className="right-3 lg:right-10 bg-gray-100 rounded-lg absolute md:p-4"
        onClick={() => historyHandler()}
      >
        <History className="mr-2" />
        <span className="hidden md:block">
          {showHistory ? "Hide" : "Show"} History
        </span>
      </Button>
      {gettingUserChats && (
        <div className="w-full flex items-center justify-center">
          <Loader />
        </div>
      )}
      <div className="flex items-center justify-center">
        <div className="w-full px-4 lg:px-8 lg:w-[60%] lg:max-w-[60%] overflow-auto  md:h-[80vh] h-[65svh] scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="w-full space-y-4 mt-4 mx-auto">
            {messages.length === 0 && !showHistory && (
              <div className="w-full h-[60svh] mt-auto flex flex-col justify-end lg:items-center lg:h-[50vh] lg:justify-end ">
                <div className=" text-center text-3xl mb-6">
                  <h1>
                    {" "}
                    <Balancer> How can I help you today?</Balancer>
                  </h1>
                </div>
                <div className="w-full  flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-around overflow-y-hidden overflow-x-scroll scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <Button
                    onClick={() => tabsHandler("trending")}
                    variant={"custom"}
                    className="md:p-5 text-lg rounded-lg opacity-0 slideUp translate-y-10 "
                  >
                    <TrendingUp className="mr-2 text-violet-500" /> What&apos;s
                    trending?
                  </Button>
                  <Button
                    onClick={() => tabsHandler("quote")}
                    variant={"custom"}
                    className="md:p-5 text-lg rounded-lg slideUp opacity-0 translate-y-10 "
                  >
                    <Quote className="mr-2 text-green-500" /> Share a quote
                  </Button>
                  <Button
                    onClick={() => tabsHandler("summarize")}
                    variant={"custom"}
                    className="md:p-5 text-lg rounded-lg slideUp opacity-0 translate-y-10 "
                  >
                    <FileText className="mr-2 text-orange-500 " />
                    Summarize text
                  </Button>
                  <Button
                    onClick={() => tabsHandler("news")}
                    variant={"custom"}
                    className="md:p-5 text-lg rounded-lg slideUp opacity-0 translate-y-10 "
                  >
                    <Newspaper className="mr-2 text-blue-500 " />
                    Today&apos;s news
                  </Button>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-y-6">
              {showHistory &&
                previousMessages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 flex items-center gap-x-6 w-fit",
                      message.role === "user"
                        ? "bg-neutral-200 rounded-xl ml-auto  md:p-5  max-w-[70%] dark:bg-[#212121] "
                        : "bg-white md:p-6 max-w-[100%] rounded-r-2xl rounded-tl-2xl dark:bg-black"
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
                              <div className=" overflow-auto w-full  my-2 bg-black/10 p-2 rounded-lg ">
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
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 flex items-center gap-x-6 w-fit",
                    message.role === "user"
                      ? "bg-neutral-200 rounded-xl ml-auto  md:p-5  max-w-[70%] dark:bg-[#212121] "
                      : "md:p-6 max-w-[100%] rounded-r-2xl rounded-tl-2xl dark:bg-black"
                  )}
                >
                  <p className="text-sm flex justify-center gap-3 md:text-xl text-muted-foreground dark:text-white">
                    {message.role === "user" ? null : <BotAvatar />}
                    {message.role === "user" ? (
                      message.content
                    ) : (
                      <ReactMarkdown
                        components={{
                          pre: ({ ...props }) => (
                            <div className=" overflow-auto w-full  my-2 bg-black/10 p-2 rounded-lg ">
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
      <div className="flex items-center justify-center">
        <div className="flex items-center px-4 w-full md:w-[70%] lg:w-[55%]  fixed bottom-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-2xl bg-neutral-200 dark:bg-[#212121] border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2 transition-transform duration-100"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10 ">
                    <FormControl className="m-0 p-0">
                      <Textarea
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent resize-none transition-all duration-200 text-lg "
                        disabled={isLoading}
                        placeholder="Ask anything..."
                        {...field}
                        rows={windowWidth < 800 ? 1 : 5} // Start with a single row
                        onInput={(e) => {
                          const textarea = e.target as HTMLTextAreaElement; // Cast EventTarget to HTMLTextAreaElement
                          textarea.style.height = "auto"; // Reset height to calculate correctly
                          textarea.style.height = `${textarea.scrollHeight}px`; // Adjust height based on content
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

export default ConversationPage;
