"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { MAX_FREE_COUNT } from "@/constants";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { useProModel } from "@/hooks/useProModel";

interface freeCounterProps {
  apiLimitCount: number;
}

export const FreeCounter = ({ apiLimitCount }: freeCounterProps) => {
  const proModel = useProModel()
  const [mounted, setMounted] = useState(false); // preventing hydration error

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  return (
    <div className="px-3">
      <Card className="bg-white/10 border-0">
        <CardContent className="py-6">
          <div className="text-center text-white text-sm mb-4 space-y-2">
            <p>
              {apiLimitCount} / {MAX_FREE_COUNT} Free Generations
            </p>
            <Progress
              className="h-3 bg-white"
              value={(apiLimitCount / MAX_FREE_COUNT) * 100}
            />
          </div>
          <Button onClick={proModel.onOpen} variant="premium" className="w-full">
            Upgrade <Zap className="w-4 h-4 ml-2 fill-white" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
