import LandingHero from "@/components/landing-hero";
import LandingImageSection from "@/components/landing-image-section";
import LandingNavbar from "@/components/landingNavbar";

function LandingPage() {
  return (
    <div className="h-full w-full ">
      <LandingNavbar />
      <div className="h-full w-full">
        <LandingHero />
      </div>
      <LandingImageSection />
    </div>
  );
}

export default LandingPage;
