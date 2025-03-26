"use client";
import LandingFooter from "@/components/landing/landing-bottom";
import LandingChatSection from "@/components/landing/landing-chat-section";
import LandingCodeSection from "@/components/landing/landing-code-section";
import LandingHero from "@/components/landing/landing-hero";
import LandingImageSection from "@/components/landing/landing-image-section";
import LandingNavbar from "@/components/landing/landingNavbar";
import { motion } from "framer-motion";

function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        y: -20,
        transition: { duration: 0.5, ease: "easeInOut" },
      }}
      className="h-full w-full bg-white dark:bg-black "
    >
      <LandingNavbar />
      <div className="h-full w-full">
        <LandingHero />
      </div>
      <LandingImageSection />
      <LandingCodeSection />
      <LandingChatSection />
      <LandingFooter />
    </motion.div>
  );
}

export default LandingPage;
