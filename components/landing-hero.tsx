"use client";
import { signIn, useSession } from "next-auth/react";
import { BackgroundBeams } from "./background-beams";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingHero() {
  const { status } = useSession()
  const isSignedIn = status === "authenticated" ? true : false
  const router = useRouter()

  return (
    <div className="h-full w-full bg-neutral-950 relative flex flex-col items-center justify-center antialiased ">
      <div className="max-w-full  p-4">
        <h1 className="relative z-10 text-2xl md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
          Unleash the power of AI
        </h1>
        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
          Generate stunning visuals, write flawless code, and chat with smart intelligence – all for free!
        </p>
      </div>

      <Button
        className="relative z-50 gap-4 flex bg-[#2a2a2a] hover:bg-transparent text-white "
        onClick={() => {
          if (isSignedIn) {
            router.push("/dashboard")
          } else {
            signIn('google', { callbackUrl: '/dashboard' });
          }
        }}
      >
        {isSignedIn ? "Visit Dashboard" : "Get Started"} <ArrowRight />
      </Button>

      <BackgroundBeams />


    </div>
  );
}
