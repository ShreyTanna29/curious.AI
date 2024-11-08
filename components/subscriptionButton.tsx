"use client";
import axios from "axios";
import { useState } from "react";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import toast from "react-hot-toast";

interface subscriptionProps {
  isPro: boolean;
}
export default function SubscriptionButton({
  isPro = false,
}: subscriptionProps) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe");

      window.location.href = response.data.url;
    } catch (error) {
      console.log("SUBSCRIPTION BUTTON BILLING ERROR :: ", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button disabled={loading} variant="premium" onClick={onClick}>
      {isPro ? "Manage Subscription" : "Upgrade"}
      {!isPro && <Zap className="w-4 h-4 ml-2 fill-white" />}
    </Button>
  );
}
