"use client";
import axios from "axios";
import Heading from "@/components/extra/heading";
import { Code } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Empty from "@/components/extra/empty";
import Loader from "@/components/loaders/loader";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/extra/user.avatar";
import BotAvatar from "@/components/extra/bot.avatar";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function CodeGenerationPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [gettingUserCode, setGettingUserCode] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const getUserCodes = async () => {
    setGettingUserCode(true);
    const response = await axios.get("/api/code/get-user-code");
    if (response.data) {
      response.data.map((chat: any) =>
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: chat.response.toString("utf8") },
          { role: "user", content: chat.prompt },

        ])
      );
    }
    setGettingUserCode(false);
  };

  useEffect(() => {
    getUserCodes();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: Message = {
        role: "user",
        content: values.prompt,
      };
      const response = await axios.post("/api/code", {
        prompt: values.prompt,
      });

      const newMessage: Message = {
        role: "assistant",
        content: String(response.data),
      };

      setMessages((current) => [newMessage, userMessage, ...current,]);
      form.reset();
    } catch (error: any) {
      console.log(error);
      toast.error("Something went wrong.");
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Code Generation"
        description="Get code for anything in any language."
        icon={Code}
        iconColor="text-green-500"
        bgColor="bg-green-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="e.g. Write code for a Todo application in javascript."
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
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {(isLoading || gettingUserCode) && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {messages.length === 0 && !isLoading && !gettingUserCode && (
            <Empty label="No code generated yet."></Empty>
          )}
          <div className="flex flex-col-reverse gap-y-4 ">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-6 flex items-start gap-x-8 overflow-x-auto",
                  message.role === "user"
                    ? "bg-white border border-black/50 rounded-l-2xl rounded-tr-2xl ml-auto md:max-w-[40%] dark:bg-black dark:border-white "
                    : "bg-green-500/5 mr-auto max-w-[100%] md:max-w-[60%] rounded-r-2xl rounded-tl-2xl dark:bg-white/10 "
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <ReactMarkdown
                  components={{
                    pre: ({ ...props }) => (
                      <div className=" overflow-auto w-full my-2  bg-black/10 p-4 rounded-lg ">
                        <pre {...props} />
                      </div>
                    ),
                    code: ({ ...props }) => (
                      <code className=" rounded-lg p-1" {...props} />
                    ),
                  }}
                  className="text-sm overflow-hidden leading-7"
                >
                  {message.content || ""}
                </ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeGenerationPage;
