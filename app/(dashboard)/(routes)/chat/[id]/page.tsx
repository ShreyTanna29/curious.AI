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
import { useParams, useRouter } from "next/navigation";
import { SendHorizontal, Sparkles, SquarePlus } from "lucide-react";
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

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  useEffect(() => {
    const fetchConversation = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      let hasBootstrappedMessages = false;
      const bootstrapRaw = sessionStorage.getItem(chatBootstrapKey(id));
      if (bootstrapRaw) {
        try {
          const bootstrap = JSON.parse(bootstrapRaw) as { messages?: Message[]; createdAt?: number };
          if (Array.isArray(bootstrap.messages) && bootstrap.messages.length > 0) {
            setMessages(bootstrap.messages);
            hasBootstrappedMessages = true;
          }
        } catch (error) {
          console.error("Invalid bootstrap chat payload", error);
        } finally {
          sessionStorage.removeItem(chatBootstrapKey(id));
        }
      }

      setLoading(!hasBootstrappedMessages);

      try {
        const response = await axios.get(`/api/chat/${id}`);
        if (response.data?.chats) {
          const chats = response.data.chats;
          const combinedMessages = chats.flatMap((chat: any) => [
            { role: "user", content: chat.prompt },
            { role: "assistant", content: String(chat.response) },
          ]);
          setMessages(combinedMessages);
        }
      } catch (error) {
        toast.error("Failed to load conversation");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [id]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!id) {
      toast.error("Invalid chat session");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: values.prompt,
    };

    try {
      const response = await axios.post("/api/chat", {
        prompt: values.prompt,
        groupChatId: id,
      });

      const newMessage: Message = {
        role: "assistant",
        content: String(response.data.response),
      };

      setMessages((current) => [...current, userMessage, newMessage]);
      form.reset();
    } catch (error) {
      toast.error("Failed to send message ");
      console.log(error);
      setMessages((current) => current.filter((msg) => msg !== userMessage));
    }
  };

  return (
    <main className="relative h-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(15,23,42,0.08),transparent_34%),radial-gradient(circle_at_88%_15%,rgba(15,23,42,0.06),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(100,116,139,0.12),transparent_39%)] dark:bg-[radial-gradient(circle_at_12%_14%,rgba(255,255,255,0.06),transparent_34%),radial-gradient(circle_at_88%_15%,rgba(255,255,255,0.04),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(161,161,170,0.08),transparent_39%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(100,116,139,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.12)_1px,transparent_1px)] [background-size:34px_34px] dark:[background-image:linear-gradient(to_right,rgba(161,161,170,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(161,161,170,0.1)_1px,transparent_1px)]" />

      <div className="relative flex h-full w-full gap-4">
        <section className="relative flex h-full w-full flex-col overflow-hidden border border-white/20 bg-white/70 shadow-[0_25px_60px_rgba(2,8,23,0.16)] backdrop-blur-xl dark:border-white/15 dark:bg-black/70">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 bg-gradient-to-r from-white via-slate-50 to-slate-100 px-4 py-3 text-slate-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-white md:px-6 md:py-3.5">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs uppercase tracking-wider text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-zinc-200">
                <Sparkles className="h-3.5 w-3.5" />
                Threaded Chat
              </p>
              <h1 className="mt-2 text-lg font-semibold md:text-xl">Conversation Session</h1>
            </div>
            <div className="flex items-center gap-2">
              <HistorySidebar />
              <Button
                variant="outline"
                onClick={() => {
                  setMessages([]);
                  router.push("/chat");
                  form.reset();
                }}
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <SquarePlus className="mr-2 h-4 w-4" /> New Chat
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6">
            <div className="mx-auto flex max-w-4xl flex-col gap-4">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200/70 bg-white/85 p-6 dark:border-white/10 dark:bg-zinc-950/80">
                  <Loader className="h-6 w-6" />
                </div>
              ) : null}
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
                        ? "ml-auto w-fit max-w-[85%] border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10"
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
                          placeholder="Continue the conversation..."
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
