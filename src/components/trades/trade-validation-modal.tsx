"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TradeValidationForm from "@/components/trades/trade-validation-form";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TradeValidationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function TradeValidationModal({
  isOpen,
  onOpenChange,
  onComplete,
}: TradeValidationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl">New Trade</DialogTitle>
          <DialogDescription>
            Enter your trade parameters to validate entry conditions.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="long" className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted rounded-xl">
              <TabsTrigger
                value="long"
                className="rounded-lg h-10 data-[state=active]:bg-gain/10 data-[state=active]:text-gain font-medium transition-all"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Long
              </TabsTrigger>
              <TabsTrigger
                value="short"
                className="rounded-lg h-10 data-[state=active]:bg-loss/10 data-[state=active]:text-loss font-medium transition-all"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Short
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="long" className="p-6 pt-4 mt-0">
            <TradeValidationForm tradeType="long" onComplete={onComplete} />
          </TabsContent>

          <TabsContent value="short" className="p-6 pt-4 mt-0">
            <TradeValidationForm tradeType="short" onComplete={onComplete} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
