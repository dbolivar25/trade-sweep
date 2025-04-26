"use client";

import { ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export function AuthToggle({
  className,
  // onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-7", className)}
          {...props}
        >
          <ChevronUp className="h-[1.2rem] w-[1.2rem]" />
        </Button>
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
  );
}
