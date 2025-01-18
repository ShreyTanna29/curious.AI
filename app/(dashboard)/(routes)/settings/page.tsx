"use client";
import Heading from "@/components/extra/heading";
import Themes from "@/components/extra/themes";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/loaders/loadingSpinner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [deviceWidth, setDeviceWidth] = useState<number>(500)

  useEffect(() => {
    setDeviceWidth(window.innerWidth)
  }, [deviceWidth])
  return (
    <div>
      <Heading
        title="Settings"
        description="Manage your account"
        icon={Settings}
        iconColor="text-gray-700 dark:text-white"
        bgColor="bg-gray-700/10 dark:bg-white/10 "
      />
      <div className="w-full  flex flex-col justify-center gap-3">
        <div className="flex gap-4 items-center ml-6">
          <h1 className="font-bold">Theme Preferences : </h1>
          <Themes />
        </div>

        <div className="flex gap-4 items-center ml-6">
          <h1 className="font-bold">Account : </h1>
          <div className="flex flex-col sm:flex-row gap-4 ml-20 mt-4 md:mt-0">
            <Link href={"/user-profile"}>
              <Button
                variant={"outline"}
                className="rounded-lg dark:border-white"
                size={deviceWidth < 500 ? "sm" : "default"}
              >
                Manage Account
              </Button>
            </Link>

            <Button
              variant={"destructive"}
              className="rounded-lg dark:border-white"
              onClick={() => {
                setLoading(true)
                signOut({ callbackUrl: "/" })
              }}
              size={deviceWidth < 500 ? "sm" : "default"}
            >
              {loading ? <LoadingSpinner className="mr-2" /> : <LogOut className="mr-2 w-8" />} Logout
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
}
