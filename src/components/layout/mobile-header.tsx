"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Zap, PanelLeft } from "lucide-react";

export function MobileHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:hidden">
      <button
        onClick={toggleSidebar}
        className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors"
      >
        <Zap className="w-5 h-5 text-accent group-hover:opacity-0 transition-opacity" />
        <PanelLeft className="w-5 h-5 text-accent absolute opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 rounded-xl bg-accent/5 blur-sm" />
      </button>
      <span className="font-semibold tracking-tight">TradeSweep</span>
    </header>
  );
}
