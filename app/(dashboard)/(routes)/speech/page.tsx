"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Download,
  Mic,
  Radio,
  Sparkles,
  WandSparkles,
  XCircle,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { VOICE_PRESETS, VoiceGender } from "@/lib/voice_presets";

const Loader = ({ size = "default" }: { size?: "default" | "lg" }) => (
  <div className={`animate-spin ${size === "lg" ? "h-8 w-8" : "h-4 w-4"}`}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  </div>
);

const formSchema = z.object({
  text: z
    .string()
    .min(1, {
      message: "Text is required",
    })
    .max(100, {
      message: "Text must be less than 100 characters",
    }),
  gender: z.enum(["male", "female"] as const),
  voicePreset: z.string().min(1, {
    message: "Voice is required",
  }),
});

const SpeechPage = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      gender: "male",
      voicePreset: "Deep_Voice_Man",
    },
  });

  const currentGender = form.watch("gender");

  const onGenderChange = (gender: VoiceGender) => {
    form.setValue("gender", gender);
    form.setValue("voicePreset", VOICE_PRESETS[gender][0].id);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setAudioUrl(null);
      setHasError(false);

      const response = await fetch("/api/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: values.text,
          voicePreset: values.voicePreset,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const data = await response.json();

      if (!data.audioUrl) {
        throw new Error("No audio URL received");
      }

      setAudioUrl(data.audioUrl);
      toast.success("Speech generated successfully!");
    } catch (error: any) {
      console.error("Error generating speech:", error);
      setHasError(true);
      toast.error("Failed to generate speech");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative h-full overflow-hidden px-3 py-4 md:px-6 md:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(15,23,42,0.08),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(15,23,42,0.06),transparent_36%),radial-gradient(circle_at_60%_100%,rgba(100,116,139,0.12),transparent_40%)] dark:bg-[radial-gradient(circle_at_15%_18%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.04),transparent_36%),radial-gradient(circle_at_60%_100%,rgba(161,161,170,0.08),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(100,116,139,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.12)_1px,transparent_1px)] [background-size:34px_34px] dark:[background-image:linear-gradient(to_right,rgba(161,161,170,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(161,161,170,0.09)_1px,transparent_1px)]" />

      <div className="relative mx-auto flex min-h-full w-full max-w-7xl flex-col gap-4">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-slate-100 px-5 py-6 text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:border-white/20 dark:from-black dark:via-zinc-950 dark:to-black dark:text-white dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)] md:px-8 md:py-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs uppercase tracking-widest text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-zinc-200">
            <Sparkles className="h-3.5 w-3.5" />
            Speech Studio
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Create high-quality voice outputs in seconds.</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-200 md:text-base">
            Compose your text, pick voice style, and export polished audio for content, demos, and product narration.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className="col-span-1 border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <WandSparkles className="h-5 w-5 text-cyan-500" />
                Voice Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Script</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter text to convert into speech..."
                            className="min-h-[140px] resize-none border-slate-300/80 bg-white/90 dark:border-white/15 dark:bg-black/80"
                            {...field}
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">{field.value.length}/100 characters</div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Voice Gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value: VoiceGender) => onGenderChange(value)}
                              defaultValue={field.value}
                              className="flex flex-wrap gap-4"
                            >
                              <label htmlFor="male" className="flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 text-sm dark:border-white/15 dark:bg-black/80">
                                <RadioGroupItem value="male" id="male" /> Male
                              </label>
                              <label htmlFor="female" className="flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 text-sm dark:border-white/15 dark:bg-black/80">
                                <RadioGroupItem value="female" id="female" /> Female
                              </label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="voicePreset"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Voice Style</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-auto min-h-10 border-slate-300/80 bg-white/90 dark:border-white/15 dark:bg-black/80">
                                <SelectValue placeholder="Select a voice">
                                  {VOICE_PRESETS[currentGender].find((v) => v.id === field.value)?.name}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <div className="max-h-[280px] overflow-y-auto">
                                {VOICE_PRESETS[currentGender].map((voice) => (
                                  <SelectItem key={voice.id} value={voice.id} className="cursor-pointer py-3">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-sm font-semibold">{voice.name}</span>
                                      <span className="text-xs text-muted-foreground">{voice.description}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </div>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading} className="h-11 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:from-cyan-400 hover:to-blue-400">
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2"><Loader /> Generating...</span>
                    ) : (
                      <span className="inline-flex items-center gap-2"><Mic className="h-4 w-4" /> Generate Speech</span>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="col-span-1 border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Radio className="h-5 w-5 text-cyan-500" />
                Output Panel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/80 text-center dark:border-white/15 dark:bg-black/70"
                  >
                    <Loader size="lg" />
                    <p className="mt-4 text-sm text-muted-foreground">Synthesizing audio waveform...</p>
                  </motion.div>
                ) : audioUrl ? (
                  <motion.div
                    key="audio"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:text-emerald-300">
                      <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Audio generated successfully.</span>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 dark:border-white/15 dark:bg-black/80">
                      <audio controls className="w-full" src={audioUrl} autoPlay>
                        Your browser does not support the audio element.
                      </audio>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const response = await fetch(audioUrl, { mode: "cors" });
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", "speech.mp3");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      }}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" /> Download Audio
                    </Button>
                  </motion.div>
                ) : hasError ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-rose-300/70 bg-rose-500/10 text-center"
                  >
                    <XCircle className="h-8 w-8 text-rose-500" />
                    <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">Generation failed. Adjust input and try again.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/80 text-center dark:border-white/15 dark:bg-black/70"
                  >
                    <Mic className="h-8 w-8 text-slate-500" />
                    <p className="mt-3 text-sm text-muted-foreground">No audio yet. Submit text to generate your first clip.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default SpeechPage;
