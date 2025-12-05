"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Trash2,
  Clock,
  ArrowUpDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Trade } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import TradeValidationModal from "@/components/trades/trade-validation-modal";
import TradeCompletionModal from "@/components/trades/trade-completion-modal";
import { format } from "date-fns";

type SortField = "date" | "symbol" | "profit" | "type";
type SortOrder = "asc" | "desc";
type FilterStatus = "all" | "pending" | "completed";
type FilterType = "all" | "long" | "short";

const fetchTrades = async (): Promise<Trade[]> => {
  const response = await fetch("/api/trades/recent");
  if (!response.ok) throw new Error("Failed to fetch trades");
  return response.json();
};

export default function TradesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const queryClient = useQueryClient();

  const { data: trades, isLoading, refetch } = useQuery({
    queryKey: ["recentTrades"],
    queryFn: fetchTrades,
    staleTime: 5 * 60 * 1000,
  });

  const deleteTradeMutation = useMutation({
    mutationFn: (tradeId: string) =>
      fetch(`/api/trades/${tradeId}`, { method: "DELETE" }).then((res) => {
        if (!res.ok) throw new Error("Failed to delete trade");
        return res.json();
      }),
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

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredAndSortedTrades = trades
    ?.filter((trade) => {
      if (searchQuery && !trade.symbol.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterStatus !== "all" && trade.status !== filterStatus) {
        return false;
      }
      if (filterType !== "all" && trade.type !== filterType) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const order = sortOrder === "asc" ? 1 : -1;
      switch (sortField) {
        case "date":
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * order;
        case "symbol":
          return a.symbol.localeCompare(b.symbol) * order;
        case "profit":
          return ((a.profit || 0) - (b.profit || 0)) * order;
        case "type":
          return a.type.localeCompare(b.type) * order;
        default:
          return 0;
      }
    });

  const stats = {
    total: trades?.length || 0,
    pending: trades?.filter((t) => t.status === "pending").length || 0,
    completed: trades?.filter((t) => t.status === "completed").length || 0,
    totalPnL: trades?.reduce((sum, t) => sum + (t.profit || 0), 0) || 0,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 animate-in">
        <div className="flex items-center gap-3 text-muted-foreground mb-4">
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">
            Trade History
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-4">
              Trades
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              View and manage your complete trading history with detailed
              analytics.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-white shrink-0"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Trade
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in delay-100">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
          <p className="text-3xl font-semibold font-mono">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-3xl font-semibold font-mono text-pending">
            {stats.pending}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-3xl font-semibold font-mono text-gain">
            {stats.completed}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground mb-1">Total P&L</p>
          <p
            className={cn(
              "text-3xl font-semibold font-mono",
              stats.totalPnL >= 0 ? "text-gain" : "text-loss"
            )}
          >
            {stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-in delay-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Status: {filterStatus === "all" ? "All" : filterStatus}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus("all")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
              Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Type: {filterType === "all" ? "All" : filterType}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterType("all")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("long")}>
              Long
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("short")}>
              Short
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden animate-in delay-300">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 shimmer rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 shimmer rounded" />
                  <div className="h-4 w-24 shimmer rounded" />
                </div>
                <div className="h-5 w-20 shimmer rounded" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedTrades && filteredAndSortedTrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    <button
                      onClick={() => toggleSort("date")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Date
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    <button
                      onClick={() => toggleSort("symbol")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Symbol
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    <button
                      onClick={() => toggleSort("type")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Type
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Entry
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Exit
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right p-4 font-medium text-muted-foreground">
                    <button
                      onClick={() => toggleSort("profit")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto"
                    >
                      P&L
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAndSortedTrades.map((trade) => {
                  const isProfitable = (trade.profit || 0) > 0;
                  const isPending = trade.status === "pending";

                  return (
                    <tr
                      key={trade.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="font-mono text-sm">
                          {format(new Date(trade.created_at), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {trade.entry_time}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">{trade.symbol}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center",
                              trade.type === "long"
                                ? "bg-gain/10"
                                : "bg-loss/10"
                            )}
                          >
                            {trade.type === "long" ? (
                              <TrendingUp className="h-4 w-4 text-gain" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-loss" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-sm font-medium capitalize",
                              trade.type === "long" ? "text-gain" : "text-loss"
                            )}
                          >
                            {trade.type}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono">
                          ${trade.entry_price.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono">
                          {trade.exit_price
                            ? `$${trade.exit_price.toFixed(2)}`
                            : "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-pending/10 text-pending">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gain/10 text-gain">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {!isPending && (
                          <div
                            className={cn(
                              "font-mono font-semibold",
                              isProfitable ? "text-gain" : "text-loss"
                            )}
                          >
                            {isProfitable ? "+" : ""}$
                            {trade.profit?.toFixed(2) || "0.00"}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
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
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleCompleteClick(trade.id)}
                                  className="text-gain focus:text-gain"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Complete Trade
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchQuery || filterStatus !== "all" || filterType !== "all"
                ? "No matching trades"
                : "No trades yet"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {searchQuery || filterStatus !== "all" || filterType !== "all"
                ? "Try adjusting your filters"
                : "Start tracking your trades to build your history"}
            </p>
            {!searchQuery && filterStatus === "all" && filterType === "all" && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-accent hover:bg-accent/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Trade
              </Button>
            )}
          </div>
        )}
      </div>

      <TradeValidationModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onComplete={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />

      {selectedTradeId && (
        <TradeCompletionModal
          isOpen={completionModalOpen}
          onOpenChange={setCompletionModalOpen}
          tradeId={selectedTradeId}
          onComplete={() => {
            setCompletionModalOpen(false);
            setSelectedTradeId(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
