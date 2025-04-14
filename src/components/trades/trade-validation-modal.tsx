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

interface TradeValidationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TradeValidationModal({
  isOpen,
  onOpenChange,
}: TradeValidationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Trade Validation</DialogTitle>
          <DialogDescription>
            Select trade type and enter parameters to validate your entry.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="long" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="long">Long (Buy)</TabsTrigger>
            <TabsTrigger value="short">Short (Sell)</TabsTrigger>
          </TabsList>

          <TabsContent value="long" className="pt-4">
            <TradeValidationForm
              tradeType="long"
              onComplete={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="short" className="pt-4">
            <TradeValidationForm
              tradeType="short"
              onComplete={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
