"use client";
import { signIn, useSession } from "next-auth/react";
import { BackgroundBeams } from "../features/background-beams";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "../loaders/loadingSpinner";
import gsap from "gsap";

export default function LandingHero() {
  const [loading, setLoading] = useState(false);
  const { status } = useSession();
  const isSignedIn = status === "authenticated" ? true : false;
  const router = useRouter();

  useEffect(() => {
    //TODO: Don't know why gsap is not selecting all classes when given as input, tried many methods but didn't work, e.g. tried gsap.Array but it didn't work, try to fix this and make animations class based and write it in another file.
    gsap.to("#hero-title", {
      opacity: 1,
      duration: 5,
    });

    gsap.to(".slideUp", {
      opacity: 1,
      duration: 1,
      translateY: 0,
    });
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="h-full w-full relative flex flex-col items-center justify-center antialiased ">
      <div className="max-w-full  p-4">
        <h1
          className="relative z-10 text-2xl md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold opacity-0"
          id="hero-title"
        >
          Unleash the power of AI
        </h1>
        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10  slideUp opacity-0 translate-y-10">
          Generate stunning visuals, write flawless code, and chat with smart
          intelligence – all for free!
        </p>
      </div>

      <Button
        className="relative z-50 gap-4 flex bg-[#2a2a2a] hover:bg-black/70 hover:text-white dark:text-white dark:hover:bg-white/10 dark:hover:text-white slideUp opacity-0 translate-y-10"
        onClick={() => {
          setLoading(true);
          if (isSignedIn) {
            router.push("/dashboard");
          } else {
            setLoading(true);
            signIn(undefined, { callbackUrl: "/dashboard" });
          }
        }}
      >
        {isSignedIn ? "Visit Dashboard" : "Get Started"}{" "}
        {loading ? (
          <LoadingSpinner className=" border-white" />
        ) : (
          <ArrowRight />
        )}
      </Button>

      <BackgroundBeams />
    </div>
  );
}
