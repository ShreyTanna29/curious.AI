"use client";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Sparkles, Terminal, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const codeSnippets = [
  {
    language: "JavaScript",
    filename: "recommendation.js",
    code: `// Generate personalized product recommendations
async function getRecommendations(userId) {
  const userPreferences = await fetchUserData(userId);
  
  // Use AI to analyze purchase history
  const recommendations = await curious.ai.analyze({
    data: userPreferences,
    model: "recommendation-engine",
    count: 5
  });
  
  return recommendations.map(item => ({
    id: item.id,
    name: item.name,
    confidence: item.score,
    reason: item.explanation
  }));
}`,
  },
  {
    language: "Python",
    filename: "data_analysis.py",
    code: `# Analyze customer sentiment from reviews
import pandas as pd
from curious_ai import NLPProcessor

def analyze_customer_sentiment(reviews_data):
    # Load the dataset
    df = pd.read_csv(reviews_data)
    
    # Initialize our AI sentiment analyzer
    nlp = NLPProcessor(model="sentiment-v2")
    
    # Process each review
    results = []
    for review in df['text']:
        sentiment = nlp.analyze(review)
        results.append({
            'text': review,
            'sentiment': sentiment.label,
            'confidence': sentiment.score,
            'key_phrases': sentiment.extract_key_phrases()
        })
    
    return pd.DataFrame(results)`,
  },
  {
    language: "TypeScript",
    filename: "api.ts",
    code: `// Create a REST API with TypeScript
import express, { Request, Response } from 'express';
import { CuriousAI } from '@curious/sdk';

const app = express();
const port = process.env.PORT || 3000;
const ai = new CuriousAI(process.env.CURIOUS_API_KEY);

app.use(express.json());

app.post('/generate-code', async (req: Request, res: Response) => {
  try {
    const { prompt, language } = req.body;
    
    const result = await ai.generateCode({
      prompt,
      language,
      includeExplanation: true,
    });
    
    res.json({
      success: true,
      code: result.code,
      explanation: result.explanation
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});`,
  },
];

