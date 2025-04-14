import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockWatchlistItems } from "@/lib/data/mock-data";

export default function WatchlistCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Watchlist</CardTitle>
          <CardDescription>Your tracked symbols</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            View All
          </Button>
          <Button size="sm">New +</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {mockWatchlistItems.slice(0, 9).map((item) => (
            <div
              key={item.id}
              className="p-3 border border-stone-200 dark:border-stone-800 rounded-lg hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer"
            >
              <div className="font-medium">{item.symbol}</div>
              <div className="text-sm">${item.price}</div>
              <div
                className={`text-xs ${item.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
              >
                {item.change}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
