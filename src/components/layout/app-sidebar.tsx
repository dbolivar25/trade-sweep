"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  Settings,
  Zap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./theme-toggle";
import { AuthToggle } from "./auth-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    name: "Trades",
    icon: TrendingUp,
    href: "/trades",
  },
  {
    name: "Watchlist",
    icon: LineChart,
    href: "/watchlist",
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="p-4 pb-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
            <Zap className="w-5 h-5 text-accent" />
            <div className="absolute inset-0 rounded-xl bg-accent/5 blur-sm" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
                TradeSweep
              </span>
              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
                Precision Trading
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                  className={cn(
                    "relative h-11 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent"
                  )}
                >
                  <Link href={item.href} className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors shrink-0",
                        isActive
                          ? "text-accent"
                          : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "font-medium transition-colors",
                        isActive
                          ? "text-sidebar-foreground"
                          : "text-sidebar-foreground/70"
                      )}
                    >
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <SidebarTrigger className="h-9 w-9 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors" />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "h-8 w-8 ring-2 ring-sidebar-accent rounded-full",
                    userButtonPopoverCard: "bg-popover border-border",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <AuthToggle />
            </SignedOut>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
