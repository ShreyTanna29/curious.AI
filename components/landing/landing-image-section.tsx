"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera, ImageIcon, Sparkles, Wand2 } from "lucide-react";
import FuturisticCityScape from "../../public/landing-images/A futuristic cityscape with fl.png";
import MagicalForest from "../../public/landing-images/A magical forest with glowing .png";
import AstronautOnHorse from "../../public/landing-images/An astronaut riding a horse on.png";
import CyberPunkStreet from "../../public/landing-images/A cyberpunk street market in t.png";
import UnderwaterCity from "../../public/landing-images/An underwater city with merfol.png";
import Image, { StaticImageData } from "next/image";

// Sample prompts that users might enter
const samplePrompts = [
  "A futuristic cityscape with flying cars and neon lights",
  "A magical forest with glowing mushrooms and fairy lights",
  "An astronaut riding a horse on Mars",
  "A cyberpunk street market in the rain at night",
  "An underwater city with merfolk and bioluminescent plants",
];

const images = [
  FuturisticCityScape,
  MagicalForest,
  AstronautOnHorse,
  CyberPunkStreet,
  UnderwaterCity,
];

export default function LandingImageSection() {
  gsap.registerPlugin(ScrollTrigger);

  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [generatedImage, setGeneratedImage] = useState<StaticImageData | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Typing effect for prompts
  useEffect(() => {
    if (!isTyping || !isInView) return;

    const prompt = samplePrompts[currentPrompt];
    if (cursorPosition < prompt.length) {
      const timer = setTimeout(() => {
        setTypedPrompt(prompt.substring(0, cursorPosition + 1));
        setCursorPosition(cursorPosition + 1);
      }, Math.random() * 50 + 30); // Slightly slower than code typing

      return () => clearTimeout(timer);
    } else {
      // When typing is complete, wait and switch to next prompt
      const timer = setTimeout(() => {
        setIsTyping(false);
        // Simulate image generation
        setIsGenerating(true);
        setTimeout(() => {
          // Pick a random image from our collection
          setGeneratedImage(images[currentPrompt]);

          setTimeout(() => {
            setIsGenerating(false);
            setTimeout(() => {
              setGeneratedImage(null);
              setCursorPosition(0);
              setTypedPrompt("");
              setCurrentPrompt((currentPrompt + 1) % samplePrompts.length);
              setIsTyping(true);
            }, 3000); // Show the image for 3 seconds
          }, 1500); // Generation takes 1.5 seconds
        }, 500);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [cursorPosition, isTyping, currentPrompt, isInView]);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const prompt = promptRef.current;

    if (!section || !title || !prompt) return;

    // Title animation
    gsap.fromTo(
      title,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
        },
      }
    );

    // Floating elements animation
    gsap.to(".floating-element", {
      y: -15,
      duration: 2,
      repeat: -1,
      yoyo: true,
      stagger: 0.3,
      ease: "sine.inOut",
    });

    // Glow pulse animation
    gsap.to(".glow-element", {
      boxShadow: "0 0 20px 2px rgba(var(--color-primary), 0.3)",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full bg-white dark:bg-black relative overflow-hidden py-24 md:py-32"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-element absolute top-[15%] left-[10%] w-8 h-8 rounded-full bg-primary/10 backdrop-blur-md" />
        <div className="floating-element absolute top-[25%] right-[15%] w-12 h-12 rounded-full bg-primary/10 backdrop-blur-md" />
        <div className="floating-element absolute bottom-[20%] left-[20%] w-10 h-10 rounded-full bg-primary/10 backdrop-blur-md" />
        <div className="floating-element absolute bottom-[30%] right-[10%] w-6 h-6 rounded-full bg-primary/10 backdrop-blur-md" />
      </div>

      <div className="container mx-auto px-4">
        {/* Header section */}
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
              <ImageIcon size={14} className="text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">
              AI-POWERED IMAGE GENERATION
            </span>
          </div>

          <h1
            ref={titleRef}
            className="text-black/80 dark:text-white font-bold text-4xl md:text-6xl lg:text-7xl text-center mb-6 tracking-tight"
          >
            <span className="inline-block">Level up your</span>{" "}
            <span className="inline-block relative">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                creativity
              </span>
              <span className="absolute -bottom-1.5 left-0 w-full h-3 bg-primary/10 rounded-full blur-sm"></span>
            </span>
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl text-center max-w-2xl mb-12">
            Go beyond the limits of imagination with AI-generated images. Turn
            your ideas into stunning visuals in seconds.
          </p>
        </div>

        {/* Image generation demo */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="bg-black/90 rounded-xl shadow-2xl overflow-hidden border border-gray-800/50 backdrop-blur-sm">
            {/* Prompt input header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900/90 border-b border-gray-800/50">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/90"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/90"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/90"></div>
              </div>
              <div className="flex items-center px-3 py-1 rounded-md bg-gray-800/50 border border-gray-700/30">
                <span className="text-xs text-gray-400 font-mono">
                  image-generator.ai
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-primary/80"></span>
                  <span>AI Powered</span>
                </div>
              </div>
            </div>

            {/* Prompt input */}
            <div ref={promptRef} className="p-4 bg-gray-900/50">
              <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-gray-800/50">
                <Wand2 size={18} className="text-primary" />
                <div className="flex-1 font-medium text-gray-300">
                  {typedPrompt}
                  <span className="inline-block w-[2px] h-[14px] bg-primary/80 animate-pulse ml-0.5"></span>
                </div>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white dark:text-black"
                  disabled={isGenerating || !typedPrompt}
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-pulse">Generating</span>
                      <span className="ml-1 animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                      <span className="animate-bounce delay-300">.</span>
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </div>

            {/* Image result */}
            <div className="p-4 bg-black/50 flex items-center justify-center">
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-black/40 border border-gray-800/30 flex items-center justify-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                    <p className="text-gray-400 text-sm">
                      Creating your masterpiece...
                    </p>
                  </div>
                ) : generatedImage ? (
                  <Image
                    src={images[currentPrompt]}
                    alt="AI generated image"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-8 text-center">
                    <Camera size={32} className="text-gray-600" />
                    <p className="text-gray-500">
                      Your AI-generated image will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {[
            {
              icon: <Wand2 className="text-primary" size={20} />,
              title: "Text-to-Image Magic",
              description:
                "Transform your descriptions into stunning visuals with just a few words",
            },
            {
              icon: <Sparkles className="text-primary" size={20} />,
              title: "Artistic Styles",
              description:
                "Generate images in various artistic styles from photorealistic to abstract art",
            },
            {
              icon: <Camera className="text-primary" size={20} />,
              title: "High Resolution",
              description:
                "Create detailed, high-resolution images perfect for your projects",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-black/5 dark:bg-white/[0.03] backdrop-blur-sm p-5 rounded-lg border border-black/5 dark:border-white/[0.05] hover:border-primary/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              className="hover:bg-primary/90 text-white bg-black dark:text-black dark:bg-white group px-6 py-6 h-auto text-base"
            >
              Start Creating Images
              <Wand2 className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
            </Button>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
              No design skills required. Start generating beautiful images
              instantly.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
