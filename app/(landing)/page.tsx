"use client"
import LandingFooter from "@/components/landing/landing-bottom";
import LandingChatSection from "@/components/landing/landing-chat-section";
import LandingCodeSection from "@/components/landing/landing-code-section";
import LandingHero from "@/components/landing/landing-hero";
import LandingImageSection from "@/components/landing/landing-image-section";
import LandingNavbar from "@/components/landing/landingNavbar";

function LandingPage() {
  return (
    <div className="h-full w-full bg-white dark:bg-black ">
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
