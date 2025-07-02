import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist",
  description: "Track stock performance with historical charts",
};

export default function WatchlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}