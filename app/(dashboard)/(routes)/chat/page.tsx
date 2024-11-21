"use client";
import axios from "axios";
import Heading from "@/components/heading";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Empty from "@/components/empty";
import Loader from "@/components/loader";
import { cn } from "@/packages/utils";
import UserAvatar from "@/components/user.avatar";
import BotAvatar from "@/components/bot.avatar";
import { useProModel } from "@/hooks/useProModel";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function ConversationPage() {
  const proModel = useProModel();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
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
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: chat.response.toString("utf8") },
          { role: "user", content: chat.prompt },
        ])
      );
    }
    setGettingUserChats(false);
  };

  useEffect(() => {
    getUserChats();
  }, []);
  const isLoading = form.formState.isSubmitting;
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

      setMessages((current) => [newMessage, userMessage, ...current]);
      form.reset();
    } catch (error: any) {
      console.log(error);
      if (error?.response?.status === 403) {
        proModel.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Chat"
        description="Ask about anyting to one of the smartest AI."
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />

      {gettingUserChats && (
        <div className="w-full flex items-center justify-center">
          <Loader />
        </div>
      )}

      <div className="px-4 lg:px-8 overflow-auto  md:h-[70vh] h-[65svh] ">
        <div className="space-y-4 mt-4">
          {messages.length === 0 && !gettingUserChats && (
            <Empty label="No conversation started."></Empty>
          )}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 md:p-6 flex items-center gap-x-6 ",
                  message.role === "user"
                    ? "bg-white border border-black/50 rounded-l-2xl rounded-tr-2xl ml-auto md:max-w-[80%] dark:bg-black dark:border-white  "
                    : "bg-violet-500/10 mr-auto md:max-w-[60%] rounded-r-2xl rounded-tl-2xl dark:bg-white/10  "
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <p className="text-sm md:text-xl text-muted-foreground dark:text-white ">
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
      <div className="w-full flex items-center justify-center">
        <div className=" w-full flex  items-center px-4  md:w-[50%] backdrop-blur-lg fixed bottom-10">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2 transition-transform duration-100"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10 ">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="e.g. What is temprature of sun?"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="col-span-12 lg:col-span-2 w-full"
                disabled={isLoading}
              >
                Ask
              </Button>
            </form>
            {isLoading && (
              <div className="hidden md:block w-10 h-10 ml-4">
                <Loader />
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}

export default ConversationPage;
