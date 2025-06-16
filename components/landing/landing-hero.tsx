"use client";
import { signIn, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { ArrowRight, Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingDots from "../loaders/LoadingDots";
import { motion } from "framer-motion";

// Shooting star component
const ShootingStar = ({ delay = 0, direction = "left" }) => {
  // Calculate start and end positions based on direction
  const getPositions = () => {
    if (direction === "left") {
      return {
        startX: 100, // Start from right edge
        startY: Math.random() * 60, // Random height
        endX: -20, // End beyond left edge
        endY: Math.random() * 60 + 20, // Slightly lower end point
        angle: Math.random() * 20 + 20, // 20-40 degrees
      };
    } else {
      return {
        startX: -20, // Start from left edge
        startY: Math.random() * 60, // Random height
        endX: 100, // End beyond right edge
        endY: Math.random() * 60 + 20, // Slightly lower end point
        angle: Math.random() * 20 + 140, // 140-160 degrees
      };
    }
  };

  const { startX, startY, endX, endY, angle } = getPositions();
  const length =
    Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) * 1.2; // 120% of distance

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        width: length,
        height: 2,
        background:
          "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 20%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
        transform: `rotate(${angle}deg)`,
        transformOrigin: "left center",
        filter: "blur(1px)",
      }}
      initial={{
        opacity: 0,
        x: 0,
        y: 0,
      }}
      animate={{
        opacity: [0, 1, 0],
        x: [0, endX - startX],
        y: [0, endY - startY],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 10 + 15,
        ease: "easeIn",
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-white/30 blur-[2px]" />
    </motion.div>
  );
};

