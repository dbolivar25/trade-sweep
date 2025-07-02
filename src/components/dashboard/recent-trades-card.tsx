"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TradeValidationModal from "../trades/trade-validation-modal";
import TradeCompletionModal from "../trades/trade-completion-modal";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Trade } from "@/lib/types";
import { Trash2, Check } from "lucide-react";
import { toast } from "sonner";

type RecentTradesCardProps = {
  isSignedIn: boolean;
};

const fetchTrades = async (): Promise<Trade[]> => {
  const response = await fetch("/api/trades/recent");

  if (!response.ok) {
    throw new Error("Failed to fetch trades");
  }

  return response.json();
};

export default function RecentTradesCard({
  isSignedIn,
}: RecentTradesCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    isFetching,
    isError,
    data: trades,
    refetch,
  } = useQuery(["recentTrades"], fetchTrades, {
    // Only fetch if user is signed in
    enabled: isSignedIn,
    // Cache data for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Retry 3 times if request fails
    retry: 3,
  });

  const onTradeValidationSuccess = () => {
    setIsModalOpen(false);
    refetch();
  };

  const handleCompleteClick = (tradeId: string) => {
    setSelectedTradeId(tradeId);
    setCompletionModalOpen(true);
  };

  const onTradeCompletionSuccess = () => {
    setCompletionModalOpen(false);
    setSelectedTradeId(null);
    refetch();
  };

  // Delete trade mutation
  const deleteTradeMutation = useMutation(
    async (tradeId: string) => {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete trade");
      return response.json();
    },
    {
      onSuccess: () => {
        toast("Trade deleted successfully", {
          duration: 3000,
          position: "top-center",
        });
        queryClient.invalidateQueries(["recentTrades"]);
        setDeleteConfirmId(null);
      },
      onError: () => {
        toast("Failed to delete trade", {
          duration: 3000,
          position: "top-center",
        });
      },
    }
  );

  const handleDeleteClick = (tradeId: string) => {
    if (deleteConfirmId === tradeId) {
      // Second click - confirm delete
      deleteTradeMutation.mutate(tradeId);
    } else {
      // First click - set confirmation state
      setDeleteConfirmId(tradeId);
      // Reset confirmation after 3 seconds
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  if (!isSignedIn) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Your recent trading history</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              View All
            </Button>
            <Button size="sm" disabled>
              New +
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto relative">
          {/* Blurred skeleton background */}
          <div className="space-y-3 filter blur-sm opacity-70">
            {/* {Array(5) */}
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
              >
                <div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2 bg-stone-300"></div>
                    <div className="font-medium">Trade</div>
                  </div>
                  <div className="text-xs text-stone-500">--:--</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-stone-400">+0.00</div>
                  <div className="text-xs text-stone-500">--- → ---</div>
                </div>
              </div>
            ))}
          </div>

          {/* Sign in message overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-stone-500 dark:text-stone-400 mb-2">
              Sign in to view your trading history
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-sm">
              Track and manage your trades and performance
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isFetching) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Your recent trading history</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              View All
            </Button>
            <Button size="sm" disabled>
              New +
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto">
          <div className="space-y-3">
            {Array(10)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
                >
                  <div>
                    <div className="flex items-center">
                      <Skeleton className="w-2 h-2 rounded-full mr-2" />
                      <Skeleton className="h-5 w-16 rounded-md" />{" "}
                      {/* Trade type */}
                    </div>
                    <Skeleton className="h-3 w-12 mt-1 rounded-md" />{" "}
                    {/* Time */}
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-5 w-16 rounded-md mb-1" />{" "}
                    {/* Profit */}
                    <Skeleton className="h-3 w-24 rounded-md" />{" "}
                    {/* Entry/Exit */}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !trades) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Your recent trading history</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              View All
            </Button>
            <Button size="sm" disabled>
              New +
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto relative">
          {/* Blurred skeleton background */}
          <div className="space-y-3 filter blur-sm opacity-70">
            {/* {Array(5) */}
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
              >
                <div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2 bg-stone-300"></div>
                    <div className="font-medium">Trade</div>
                  </div>
                  <div className="text-xs text-stone-500">--:--</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-stone-400">+0.00</div>
                  <div className="text-xs text-stone-500">--- → ---</div>
                </div>
              </div>
            ))}
          </div>

          {/* Sign in message overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-stone-500 dark:text-stone-400 mb-2">
              There was an error fetching your trades
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-sm">
              Please sign in to view
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-stone-500 dark:text-stone-400 mb-2">
              No trades yet
            </div>
            <p className="text-stone-400 dark:text-stone-500 text-sm">
              Start tracking your trades by clicking the &quot;New +&quot; button
            </p>
          </div>
        ) : (
        <div className="space-y-3">
          {trades.slice(0, 10).map((trade) => (
            <div
              key={trade.id}
              className="group flex items-center justify-between py-3 border-b border-stone-100 dark:border-stone-800 last:border-0 transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-900/20 px-2 -mx-2 rounded"
            >
              <div>
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${trade.type === "long" ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <div className="font-medium capitalize">{trade.type}</div>
                  <span className="ml-2 text-xs text-stone-500">{trade.symbol}</span>
                </div>
                <div className="text-xs text-stone-500">{trade.entry_time}</div>
              </div>
              <div className="text-right">
                {trade.status === "completed" ? (
                  <>
                    <div>
                      <div
                        className={`font-medium ${
                          trade.profit && trade.profit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {trade.profit && trade.profit >= 0 ? "+" : ""}
                        {trade.profit?.toFixed(2) || "0.00"}
                      </div>
                      <div className="text-xs text-stone-500">
                        {trade.entry_price.toFixed(2)} → {trade.exit_price?.toFixed(2) || "---"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(trade.id)}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 ${
                        deleteConfirmId === trade.id
                          ? "opacity-100 text-red-500 hover:text-red-600"
                          : "text-stone-400 hover:text-stone-600"
                      }`}
                      title={deleteConfirmId === trade.id ? "Click again to confirm" : "Delete trade"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="font-medium text-yellow-600">Pending</div>
                      <div className="text-xs text-stone-500">
                        Entry: {trade.entry_price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCompleteClick(trade.id)}
                        className="p-1 rounded hover:bg-green-50 dark:hover:bg-green-950 text-green-600 hover:text-green-700"
                        title="Complete trade"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(trade.id)}
                        className={`p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 ${
                          deleteConfirmId === trade.id
                            ? "opacity-100 text-red-500 hover:text-red-600"
                            : "text-stone-400 hover:text-stone-600"
                        }`}
                        title={deleteConfirmId === trade.id ? "Click again to confirm" : "Delete trade"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
      </CardContent>
      <TradeValidationModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onComplete={onTradeValidationSuccess}
      />
      {selectedTradeId && (
        <TradeCompletionModal
          isOpen={completionModalOpen}
          onOpenChange={setCompletionModalOpen}
          tradeId={selectedTradeId}
          onComplete={onTradeCompletionSuccess}
        />
      )}
    </Card>
  );
}
