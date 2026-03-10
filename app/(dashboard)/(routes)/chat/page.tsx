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

const IMAGE_ONLY_MESSAGE_REGEX =
  /^\s*(?:!\[[^\]]*\]\((?:data:image\/|https?:\/\/|\/)[^)]+\)\s*)+$/i;

const isImageOnlyMessage = (content: string): boolean =>
  IMAGE_ONLY_MESSAGE_REGEX.test(content.trim());

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
        hint: "Markets, tech, and culture updates",
        accent: "from-cyan-400/20 to-sky-500/10",
      },
      {
        label: "Motivational quote",
        icon: Quote,
        prompt: "Share a motivating quote with me.",
        hint: "One quote with a practical takeaway",
        accent: "from-emerald-400/20 to-teal-500/10",
      },
      {
        label: "Summarize text",
        icon: FileText,
        prompt: "Summarize this text:",
        hint: "Turn long text into key points",
        accent: "from-amber-400/20 to-orange-500/10",
      },
      {
        label: "Today's news",
        icon: Newspaper,
        prompt: "Tell me today's latest news",
        hint: "A concise briefing of major stories",
        accent: "from-violet-400/20 to-fuchsia-500/10",
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
    <main className="relative h-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(15,23,42,0.08),transparent_36%),radial-gradient(circle_at_90%_20%,rgba(15,23,42,0.06),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(100,116,139,0.12),transparent_38%)] dark:bg-[radial-gradient(circle_at_10%_15%,rgba(255,255,255,0.06),transparent_36%),radial-gradient(circle_at_90%_20%,rgba(255,255,255,0.04),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(161,161,170,0.08),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(100,116,139,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.12)_1px,transparent_1px)] [background-size:34px_34px] dark:[background-image:linear-gradient(to_right,rgba(161,161,170,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(161,161,170,0.1)_1px,transparent_1px)]" />

      <div className="relative flex h-full w-full gap-4">
        <section className="relative flex h-full w-full flex-col overflow-hidden border border-white/20 bg-white/70 shadow-[0_25px_60px_rgba(2,8,23,0.16)] backdrop-blur-xl dark:border-white/15 dark:bg-black/70">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/70 bg-gradient-to-r from-white via-slate-50 to-slate-100 px-4 py-3 text-slate-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-white md:px-6 md:py-3.5">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs uppercase tracking-wider text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-zinc-200">
                <Sparkles className="h-3.5 w-3.5" />
                AI Chat
              </p>
              <h1 className="mt-2 text-xl font-semibold md:text-2xl">How can I help you today?</h1>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-200 md:text-sm">Ask anything from research to creative generation in one conversation.</p>
            </div>
            <HistorySidebar />
          </header>

          <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6">
            {messages.length === 0 ? (
              <div className="mx-auto mt-6 w-full max-w-4xl">
                <div className="relative overflow-hidden rounded-3xl border border-sky-200/60 bg-gradient-to-br from-white/90 via-sky-50/70 to-indigo-50/70 p-5 shadow-[0_18px_60px_rgba(14,116,144,0.12)] dark:border-sky-900/60 dark:from-zinc-950/80 dark:via-sky-950/25 dark:to-indigo-950/20 md:p-6">
                  <div className="pointer-events-none absolute -top-12 right-[-24px] h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl dark:bg-cyan-400/10" />
                  <div className="relative">
                    <p className="inline-flex items-center rounded-full border border-sky-300/70 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700 dark:border-sky-700/70 dark:bg-black/25 dark:text-sky-200">
                      Starter Prompts
                    </p>
                    <p className="mt-3 text-base font-medium text-slate-700 dark:text-zinc-200 md:text-lg">
                      Pick a prompt and I will generate a fast, focused response.
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                      Designed for quick research, writing help, and idea exploration.
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {suggestions.map((item) => (
                    <Button
                      key={item.label}
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.setValue("prompt", item.prompt);
                        form.setFocus("prompt");
                      }}
                      className={cn(
                        "group relative h-auto justify-start gap-3 overflow-hidden rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-3 text-left hover:bg-white dark:border-white/15 dark:bg-zinc-950/80 dark:hover:bg-zinc-900",
                        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(2,6,23,0.14)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
                      )}
                    >
                      <span className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100", item.accent)} />
                      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/80 dark:border-white/15 dark:bg-black/20">
                        <item.icon className="h-4 w-4 text-sky-500" />
                      </span>
                      <span className="relative flex flex-col">
                        <span className="text-sm font-semibold text-slate-800 dark:text-zinc-100 md:text-base">
                          {item.label}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                          {item.hint}
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto flex max-w-4xl flex-col gap-4">
                {messages.map((message, index) => {
                  const imageOnlyAssistant =
                    message.role === "assistant" &&
                    isImageOnlyMessage(message.content);

                  if (imageOnlyAssistant) {
                    return (
                      <div key={`${message.role}-${index}`} className="mr-auto w-full max-w-sm md:max-w-md">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          urlTransform={safeUrlTransform}
                          components={{
                            img: ({ ...props }) => (
                              <img
                                {...props}
                                alt={props.alt || "Generated image"}
                                className="h-auto w-full rounded-lg border border-slate-200 object-contain dark:border-white/15"
                              />
                            ),
                          }}
                          className="w-full"
                        >
                          {message.content || ""}
                        </ReactMarkdown>
                      </div>
                    );
                  }

                  return (
                    <article
                      key={`${message.role}-${index}`}
                      className={cn(
                        "rounded-2xl border px-3.5 py-2.5 md:px-4 md:py-3.5",
                        message.role === "user"
                          ? "ml-auto w-fit max-w-[85%] border-sky-200/70 bg-gradient-to-br from-sky-500/10 to-indigo-500/10"
                          : "mr-auto w-full max-w-4xl border-slate-200/70 bg-white/90 dark:border-white/10 dark:bg-zinc-950/80",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {message.role === "assistant" ? <BotAvatar /> : null}
                        {message.role === "user" ? (
                          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 dark:text-zinc-200 md:text-base md:leading-7">
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
                                  className="mt-2 h-auto w-full max-w-xs rounded-lg border border-slate-200 object-contain md:max-w-sm dark:border-white/15"
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
                            className="w-full overflow-hidden text-sm leading-6 text-slate-700 dark:text-zinc-200 md:text-base md:leading-7"
                          >
                            {message.content || ""}
                          </ReactMarkdown>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-slate-200/70 bg-white/80 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/80 md:p-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mx-auto grid w-full max-w-4xl grid-cols-12 gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition dark:border-white/10 dark:bg-zinc-950/90 dark:shadow-[0_10px_28px_rgba(0,0,0,0.35)] md:gap-3 md:p-2.5"
              >
                <FormField
                  name="prompt"
                  render={({ field }) => (
                    <FormItem className="col-span-12 lg:col-span-10">
                      <FormControl>
                        <Textarea
                          className="!h-11 !min-h-[44px] max-h-40 resize-none rounded-xl border-0 bg-transparent px-2.5 py-2 text-sm leading-6 shadow-none focus-visible:ring-0 md:text-base"
                          disabled={isLoading}
                          placeholder="Ask anything. Press Enter to send, Shift + Enter for newline."
                          {...field}
                          onInput={(e) => {
                            const textarea = e.target as HTMLTextAreaElement;
                            textarea.style.height = "auto";
                            textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 44), 160)}px`;
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
                  className="col-span-12 h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_10px_24px_rgba(8,145,178,0.35)] transition-all duration-200 hover:from-cyan-400 hover:to-blue-400 hover:shadow-[0_12px_28px_rgba(8,145,178,0.45)] dark:from-white dark:to-white dark:text-slate-900 dark:hover:from-slate-100 dark:hover:to-slate-100 dark:shadow-[0_8px_20px_rgba(255,255,255,0.18)] disabled:opacity-70 lg:col-span-2 lg:h-11"
                  disabled={isLoading}
                >
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