// Twinkling star component
const TwinklingStar = ({ delay = 0 }) => {
  const size = Math.random() * 2 + 1;
  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        width: size,
        height: size,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 60}%`,
        filter: "blur(0.5px)",
      }}
      animate={{
        opacity: [0.2, 0.6, 0.2],
        scale: [1, 1.4, 1],
      }}
      transition={{
        duration: Math.random() * 1.5 + 1,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Animated background particles
const AnimatedBackground = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 15,
    delay: Math.random() * 5,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                         linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(circle at center, black, transparent 80%)",
        }}
      />

      {/* Shooting stars - alternating directions */}
      {[...Array(4)].map((_, i) => (
        <ShootingStar
          key={`shooting-left-${i}`}
          delay={i * 4}
          direction="left"
        />
      ))}
      {[...Array(4)].map((_, i) => (
        <ShootingStar
          key={`shooting-right-${i}`}
          delay={i * 4 + 2}
          direction="right"
        />
      ))}

      {/* Twinkling stars */}
      {[...Array(25)].map((_, i) => (
        <TwinklingStar key={`twinkle-${i}`} delay={i * 0.1} />
      ))}

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/30 backdrop-blur-sm"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            filter: "blur(0.5px)",
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Glowing orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full bg-primary/10 backdrop-blur-3xl"
          style={{
            width: 400 + i * 150,
            height: 400 + i * 150,
            left: `${20 + i * 30}%`,
            top: `${30 + i * 10}%`,
            filter: "blur(20px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15), transparent 70%)",
        }}
        animate={{
          background: [
            "radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.15), transparent 70%)",
            "radial-gradient(circle at 70% 70%, rgba(99, 102, 241, 0.15), transparent 70%)",
            "radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.15), transparent 70%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default function LandingHero() {
  const [loading, setLoading] = useState(false);
  const { status } = useSession();
  const isSignedIn = status === "authenticated";
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-black">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Animated background */}
        <AnimatedBackground />

        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Text focus gradient */}
        <div className="absolute inset-0">
          {/* Light/Dark mode gradient focus */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] rounded-full bg-gradient-light dark:bg-gradient-dark"
            style={{
              filter: "blur(80px)",
            }}
          />
          {/* Additional corner fade for elegance */}
          <div
            className="absolute inset-0 bg-corner-fade-light dark:bg-corner-fade-dark"
            style={{
              maskImage:
                "radial-gradient(circle at 50% 50%, black 30%, transparent 70%)",
            }}
          />
          {/* Ambient light for depth */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1000px] rounded-full opacity-15 bg-ambient-light dark:bg-ambient-dark"
            style={{
              filter: "blur(60px)",
            }}
          />
        </div>

        {/* Subtle vignette for focus */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.05)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.13)_100%)]" />
      </div>

      {/* Main content with higher z-index */}
      <div className="container relative mx-auto px-4 min-h-screen flex flex-col items-center justify-center z-10">
        <div className="max-w-2xl mx-auto text-center space-y-8 py-16 relative z-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100/80 dark:bg-black/40 border border-gray-200/40 dark:border-gray-800/40 shadow-lg backdrop-blur-sm"
          >
            <Brain className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Your Complete AI Workspace
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
              <span className="block">One Platform,</span>
              <span className="block mt-1 bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent">
                Infinite AI Possibilities
              </span>
            </h1>

            <p className="text-lg max-w-xl mx-auto text-gray-600 dark:text-gray-300">
              The ultimate AI toolkit that brings together image generation,
              code assistance, and intelligent chat in one seamless experience.
              Transform your workflow with the power of multiple AI models at
              your fingertips.
            </p>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              size="lg"
              className="group relative overflow-hidden px-6 py-5 rounded-lg text-base transition-all duration-300 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/10 hover:shadow-primary/20 dark:bg-white dark:text-gray-900 dark:hover:bg-white/90 dark:shadow-white/10 dark:hover:shadow-white/20"
              onClick={() => {
                setLoading(true);
                if (isSignedIn) {
                  router.push("/dashboard");
                } else {
                  signIn(undefined, { callbackUrl: "/dashboard" });
                }
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {!loading ? (
                  <>
                    {isSignedIn ? "Go to Dashboard" : "Start Creating"}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                ) : (
                  <LoadingDots />
                )}
              </span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-6 py-5 rounded-lg text-base border border-gray-200/40 dark:border-gray-800/40 text-gray-600 dark:text-gray-300 hover:bg-gray-100/40 dark:hover:bg-black/40 hover:border-gray-300/40 dark:hover:border-gray-700/40 shadow-lg backdrop-blur-sm transition-colors"
            >
              See AI Tools
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/40 dark:border-gray-800/40 backdrop-blur-sm"
          >
            {[
              { value: "10+", label: "AI Models" },
              { value: "24/7", label: "AI Assistance" },
              { value: "∞", label: "Possibilities" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Add these styles at the top of the file, after the imports */}
      <style jsx global>{`
        .bg-gradient-light {
          background: radial-gradient(
            circle at center,
            rgba(241, 245, 249, 0.18) 0%,
            rgba(37, 99, 235, 0.09) 40%,
            rgba(59, 130, 246, 0.06) 70%,
            transparent 100%
          );
        }
        .bg-gradient-dark {
          background: radial-gradient(
            circle at center,
            rgba(30, 41, 59, 0.18) 0%,
            rgba(37, 99, 235, 0.09) 40%,
            rgba(59, 130, 246, 0.06) 70%,
            transparent 100%
          );
        }
        .bg-corner-fade-light {
          background: radial-gradient(
            circle at 50% 50%,
            transparent 60%,
            rgba(0, 0, 0, 0.05) 100%
          );
        }
        .bg-corner-fade-dark {
          background: radial-gradient(
            circle at 50% 50%,
            transparent 60%,
            rgba(0, 0, 0, 0.12) 100%
          );
        }
        .bg-ambient-light {
          background: radial-gradient(
            circle at center,
            rgba(37, 99, 235, 0.04) 0%,
            rgba(59, 130, 246, 0.025) 40%,
            transparent 100%
          );
        }
        .bg-ambient-dark {
          background: radial-gradient(
            circle at center,
            rgba(37, 99, 235, 0.04) 0%,
            rgba(59, 130, 246, 0.025) 40%,
            transparent 100%
          );
        }
      `}</style>
    </div>
  );
}
