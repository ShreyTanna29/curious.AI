"use client"
import LandingFooter from "@/components/landing-bottom";
import LandingChatSection from "@/components/landing-chat-section";
import LandingCodeSection from "@/components/landing-code-section";
import LandingHero from "@/components/landing-hero";
import LandingImageSection from "@/components/landing-image-section";
import LandingNavbar from "@/components/landingNavbar";
import { useEffect } from "react";

function LandingPage() {

  useEffect(() => {
    document.body.style.backgroundColor = "black"

    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  return (
    <div className="h-full w-full bg-black ">
      <LandingNavbar />
      <div className="h-full w-full">
        <LandingHero />
      </div>
      <LandingImageSection />
      <LandingCodeSection />
      <LandingChatSection />
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
