"use client";
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/SignupLabel";
import { Input } from "@/components/ui/SignupInput";
import { cn } from "@/lib/utils";
import axios from "axios";
import { signIn } from "next-auth/react";
import Link from "next/link";
import GoogleIcon from "../icons/google";
import LoadingSpinner from "../loaders/loadingSpinner";

const isGoogleAuthEnabled =
  process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

export function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const googleHandler = async () => {
    try {
      setGoogleLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (thisError: any) {
      console.log(thisError);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password && formData.password === formData.confirmPassword) {
      try {
        setLoading(true);
        await axios.post("/api/signup", {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          password: formData.password,
        });

        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          callbackUrl: "/dashboard",
        });
      } catch (thisError: any) {
        console.log(thisError);

        const errorMessage = thisError.response?.data || "Something went wrong";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Password and confirm password should be same.");
    }
  };

  return (
    <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-2xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="grid min-h-[680px] md:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r border-slate-200 bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 p-10 text-white md:block dark:border-slate-800">
          <div className="relative z-10">
            <p className="text-sm font-semibold tracking-[0.2em] text-orange-100/80">
              CURIOUS.AI
            </p>
            <h2 className="mt-6 text-3xl font-semibold leading-tight">
              Create your account.
              <br />
              Start shipping ideas.
            </h2>
            <p className="mt-4 max-w-sm text-sm text-orange-100/90">
              Join to save chats, generate assets, and keep your projects in one place.
            </p>
          </div>
          <div className="absolute -bottom-20 left-10 h-60 w-60 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -right-16 top-14 h-56 w-56 rounded-full bg-yellow-200/30 blur-2xl" />
        </div>

        <div className="p-6 sm:p-10">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Sign up
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Set up your account in less than a minute.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <LabelInputContainer>
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstname"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value });
                  }}
                  placeholder="Tyler"
                  type="text"
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastname">Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value });
                  }}
                  id="lastname"
                  placeholder="Durden"
                  type="text"
                />
              </LabelInputContainer>
            </div>

            <LabelInputContainer>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                }}
              />
            </LabelInputContainer>

            <div className="grid gap-4 sm:grid-cols-2">
              <LabelInputContainer>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="********"
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                  }}
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  placeholder="********"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                  }}
                />
              </LabelInputContainer>
            </div>

            <p className="min-h-5 text-center text-sm text-red-500">{error}</p>

            <button
              className="relative block h-11 w-full rounded-lg bg-slate-900 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              type="submit"
              disabled={loading || googleLoading}
            >
              <div className="flex h-full w-full items-center justify-center">
                {loading ? (
                  <LoadingSpinner className="border-white border-t-white/20 dark:border-slate-900 dark:border-t-slate-900/20" />
                ) : (
                  <span>Create account</span>
                )}
              </div>
              <BottomGradient />
            </button>

            {isGoogleAuthEnabled && (
              <>
                <div className="my-2 flex items-center gap-3">
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    Or
                  </span>
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>

                <button
                  className="relative flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  type="button"
                  onClick={() => googleHandler()}
                  disabled={loading || googleLoading}
                >
                  {googleLoading ? (
                    <LoadingSpinner className="" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span>Continue with Google</span>
                  <BottomGradient />
                </button>
              </>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-slate-700 dark:text-slate-300">
            Already have an account?
            <Link href={"/signin"}>
              <span className="ml-1 cursor-pointer font-medium text-cyan-600 underline underline-offset-2 dark:text-cyan-400">
                Sign in
              </span>
            </Link>
          </p>
        </div>
      </div>
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
  return <div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>;
};
