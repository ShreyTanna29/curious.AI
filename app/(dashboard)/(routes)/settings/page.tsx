"use client";
import Heading from "@/components/heading";
import Themes from "@/components/themes";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <Heading
        title="Settings"
        description="Manage your account"
        icon={Settings}
        iconColor="text-gray-700 dark:text-white"
        bgColor="bg-gray-700/10 dark:bg-white/10 "
      />

      <div className="flex gap-4 items-center ml-6">
        <h1>Theme Preferences : </h1>
        <Themes />
      </div>

      {/* <div className="px-4 lg:px-8 space-y-4">
        <div className="text-muted-foreground text-sm">
          {isPro
            ? "You are a curious PRO user"
            : "You are not a curious PRO user"}
        </div>
        <SubscriptionButton isPro={isPro} />
      </div> */}
    </div>
  );
}