export default function LandingCodeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const codeBlockRef = useRef<HTMLDivElement>(null);
  const [activeSnippet, setActiveSnippet] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [typedCode, setTypedCode] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);

  const animationContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(animationContainerRef, {
    once: false,
    amount: 0.3,
  });

  // Typing effect
  useEffect(() => {
    // Only run the typing animation if the section is in view
    if (!isTyping || !isInView) return;

    const currentSnippet = codeSnippets[activeSnippet].code;
    if (cursorPosition < currentSnippet.length) {
      const timer = setTimeout(() => {
        setTypedCode(currentSnippet.substring(0, cursorPosition + 1));
        setCursorPosition(cursorPosition + 1);
      }, Math.random() * 30 + 10); // Random typing speed for realism

      return () => clearTimeout(timer);
    } else {
      // When typing is complete, wait and switch to next snippet
      const timer = setTimeout(() => {
        setIsTyping(false);
        setTimeout(() => {
          setCursorPosition(0);
          setTypedCode("");
          setActiveSnippet((activeSnippet + 1) % codeSnippets.length);
          setIsTyping(true);
        }, 3000);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [cursorPosition, isTyping, activeSnippet, isInView]);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const codeBlock = codeBlockRef.current;

    if (!section || !title || !codeBlock) return;

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

    // Code block animation
    gsap.fromTo(
      codeBlock,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        delay: 0.3,
        scrollTrigger: {
          trigger: section,
          start: "top 60%",
        },
      }
    );

    // Particle animations
    gsap.to(".particle", {
      y: -20,
      x: "random(-10, 10)",
      opacity: 0,
      duration: "random(1.5, 3)",
      repeat: -1,
      repeatRefresh: true,
      ease: "power1.out",
      stagger: 0.2,
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 md:py-40 overflow-hidden bg-gradient-to-b from-background to-background/80"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`particle absolute w-1 h-1 rounded-full bg-primary/80 opacity-70`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              scale: Math.random() * 0.5 + 0.5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap size={14} className="text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">
              AI-POWERED CODE GENERATION
            </span>
          </div>

          <h1
            ref={titleRef}
            className="dark:text-white font-bold text-4xl md:text-6xl lg:text-7xl text-center mb-6 tracking-tight opacity-0"
          >
            <span className="inline-block">Generate</span>{" "}
            <span className="inline-block relative">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                Flawless Code
              </span>
              <span className="absolute -bottom-1.5 left-0 w-full h-3 bg-primary/10 rounded-full blur-sm"></span>
            </span>{" "}
            <span className="inline-block">in Seconds</span>
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl text-center max-w-2xl mb-12">
            Transform your ideas into production-ready code with our advanced
            AI. Get clean, efficient, and well-documented code in any language.
          </p>

          <div
            ref={(el) => {
              // Assign to both refs
              if (el) {
                (
                  codeBlockRef as React.MutableRefObject<HTMLElement | null>
                ).current = el;
                (
                  animationContainerRef as React.MutableRefObject<HTMLElement | null>
                ).current = el;
              }
            }}
            className="w-full max-w-4xl opacity-0 mb-16"
          >
            <div className="bg-black/90 rounded-xl shadow-2xl overflow-hidden border border-gray-800/50 backdrop-blur-sm">
              {/* Code editor header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900/90 border-b border-gray-800/50">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/90"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/90"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/90"></div>
                </div>
                <div className="flex items-center px-3 py-1 rounded-md bg-gray-800/50 border border-gray-700/30">
                  <span className="text-xs text-gray-400 font-mono">
                    {codeSnippets[activeSnippet].filename}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-primary/80"></span>
                    <span>AI Assisted</span>
                  </div>
                </div>
              </div>

              {/* Tab bar */}
              <div className="flex items-center px-4 py-1 bg-gray-900/70 border-b border-gray-800/50 overflow-x-auto">
                {codeSnippets.map((snippet, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveSnippet(index);
                      setCursorPosition(0);
                      setTypedCode("");
                      setIsTyping(true);
                    }}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors",
                      activeSnippet === index
                        ? "text-white bg-black/40 border-t border-x border-gray-700/30"
                        : "text-gray-400 hover:text-gray-300"
                    )}
                  >
                    {snippet.filename}
                  </button>
                ))}
              </div>

              {/* Line numbers and code */}
              <div className="flex">
                {/* Line numbers */}
                <div className="py-4 px-2 text-right bg-black/40 text-gray-600 font-mono text-xs select-none">
                  {typedCode.split("\n").map((_, i) => (
                    <div key={i} className="pr-2">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Code content */}
                <div className="p-4 font-mono text-sm md:text-sm flex-1 overflow-x-auto">
                  <pre className="text-gray-300 whitespace-pre">
                    <code>
                      {typedCode}
                      <span className="inline-block w-[2px] h-[14px] bg-primary/80 animate-pulse"></span>
                    </code>
                  </pre>
                </div>
              </div>

              {/* AI suggestions */}
              <div className="px-4 py-3 bg-gray-900/80 border-t border-gray-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  <span className="text-xs text-gray-400">
                    AI Suggestion: Add error handling for better reliability
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary hover:text-primary/90 hover:bg-primary/10"
                >
                  Apply
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  icon: <Code className="text-primary" size={20} />,
                  title: "Multi-language Support",
                  description:
                    "Generate code in JavaScript, Python, TypeScript, Go, Rust and 20+ more languages",
                },
                {
                  icon: <Terminal className="text-primary" size={20} />,
                  title: "Contextual Understanding",
                  description:
                    "Our AI understands your project context and generates appropriate code",
                },
                {
                  icon: <Sparkles className="text-primary" size={20} />,
                  title: "Intelligent Refactoring",
                  description:
                    "Optimize and improve existing code with smart refactoring suggestions",
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
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-16 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Link href={"/signup"}>
                  <Button
                    size="lg"
                    className="hover:bg-primary/90 text-white bg-black dark:text-black dark:bg-white group px-6 py-6 h-auto text-base"
                  >
                    Try Code Generation
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <p className="text-muted-foreground text-sm mt-4">
                  No credit card required. Start generating code in seconds.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
