"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/SignupLabel";
import { Input } from "@/components/ui/SignupInput";
import { cn } from "@/lib/utils";
import GoogleIcon from "@/components/icons/google";
import { signIn as SignInAuth } from "next-auth/react";
import Link from "next/link";
import LoadingSpinner from "../loaders/loadingSpinner";

export function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
      }
    }
  });

  const googleHandler = async () => {
    try {
      setGoogleLoading(true);
      await SignInAuth("google", { callbackUrl: "/dashboard" });
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      try {
        setLoading(true);
        setError("");
        const result = await SignInAuth("credentials", {
          email: formData.email,
          password: formData.password,
          callbackUrl: "/dashboard",
          redirect: false, // Add this to handle the error
        });

        if (result?.error) {
          setError(result.error);
        } else {
          window.location.href = "/dashboard";
        }
      } catch (ThisError: any) {
        console.log(ThisError);

        setError("Failed to sign in");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Email and password should not be empty");
    }
  };
  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Welcome to Curious.AI
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-1 dark:text-neutral-300">
        Sign in to your account
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            placeholder="projectmayhem@fc.com"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
            }}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
            }}
          />
        </LabelInputContainer>
        <p className="text-sm text-center text-red-500 mb-1">{error}</p>
        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          <div className="flex items-center justify-center w-full h-full">
            {loading ? (
              <LoadingSpinner className="border-white border-t-white/10" />
            ) : (
              <span>Sign in &rarr;</span>
            )}
          </div>
          <BottomGradient />
        </button>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        <div className="flex flex-col space-y-4">
          <button
            className=" relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
            type="button"
            onClick={() => googleHandler()}
          >
            {googleLoading ? <LoadingSpinner className="" /> : <GoogleIcon />}
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
              Google
            </span>

            <BottomGradient />
          </button>
        </div>
      </form>
      <p className="text-center text-black dark:text-white">
        Don&#39;t have an account?
        <Link href={"/signup"}>
          <span className="text-blue-500 ml-1 underline cursor-pointer">
            sign up
          </span>
        </Link>{" "}
      </p>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
