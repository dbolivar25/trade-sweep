"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  Trash2,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trade } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import TradeValidationModal from "@/components/trades/trade-validation-modal";
import TradeCompletionModal from "@/components/trades/trade-completion-modal";

type RecentTradesSectionProps = {
  isSignedIn: boolean;
};

const fetchTrades = async (): Promise<Trade[]> => {
  const response = await fetch("/api/trades/recent");
  if (!response.ok) throw new Error("Failed to fetch trades");
  return response.json();
};

export function RecentTradesSection({ isSignedIn }: RecentTradesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: trades, isLoading, refetch } = useQuery({
    queryKey: ["recentTrades"],
    queryFn: fetchTrades,
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000,
  });

  const deleteTradeMutation = useMutation({
    mutationFn: async (tradeId: string) => {
      const response = await fetch(`/api/trades/${tradeId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete trade");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Trade deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["recentTrades"] });
    },
    onError: () => {
      toast.error("Failed to delete trade");
    },
  });

  const handleDeleteClick = (tradeId: string) => {
    if (deleteConfirmId === tradeId) {
      deleteTradeMutation.mutate(tradeId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(tradeId);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleCompleteClick = (tradeId: string) => {
    setSelectedTradeId(tradeId);
    setCompletionModalOpen(true);
  };

  const onTradeValidationSuccess = () => {
    setIsModalOpen(false);
    refetch();
  };

  const onTradeCompletionSuccess = () => {
    setCompletionModalOpen(false);
    setSelectedTradeId(null);
    refetch();
  };

  if (!isSignedIn) {
    return (
      <section className="animate-in delay-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl">Recent Trades</h2>
          <Button size="sm" disabled>
            <Plus className="h-4 w-4 mr-2" />
            New Trade
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden p-8 text-center">
          <p className="text-muted-foreground mb-2">
            Sign in to view your trades
          </p>
          <p className="text-sm text-muted-foreground/70">
            Track performance and manage your trading history
          </p>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="animate-in delay-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl">Recent Trades</h2>
          <Button size="sm" disabled>
            <Plus className="h-4 w-4 mr-2" />
            New Trade
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 shimmer rounded-full" />
                  <div className="space-y-2">
                    <div className="h-5 w-24 shimmer rounded" />
                    <div className="h-4 w-16 shimmer rounded" />
                  </div>
                </div>
                <div className="h-5 w-20 shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-in delay-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl">Recent Trades</h2>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-accent/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Trade
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {trades && trades.length > 0 ? (
          <>
            <div className="divide-y divide-border">
              {trades.slice(0, 6).map((trade) => {
                const isProfitable = (trade.profit || 0) > 0;
                const isPending = trade.status === "pending";

                return (
                  <div
                    key={trade.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center",
                          trade.type === "long" ? "bg-gain/10" : "bg-loss/10"
                        )}
                      >
                        {trade.type === "long" ? (
                          <TrendingUp className="h-5 w-5 text-gain" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-loss" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{trade.symbol}</span>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                              trade.type === "long"
                                ? "bg-gain/10 text-gain"
                                : "bg-loss/10 text-loss"
                            )}
                          >
                            {trade.type}
                          </span>
                          {isPending && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-pending/10 text-pending font-medium">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          ${trade.entry_price.toFixed(2)}
                          {trade.exit_price && (
                            <span>
                              {" → "}${trade.exit_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {!isPending && (
                        <div
                          className={cn(
                            "font-mono font-semibold text-right",
                            isProfitable ? "text-gain" : "text-loss"
                          )}
                        >
                          {isProfitable ? "+" : ""}$
                          {trade.profit?.toFixed(2) || "0.00"}
                          <div className="text-xs text-muted-foreground font-normal">
                            {trade.profit_percent?.toFixed(1)}%
                          </div>
                        </div>
                      )}

                      <DropdownMenu
                        onOpenChange={(open) => {
                          if (!open) setDeleteConfirmId(null);
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isPending && (
                            <DropdownMenuItem
                              onClick={() => handleCompleteClick(trade.id)}
                              className="text-gain focus:text-gain"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Complete Trade
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              if (deleteConfirmId !== trade.id) {
                                e.preventDefault();
                              }
                              handleDeleteClick(trade.id);
                            }}
                            onSelect={(e) => {
                              if (deleteConfirmId !== trade.id) {
                                e.preventDefault();
                              }
                            }}
                            className={cn(
                              deleteConfirmId === trade.id
                                ? "bg-destructive/10 text-destructive focus:bg-destructive/20 focus:text-destructive font-medium"
                                : "text-destructive focus:text-destructive"
                            )}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleteConfirmId === trade.id
                              ? "Confirm Delete"
                              : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/trades"
              className="flex items-center justify-center gap-2 p-4 border-t border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              View all trades
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No trades yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Start tracking your trades to build your history
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-accent hover:bg-accent/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Trade
            </Button>
          </div>
        )}
      </div>

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
    </section>
  );
}
