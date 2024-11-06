
import Heading from "@/components/heading";
import SubscriptionButton from "@/components/subscriptionButton";
import { checkSubscription } from "@/lib/subscription";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const isPro = await checkSubscription();
  return (
    <div>
      <Heading
        title="Settings"
        description="Manage your account"
        icon={Settings}
        iconColor="text-gray-700"
        bgColor="bg-gray-700/10"
      />

      <div className="px-4 lg:px-8 space-y-4">
        <div className="text-muted-foreground text-sm">
          {isPro
            ? "You are a curious PRO user"
            : "You are not a curious PRO user"}
        </div>
        <SubscriptionButton isPro={isPro} />
      </div>
    </div>
  );
}
