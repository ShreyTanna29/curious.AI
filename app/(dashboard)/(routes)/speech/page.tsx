"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { VOICE_PRESETS, type VoicePreset, type VoiceGender } from "@/app/api/speech/route";

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

// Loading spinner component
const Loader = ({ size = "default" }: { size?: "default" | "lg" }) => (
  <div className={`animate-spin ${size === "lg" ? "w-8 h-8" : "w-4 h-4"}`}>
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

// Empty state component
const Empty = ({ label, icon }: { label: string; icon: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center">
    <div className="relative w-32 h-32 flex items-center justify-center">
      {icon}
    </div>
    <p className="text-muted-foreground mt-2">{label}</p>
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      gender: "male",
      voicePreset: "male",
    },
  });

  const currentGender = form.watch("gender");

  // Update voice preset when gender changes
  const onGenderChange = (gender: VoiceGender) => {
    form.setValue("gender", gender);
    form.setValue("voicePreset", VOICE_PRESETS[gender][0].id);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setAudioUrl(null);

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
      toast.error("Failed to generate speech");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 lg:px-8 py-6 min-h-screen bg-gradient-to-b from-background to-background/80">
      <motion.div
        className="mb-8 space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-center bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-400 text-transparent bg-clip-text">
          AI Voice Generator
        </h1>
        <p className="text-center text-muted-foreground">
          Transform your text into natural-sounding speech with AI-powered voices
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 shadow-lg backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
                Voice Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the text you want to convert to speech..."
                            className="resize-none min-h-[120px] bg-background/50 backdrop-blur-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Voice Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value: VoiceGender) => onGenderChange(value)}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="male" />
                              <label
                                htmlFor="male"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Male
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="female" />
                              <label
                                htmlFor="female"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Female
                              </label>
                            </div>
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background/50 backdrop-blur-sm h-auto py-2">
                              <SelectValue placeholder="Select a voice">
                                {VOICE_PRESETS[currentGender].find(v => v.id === field.value)?.name}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <div className="max-h-[300px] overflow-y-auto">
                              {VOICE_PRESETS[currentGender].map((voice) => (
                                <SelectItem
                                  key={voice.id}
                                  value={voice.id}
                                  className="cursor-pointer py-3 hover:bg-primary/5"
                                >
                                  <div className="flex flex-col gap-1.5">
                                    <span className="font-semibold text-base">
                                      {voice.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground leading-snug">
                                      {voice.description}
                                    </span>
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

                  

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-x-2">
                        <Loader /> Generating...
                      </div>
                    ) : (
                      "Generate Speech"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full border-2 shadow-lg backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                Audio Output
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[calc(100%-5rem)]">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full"
                  >
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader size="lg" />
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-4">
                      Generating your audio...
                    </p>
                  </motion.div>
                ) : audioUrl ? (
                  <motion.div
                    key="audio"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex flex-col items-center justify-center"
                  >
                    <div className="w-full max-w-md p-6 rounded-xl bg-background/50 backdrop-blur-sm shadow-lg">
                      <audio
                        controls
                        className="w-full mb-4"
                        src={audioUrl}
                        autoPlay
                      >
                        Your browser does not support the audio element.
                      </audio>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = audioUrl;
                          link.download = "speech.mp3";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="w-full flex items-center justify-center gap-2 hover:bg-primary/10"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Audio
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <Empty
                    label="No audio generated yet"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                      >
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                    }
                  />
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SpeechPage;
