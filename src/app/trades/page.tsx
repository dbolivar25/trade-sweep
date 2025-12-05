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
    <div className="w-full max-w-7xl mx-auto overflow-hidden">
      <header className="mb-6 md:mb-12 animate-in">
        <div className="flex items-center gap-3 text-muted-foreground mb-4">
          <TrendingUp className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium uppercase tracking-wider">
            Trade History
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-2 md:mb-4">
              Trades
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              View and manage your complete trading history with detailed
              analytics.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-white w-full sm:w-auto flex-shrink-0"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Trade
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 md:mb-6 animate-in delay-100">
        <div className="rounded-xl border border-border bg-card p-3 md:p-5">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Total</p>
          <p className="text-lg sm:text-xl md:text-3xl font-semibold font-mono truncate">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 md:p-5">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-lg sm:text-xl md:text-3xl font-semibold font-mono text-pending truncate">
            {stats.pending}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 md:p-5">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-lg sm:text-xl md:text-3xl font-semibold font-mono text-gain truncate">
            {stats.completed}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 md:p-5 overflow-hidden">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">P&L</p>
          <p
            className={cn(
              "text-lg sm:text-xl md:text-3xl font-semibold font-mono truncate",
              stats.totalPnL >= 0 ? "text-gain" : "text-loss"
            )}
            title={`${stats.totalPnL >= 0 ? "+" : ""}$${stats.totalPnL.toFixed(2)}`}
          >
            {stats.totalPnL >= 0 ? "+" : ""}${stats.totalPnL.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-4 md:mb-6 animate-in delay-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-center">
                <Filter className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span className="truncate">
                  <span className="hidden sm:inline">Status: </span>
                  {filterStatus === "all" ? "All" : filterStatus}
                </span>
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
              <Button variant="outline" size="sm" className="w-full justify-center">
                <Filter className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span className="truncate">
                  <span className="hidden sm:inline">Type: </span>
                  {filterType === "all" ? "All" : filterType}
                </span>
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
      </div>

      <div className="rounded-xl md:rounded-2xl border border-border bg-card overflow-hidden animate-in delay-300">
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
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-border">
              {filteredAndSortedTrades.map((trade) => {
                const isProfitable = (trade.profit || 0) > 0;
                const isPending = trade.status === "pending";

                return (
                  <div key={trade.id} className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div
                          className={cn(
                            "h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0",
                            trade.type === "long" ? "bg-gain/10" : "bg-loss/10"
                          )}
                        >
                          {trade.type === "long" ? (
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-gain" />
                          ) : (
                            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-loss" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">{trade.symbol}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {format(new Date(trade.created_at), "MMM d, yyyy")} · {trade.entry_time}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu
                        onOpenChange={(open) => {
                          if (!open) setDeleteConfirmId(null);
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
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
                              if (deleteConfirmId !== trade.id) e.preventDefault();
                              handleDeleteClick(trade.id);
                            }}
                            onSelect={(e) => {
                              if (deleteConfirmId !== trade.id) e.preventDefault();
                            }}
                            className={cn(
                              deleteConfirmId === trade.id
                                ? "bg-destructive/10 text-destructive focus:bg-destructive/20 focus:text-destructive font-medium"
                                : "text-destructive focus:text-destructive"
                            )}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleteConfirmId === trade.id ? "Confirm Delete" : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 sm:gap-4 text-sm min-w-0">
                        <div className="flex-shrink-0">
                          <span className="text-muted-foreground">Entry </span>
                          <span className="font-mono">${trade.entry_price.toFixed(2)}</span>
                        </div>
                        {trade.exit_price && (
                          <div className="flex-shrink-0">
                            <span className="text-muted-foreground">Exit </span>
                            <span className="font-mono">${trade.exit_price.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-pending/10 text-pending">
                            <Clock className="h-3 w-3" />
                            <span className="hidden xs:inline">Pending</span>
                          </span>
                        ) : (
                          <div
                            className={cn(
                              "font-mono font-semibold text-sm sm:text-base",
                              isProfitable ? "text-gain" : "text-loss"
                            )}
                          >
                            {isProfitable ? "+" : ""}${trade.profit?.toFixed(2) || "0.00"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
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
                    <th className="text-left p-4 font-medium text-muted-foreground">Entry</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Exit</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
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
                      <tr key={trade.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="p-4">
                          <div className="font-mono text-sm">
                            {format(new Date(trade.created_at), "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">{trade.entry_time}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold">{trade.symbol}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center",
                                trade.type === "long" ? "bg-gain/10" : "bg-loss/10"
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
                          <span className="font-mono">${trade.entry_price.toFixed(2)}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono">
                            {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : "—"}
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
                              {isProfitable ? "+" : ""}${trade.profit?.toFixed(2) || "0.00"}
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
                                  if (deleteConfirmId !== trade.id) e.preventDefault();
                                  handleDeleteClick(trade.id);
                                }}
                                onSelect={(e) => {
                                  if (deleteConfirmId !== trade.id) e.preventDefault();
                                }}
                                className={cn(
                                  deleteConfirmId === trade.id
                                    ? "bg-destructive/10 text-destructive focus:bg-destructive/20 focus:text-destructive font-medium"
                                    : "text-destructive focus:text-destructive"
                                )}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {deleteConfirmId === trade.id ? "Confirm Delete" : "Delete"}
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
          </>
        ) : (
          <div className="p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted/50 mb-4">
              <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base md:text-lg font-medium mb-2">
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
