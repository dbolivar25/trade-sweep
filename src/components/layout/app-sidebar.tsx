import React from "react";
import {
  Home,
  BarChart3,
  List,
  Settings,
  User2,
  ChevronUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "../ui/separator";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const navItems = [
  { name: "Home", icon: Home, href: "/", active: false },
  { name: "Trades", icon: BarChart3, href: "/trades", active: false },
  { name: "Watchlist", icon: List, href: "/watchlist", active: false },
  { name: "Settings", icon: Settings, href: "/settings", active: false },
];

export function AppSidebar() {
  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <div className="px-3 py-2">
          <div className="text-xl font-bold">TradeSweep</div>
        </div>
      </SidebarHeader>

      <Separator className="mb-2" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={item.active}>
                    <a href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Separator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SignedOut>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 className="mr-auto" />
                    <ChevronUp />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end">
                  <DropdownMenuItem className="w-full" asChild>
                    <SignInButton mode="modal" />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="w-full" asChild>
                    <SignUpButton mode="modal" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedOut>
            <SignedIn>
              <SidebarMenuButton>
                <User2 className="mr-auto" />
                <UserButton
                  appearance={{
                    layout: {
                      shimmer: false,
                      animations: false,
                    },
                    elements: {
                      userButtonAvatarBox: "max-w-[1.5rem] max-h-[1.5rem]",
                    },
                  }}
                />
              </SidebarMenuButton>
            </SignedIn>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
