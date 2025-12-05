"use client";

import { useTimeProvider } from "@/lib/hooks/use-time-provider";
import { Calendar, Clock } from "lucide-react";

type HeroSectionProps = {
  userFirstName: string | null | undefined;
};

export function HeroSection({ userFirstName }: HeroSectionProps) {
  const { formattedTime } = useTimeProvider();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="relative animate-in">
      <div className="absolute -top-8 -left-12 w-48 h-48 md:w-96 md:h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 md:gap-3 text-muted-foreground mb-3 md:mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs md:text-sm font-medium">{formatDate()}</span>
          </div>
          <span className="text-border hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs md:text-sm font-mono">{formattedTime}</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight mb-3 md:mb-4">
          {getGreeting()},
          <br />
          <span className="text-accent">{userFirstName || "Trader"}</span>
        </h1>

        <p className="text-base md:text-lg text-muted-foreground max-w-sm md:max-w-md">
          Track your positions, validate trades, and monitor market movements
          with precision.
        </p>
      </div>
    </section>
  );
}
