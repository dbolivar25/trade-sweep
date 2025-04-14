"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockRecentTrades } from "@/lib/data/mock-data";
import TradeValidationModal from "../trades/trade-validation-modal";
import { useState } from "react";

export default function RecentTradesCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>Your recent trading history</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            View All
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            New +
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        <div className="space-y-3">
          {mockRecentTrades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
            >
              <div>
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${trade.type === "Long" ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <div className="font-medium">{trade.type}</div>
                </div>
                <div className="text-xs text-stone-500">{trade.time}</div>
              </div>
              <div className="text-right">
                <div
                  className={`font-medium ${trade.profit.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                >
                  {trade.profit}
                </div>
                <div className="text-xs text-stone-500">
                  {trade.entry} → {trade.exit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <TradeValidationModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </Card>
  );
}
