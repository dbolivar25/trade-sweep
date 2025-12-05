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
  PanelLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader
        className={cn(
          "pb-6 pt-4",
          isCollapsed ? "px-2 items-center" : "px-4"
        )}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors shrink-0"
          >
            <Zap className="w-5 h-5 text-accent group-hover:opacity-0 transition-opacity" />
            <PanelLeft className="w-5 h-5 text-accent absolute opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 rounded-xl bg-accent/5 blur-sm" />
          </button>
          {!isCollapsed && (
            <Link href="/" className="group">
              <span className="text-lg font-semibold tracking-tight text-sidebar-foreground group-hover:text-accent transition-colors">
                TradeSweep
              </span>
            </Link>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className={cn("px-3", isCollapsed && "px-0 items-center")}>
        <SidebarMenu className={cn("space-y-1", isCollapsed && "items-center space-y-3")}>
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

      <SidebarFooter
        className={cn(
          "border-t border-sidebar-border",
          isCollapsed ? "p-2" : "p-3"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            isCollapsed
              ? "flex-col gap-3 justify-center"
              : "justify-between"
          )}
        >
          <ThemeToggle />
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-2 ring-sidebar-accent rounded-full",
                  userButtonPopoverCard: "bg-popover border-border",
                },
              }}
            />
          </SignedIn>
          <SignedOut>
            <AuthToggle />
          </SignedOut>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
