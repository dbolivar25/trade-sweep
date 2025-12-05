import { HeroSection } from "@/components/dashboard/hero-section";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { WatchlistPreview } from "@/components/dashboard/watchlist-preview";
import { RecentTradesSection } from "@/components/dashboard/recent-trades-section";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  const isSignedIn = !!user;

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <HeroSection userFirstName={user?.firstName} />

      <QuickStats isSignedIn={isSignedIn} />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        <div className="xl:col-span-2">
          <WatchlistPreview isSignedIn={isSignedIn} userId={user?.id} />
        </div>
        <div className="xl:col-span-3">
          <RecentTradesSection isSignedIn={isSignedIn} />
        </div>
      </div>
    </div>
  );
}
