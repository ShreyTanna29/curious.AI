"use client";
import { signIn, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { ArrowRight, Star, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "../loaders/loadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function LandingHero() {
  const [loading, setLoading] = useState(false);
  const { status } = useSession();
  const isSignedIn = status === "authenticated" ? true : false;
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState("");

  useEffect(() => {
    setTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );
  }, []);

  // Images for the 3D card rotation
  const showcaseImages = [
    "/landing-images/A futuristic cityscape with fl.png",
    "/landing-images/A magical forest with glowing .png",
    "/landing-images/An astronaut riding a horse on.png",
  ];

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle mouse movement for parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "Dark Theme" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  }, []);

  // Rotate through showcase images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % showcaseImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [showcaseImages.length]);

  // Handle navigation
  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  // Calculate transform style only on client-side
  const getCardTransform = () => {
    if (!isMounted) return {};

    return {
      transform: `rotateY(${
        (mousePosition.x - windowSize.width / 2) / 50
      }deg) rotateX(${-(mousePosition.y - windowSize.height / 2) / 50}deg)`,
      transition: "transform 0.1s ease-out",
    };
  };

  const isLightMode = isMounted && theme === "light";

  return (
    <div
      className={`min-h-screen w-full relative flex flex-col items-center justify-center overflow-hidden ${
        isLightMode
          ? "bg-gradient-to-b from-gray-50 via-gray-100 to-white"
          : "bg-gradient-to-b from-black via-gray-900 to-black"
      }`}
      onMouseMove={handleMouseMove}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient mesh */}
        <div
          className={`absolute inset-0 ${
            isLightMode ? "opacity-20" : "opacity-30"
          }`}
          style={
            {
              backgroundImage: isLightMode
                ? "radial-gradient(circle at var(--x) var(--y), rgba(var(--color-primary-rgb), 0.6) 0%, transparent 60%)"
                : "radial-gradient(circle at var(--x) var(--y), rgba(var(--color-primary-rgb), 0.8) 0%, transparent 60%)",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              "--x": `${mousePosition.x}px`,
              "--y": `${mousePosition.y}px`,
            } as any
          }
        />

        {/* Animated stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 ${
                isLightMode ? "bg-primary/40" : "bg-white"
              } rounded-full`}
              initial={{ opacity: 0.1 + Math.random() * 0.5 }}
              animate={{
                opacity: [
                  0.1 + Math.random() * 0.5,
                  0.5 + Math.random() * 0.5,
                  0.1 + Math.random() * 0.5,
                ],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left side - Text content */}
        <motion.div
          className="lg:w-1/2 text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-medium text-primary">
              AI-Powered Platform
            </span>
          </motion.div>

          {/* Main heading */}
          <h1
            className={`text-4xl md:text-6xl font-bold ${
              isLightMode ? "text-gray-900" : "text-white"
            } leading-tight mb-6`}
          >
            <span className="block">Unleash the</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary">
              power of AI
            </span>
          </h1>

          {/* Description */}
          <p
            className={`${
              isLightMode ? "text-gray-600" : "text-gray-400"
            } text-lg mb-8 max-w-lg`}
          >
            Generate stunning visuals, write flawless code, and chat with smart
            intelligence – all in one powerful platform.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              className={`relative overflow-hidden group hover:bg-primary/90 ${
                isLightMode
                  ? "text-white bg-primary dark:text-black dark:bg-white"
                  : "text-white bg-black dark:text-black dark:bg-white"
              } px-6 py-6 h-auto rounded-xl text-lg`}
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
                {isSignedIn ? "Visit Dashboard" : "Get Started"}{" "}
                {loading ? (
                  <LoadingSpinner className="border-white" />
                ) : (
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                )}
              </span>
            </Button>

            <Button
              variant="outline"
              className={`${
                isLightMode
                  ? "border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  : "border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
              } px-6 py-6 h-auto rounded-xl text-lg`}
            >
              Explore Features
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-md">
            {[
              { value: "10M+", label: "Images Generated" },
              { value: "5M+", label: "Code Snippets" },
              { value: "500K+", label: "Active Users" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <motion.div
                  className={`text-2xl font-bold ${
                    isLightMode ? "text-gray-900" : "text-white"
                  } mb-1`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
                >
                  {stat.value}
                </motion.div>
                <motion.div
                  className={`text-xs ${
                    isLightMode ? "text-gray-500" : "text-gray-500"
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
                >
                  {stat.label}
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right side - 3D Showcase */}
        <motion.div
          className="lg:w-1/2 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* 3D Card with parallax effect */}
          <div
            className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden perspective-1000"
            style={getCardTransform()}
          >
            {/* Card inner with shadow and border effects */}
            <div
              className={`absolute inset-0 rounded-2xl ${
                isLightMode
                  ? "bg-gradient-to-br from-gray-100 to-white"
                  : "bg-gradient-to-br from-gray-900 to-black"
              } p-1`}
            >
              <div
                className={`absolute inset-0 rounded-xl overflow-hidden ${
                  isLightMode ? "bg-white" : "bg-black"
                }`}
              >
                {/* Image showcase with crossfade */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={showcaseImages[currentImageIndex]}
                      alt="AI generated image"
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Overlay with prompt */}
                <div
                  className={`absolute bottom-0 left-0 right-0 ${
                    isLightMode
                      ? "bg-gradient-to-t from-black/60 to-transparent"
                      : "bg-gradient-to-t from-black/80 to-transparent"
                  } p-4`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-primary" />
                    <span className="text-xs text-gray-300">AI Generated</span>
                  </div>
                  <p className="text-sm text-white font-medium">
                    {currentImageIndex === 0 &&
                      "A futuristic cityscape with flying cars and neon lights"}
                    {currentImageIndex === 1 &&
                      "A magical forest with glowing mushrooms and fairy lights"}
                    {currentImageIndex === 2 &&
                      "An astronaut riding a horse on Mars"}
                  </p>
                </div>
              </div>
            </div>

            {/* Reflection effect */}
            <div
              className={`absolute inset-0 rounded-2xl ${
                isLightMode
                  ? "bg-gradient-to-b from-transparent to-black/5"
                  : "bg-gradient-to-b from-transparent to-white/10"
              } pointer-events-none`}
            ></div>

            {/* Highlight dots */}
            <div className="absolute top-3 left-3 flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          </div>

          {/* Feature badges */}
          <div
            className={`absolute -bottom-4 -right-4 ${
              isLightMode
                ? "bg-white/80 backdrop-blur-md border border-gray-200"
                : "bg-gray-900/80 backdrop-blur-md border border-gray-800"
            } rounded-lg px-3 py-2 flex items-center gap-2`}
          >
            <Star size={14} className="text-yellow-500" />
            <span
              className={`text-xs ${
                isLightMode ? "text-gray-800" : "text-white"
              }`}
            >
              Premium Quality
            </span>
          </div>

          <div
            className={`absolute -top-4 -left-4 ${
              isLightMode
                ? "bg-white/80 backdrop-blur-md border border-gray-200"
                : "bg-gray-900/80 backdrop-blur-md border border-gray-800"
            } rounded-lg px-3 py-2 flex items-center gap-2`}
          >
            <Zap size={14} className="text-primary" />
            <span
              className={`text-xs ${
                isLightMode ? "text-gray-800" : "text-white"
              }`}
            >
              Instant Generation
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom wave divider */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-16 bg-[url('/wave-divider.svg')] bg-repeat-x bg-bottom ${
          isLightMode ? "opacity-5" : "opacity-10"
        }`}
      ></div>
    </div>
  );
}
