"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Sparkles,
  Brain,
  Zap,
  Code,
  Lightbulb,
  Cpu,
  Lock,
  RefreshCw,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function LandingChatSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const featureCardsRef = useRef<HTMLDivElement>(null);

  // Initialize animations
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Title animation
    gsap.fromTo(
      ".chat-title",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          preventOverlaps: true,
          fastScrollEnd: true,
          pin: false,
          scroller: null,
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

    // Pulse animation for the orb
    gsap.to(".ai-orb", {
      boxShadow: "0 0 30px 5px rgba(var(--color-primary), 0.6)",
      scale: 1.05,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Rotating rings animation
    gsap.to(".ring-1", {
      rotate: 360,
      duration: 30,
      repeat: -1,
      ease: "none",
    });

    gsap.to(".ring-2", {
      rotate: -360,
      duration: 20,
      repeat: -1,
      ease: "none",
    });

    // Particle animation
    const particles = document.querySelectorAll(".particle");
    particles.forEach((particle) => {
      gsap.to(particle, {
        x: `random(-100, 100)`,
        y: `random(-100, 100)`,
        opacity: `random(0.1, 0.5)`,
        scale: `random(0.5, 1.5)`,
        duration: `random(10, 20)`,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });

    // Feature cards staggered animation
    if (featureCardsRef.current) {
      gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: featureCardsRef.current,
            start: "top 70%",
            preventOverlaps: true,
            fastScrollEnd: true,
          },
        }
      );
    }

    // Clean up
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-gradient-to-b from-black via-black/95 to-black/90 relative overflow-hidden py-24 md:py-32"
    >
      {/* Particle background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`particle absolute w-${
              Math.floor(Math.random() * 4) + 2
            } h-${
              Math.floor(Math.random() * 4) + 2
            } rounded-full bg-primary/10`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      {/* Glowing accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header section */}
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Brain size={16} className="text-primary" />
            </div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              AI-Powered Intelligence
            </span>
          </div>

          <h1 className="chat-title text-white font-bold text-4xl md:text-6xl lg:text-7xl text-center mb-6 tracking-tight">
            <span className="inline-block">Think Smarter.</span>{" "}
            <span className="inline-block">Chat</span>{" "}
            <span className="inline-block relative">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                Better.
              </span>
              <span className="absolute -bottom-1.5 left-0 w-full h-3 bg-primary/10 rounded-full blur-sm"></span>
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl text-center max-w-2xl mb-12">
            Experience limitless AI conversations with our advanced neural
            engine. From simple questions to complex code generation, we&apos;ve
            got you covered.
          </p>
        </div>

        {/* AI Orb Visualization */}
        <div className="relative max-w-5xl mx-auto mb-24 flex items-center justify-center">
          <div className="relative">
            {/* Outer rings */}
            <div className="ring-1 absolute inset-0 border-2 border-dashed border-primary/20 rounded-full w-[300px] h-[300px] md:w-[400px] md:h-[400px] -m-[150px] md:-m-[200px]"></div>
            <div className="ring-2 absolute inset-0 border border-primary/10 rounded-full w-[240px] h-[240px] md:w-[320px] md:h-[320px] -m-[120px] md:-m-[160px]"></div>

            {/* AI Orb */}
            <div className="ai-orb relative w-[120px] h-[120px] md:w-[160px] md:h-[160px] rounded-full bg-gradient-to-br from-primary/80 to-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(var(--color-primary),0.3)]">
              <Brain size={48} className="text-white" />

              {/* Floating feature icons */}
              <div className="floating-element absolute -top-16 -left-8 w-12 h-12 rounded-full bg-black/80 border border-gray-800 flex items-center justify-center">
                <MessageSquare size={20} className="text-primary" />
              </div>
              <div className="floating-element absolute top-8 -right-16 w-12 h-12 rounded-full bg-black/80 border border-gray-800 flex items-center justify-center">
                <Code size={20} className="text-primary" />
              </div>
              <div className="floating-element absolute -bottom-12 -right-4 w-12 h-12 rounded-full bg-black/80 border border-gray-800 flex items-center justify-center">
                <Sparkles size={20} className="text-primary" />
              </div>
              <div className="floating-element absolute -bottom-4 -left-16 w-12 h-12 rounded-full bg-black/80 border border-gray-800 flex items-center justify-center">
                <Lightbulb size={20} className="text-primary" />
              </div>
            </div>

            {/* Connection lines */}
            <div className="absolute inset-0 w-full h-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 200 200"
                className="absolute inset-0"
              >
                <line
                  x1="60"
                  y1="60"
                  x2="30"
                  y2="30"
                  stroke="rgba(var(--color-primary), 0.3)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <line
                  x1="140"
                  y1="60"
                  x2="170"
                  y2="30"
                  stroke="rgba(var(--color-primary), 0.3)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <line
                  x1="140"
                  y1="140"
                  x2="170"
                  y2="170"
                  stroke="rgba(var(--color-primary), 0.3)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <line
                  x1="60"
                  y1="140"
                  x2="30"
                  y2="170"
                  stroke="rgba(var(--color-primary), 0.3)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Features */}
        <div
          ref={featureCardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16"
        >
          {[
            {
              icon: <MessageSquare className="text-primary" size={24} />,
              title: "Natural Conversations",
              description:
                "Engage in fluid, context-aware conversations that feel remarkably human. Our AI understands nuance, remembers previous exchanges, and responds intelligently to complex queries.",
            },
            {
              icon: <Code className="text-primary" size={24} />,
              title: "Code Generation",
              description:
                "Transform ideas into code with our AI coding assistant. Generate production-ready code snippets, debug existing code, and get step-by-step explanations for any programming concept.",
            },
            {
              icon: <Sparkles className="text-primary" size={24} />,
              title: "Creative Companion",
              description:
                "Unlock your creativity with an AI that helps brainstorm ideas, refine concepts, and explore new possibilities. Perfect for writers, designers, and anyone seeking creative inspiration.",
            },
            {
              icon: <Cpu className="text-primary" size={24} />,
              title: "Advanced Neural Engine",
              description:
                "Powered by state-of-the-art large language models, our AI delivers responses with unprecedented accuracy, depth, and relevance across a wide range of topics and use cases.",
            },
            {
              icon: <Lock className="text-primary" size={24} />,
              title: "Privacy-Focused",
              description:
                "Your conversations remain private and secure. We employ end-to-end encryption and strict data policies to ensure your information stays confidential and protected.",
            },
            {
              icon: <RefreshCw className="text-primary" size={24} />,
              title: "Continuous Learning",
              description:
                "Our AI evolves with every interaction, constantly improving its knowledge and capabilities. Benefit from regular updates that enhance performance and expand functionality.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card bg-gray-900/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800/50 hover:border-primary/30 transition-all duration-300 group hover:bg-gray-900/50 hover:translate-y-[-5px]"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors border border-primary/20">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20 text-center">
          {[
            { value: "10M+", label: "Conversations" },
            { value: "99.9%", label: "Accuracy Rate" },
            { value: "500K+", label: "Active Users" },
            { value: "24/7", label: "Availability" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-900/20 backdrop-blur-sm p-6 rounded-xl border border-gray-800/30"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
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
            className="relative inline-block"
          >
            {/* Glow effect behind button */}
            <div className="absolute -inset-1 bg-primary/20 rounded-xl blur-md"></div>

            <Button
              size="lg"
              className="relative hover:bg-primary/90 text-white bg-black dark:bg-white dark:text-black cursor-pointer group px-8 py-7 h-auto text-base rounded-xl"
            >
              Experience AI Chat
              <Zap className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
            </Button>
            <p className="text-gray-400 text-sm mt-4">
              No technical knowledge required. Start chatting with our AI
              assistant instantly.
            </p>
          </motion.div>
        </div>

        {/* Testimonials */}
        <div className="mt-24 max-w-5xl mx-auto">
          <h2 className="text-center text-white text-2xl md:text-3xl font-bold mb-12">
            What Our Users Are Saying
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "This AI assistant has completely transformed how I approach my coding projects. The code suggestions are spot-on and save me hours of work.",
                author: "Alex Chen",
                role: "Software Developer",
              },
              {
                quote:
                  "I use Curious.AI daily for research and brainstorming. It's like having a brilliant colleague available 24/7 who never gets tired of my questions.",
                author: "Sarah Johnson",
                role: "Content Strategist",
              },
              {
                quote:
                  "As a student, this tool has been invaluable for helping me understand complex concepts and improve my writing. It explains things in a way that's easy to grasp.",
                author: "Michael Torres",
                role: "Graduate Student",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800/50 relative"
              >
                <div className="absolute -top-3 -left-3 text-4xl text-primary opacity-30">
                  &quot;
                </div>
                <p className="text-gray-300 mb-4 relative z-10">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <span className="text-primary font-medium">
                      {testimonial.author[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {testimonial.author}
                    </p>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
