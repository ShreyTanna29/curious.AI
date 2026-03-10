"use client";

import axios from "axios";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Loader from "@/components/loaders/loader";
import { cn } from "@/lib/utils";
import BotAvatar from "@/components/extra/bot.avatar";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Newspaper, Quote, SendHorizontal, TrendingUp, Sparkles } from "lucide-react";
import remarkGfm from "remark-gfm";
import { HistorySidebar } from "@/components/sidebar/history-sidebar";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const chatBootstrapKey = (chatId: string) => `chat-bootstrap:${chatId}`;

const safeUrlTransform = (url: string) => {
  if (
    url.startsWith("data:image/") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/")
  ) {
    return url;
  }
  return "";
};

function ConversationPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const suggestions = useMemo(
    () => [
      {
        label: "What's trending?",
        icon: TrendingUp,
        prompt: "What's trending today?",
      },
      {
        label: "Motivational quote",
        icon: Quote,
        prompt: "Share a motivating quote with me.",
      },
      {
        label: "Summarize text",
        icon: FileText,
        prompt: "Summarize this text:",
      },
      {
        label: "Today's news",
        icon: Newspaper,
        prompt: "Tell me today's latest news",
      },
    ],
    [],
  );

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
        content: String(response.data.response),
      };

      const nextMessages = [userMessage, newMessage];
      setMessages((current) => [...current, ...nextMessages]);
      form.reset();
      if (response.data.groupChatId) {
        const groupChatId = String(response.data.groupChatId);
        sessionStorage.setItem(
          chatBootstrapKey(groupChatId),
          JSON.stringify({ messages: nextMessages, createdAt: Date.now() }),
        );
        router.push(`/chat/${groupChatId}`);
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <main className="relative h-full overflow-hidden px-3 pb-5 pt-3 md:px-6 md:pb-6 md:pt-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(15,23,42,0.08),transparent_36%),radial-gradient(circle_at_90%_20%,rgba(15,23,42,0.06),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(100,116,139,0.12),transparent_38%)] dark:bg-[radial-gradient(circle_at_10%_15%,rgba(255,255,255,0.06),transparent_36%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.04),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(161,161,170,0.08),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(100,116,139,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.12)_1px,transparent_1px)] [background-size:34px_34px] dark:[background-image:linear-gradient(to_right,rgba(161,161,170,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(161,161,170,0.1)_1px,transparent_1px)]" />

      <div className="relative mx-auto flex h-full w-full max-w-7xl gap-4">
        <HistorySidebar />

        <section className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/70 shadow-[0_25px_60px_rgba(2,8,23,0.16)] backdrop-blur-xl dark:border-white/15 dark:bg-black/70">
          <header className="border-b border-slate-200/70 bg-gradient-to-r from-white via-slate-50 to-slate-100 px-4 py-5 text-slate-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-white md:px-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs uppercase tracking-wider text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-zinc-200">
              <Sparkles className="h-3.5 w-3.5" />
              AI Chat
            </p>
            <h1 className="mt-3 text-2xl font-semibold md:text-3xl">How can I help you today?</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-200">Ask anything from research to creative generation in one conversation.</p>
          </header>

          <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6">
            {messages.length === 0 ? (
              <div className="mx-auto mt-8 max-w-3xl">
                <div className="mb-6 rounded-2xl border border-sky-200/60 bg-sky-50/80 p-4 text-sm text-slate-700 dark:border-sky-800/70 dark:bg-zinc-950/60 dark:text-zinc-200">
                  Try one of these high-signal prompts to get started.
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {suggestions.map((item) => (
                    <Button
                      key={item.label}
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.setValue("prompt", item.prompt);
                        form.setFocus("prompt");
                      }}
                      className="h-auto justify-start gap-3 rounded-xl border-slate-300/80 bg-white/80 px-4 py-3 text-left text-sm hover:bg-slate-100 dark:border-white/15 dark:bg-zinc-950/80 dark:hover:bg-zinc-900"
                    >
                      <item.icon className="h-4 w-4 text-sky-500" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto flex max-w-4xl flex-col gap-4">
                {messages.map((message, index) => (
                  <article
                    key={`${message.role}-${index}`}
                    className={cn(
                      "w-full rounded-2xl border p-4 md:p-5",
                      message.role === "user"
                        ? "ml-auto max-w-3xl border-sky-200/70 bg-gradient-to-br from-sky-500/10 to-indigo-500/10"
                        : "mr-auto max-w-4xl border-slate-200/70 bg-white/90 dark:border-white/10 dark:bg-zinc-950/80",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {message.role === "assistant" ? <BotAvatar /> : null}
                      {message.role === "user" ? (
                        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-zinc-200 md:text-base">
                          {message.content}
                        </p>
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          urlTransform={safeUrlTransform}
                          components={{
                            img: ({ ...props }) => (
                              <img
                                {...props}
                                alt={props.alt || "Generated image"}
                                className="mt-2 rounded-lg border border-slate-200 dark:border-white/15"
                              />
                            ),
                            pre: ({ ...props }) => (
                              <div className="my-2 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-3 text-slate-100 dark:border-white/15">
                                <pre {...props} />
                              </div>
                            ),
                            code: ({ ...props }) => (
                              <code className="rounded bg-slate-100 px-1.5 py-1 text-[0.92em] dark:bg-zinc-900" {...props} />
                            ),
                          }}
                          className="w-full overflow-hidden text-sm leading-7 text-slate-700 dark:text-zinc-200 md:text-base"
                        >
                          {message.content || ""}
                        </ReactMarkdown>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-slate-200/70 bg-white/80 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/80 md:p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto grid w-full max-w-4xl grid-cols-12 gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-2 dark:border-white/10 dark:bg-zinc-950/90">
                <FormField
                  name="prompt"
                  render={({ field }) => (
                    <FormItem className="col-span-12 lg:col-span-10">
                      <FormControl>
                        <Textarea
                          className="min-h-[58px] max-h-56 resize-none border-0 bg-transparent text-sm leading-6 shadow-none focus-visible:ring-0 md:text-base"
                          disabled={isLoading}
                          placeholder="Ask anything. Press Enter to send, Shift + Enter for newline."
                          {...field}
                          onInput={(e) => {
                            const textarea = e.target as HTMLTextAreaElement;
                            textarea.style.height = "auto";
                            textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
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
                <Button className="col-span-12 h-12 lg:col-span-2" disabled={isLoading}>
                  {isLoading ? <Loader className="h-5 w-5" /> : <span className="inline-flex items-center gap-2">Send <SendHorizontal className="h-4 w-4" /></span>}
                </Button>
              </form>
            </Form>
          </div>
        </section>
      </div>
    </main>
  );
}


export default ConversationPage;
