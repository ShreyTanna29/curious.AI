"use client";
import axios from "axios";
import Heading from "@/components/heading";
import { Code } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Empty from "@/components/empty";
import Loader from "@/components/loader";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/user.avatar";
import BotAvatar from "@/components/bot.avatar";
import ReactMarkdown from "react-markdown";
import { useProModel } from "@/hooks/useProModel";
import toast from "react-hot-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function CodeGenerationPage() {
  const router = useRouter();
  const proModel = useProModel();
  const [messages, setMessages] = useState<Message[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: Message = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];
      const response = await axios.post("/api/code", {
        messages: newMessages,
      });
      setMessages((current) => [...current, response.data, userMessage]);
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
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {messages.length === 0 && !isLoading && (
            <Empty label="No code generated yet."></Empty>
          )}
          <div className="flex flex-col-reverse gap-y-4 ">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-6 flex items-start gap-x-8",
                  message.role === "user"
                    ? "bg-white border border-black/50 rounded-l-2xl rounded-tr-2xl ml-auto md:max-w-[40%] dark:bg-black dark:border-white "
                    : "bg-green-500/5 mr-auto md:max-w-[60%] rounded-r-2xl rounded-tl-2xl dark:bg-white/10 "
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <ReactMarkdown
                  components={{
                    pre: ({ ...props }) => (
                      <div className=" overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg ">
                        <pre {...props} />
                      </div>
                    ),
                    code: ({ ...props }) => (
                      <code className="bg-black/10 rounded-lg p-1" {...props} />
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
