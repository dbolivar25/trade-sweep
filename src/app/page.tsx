import RecentTradesCard from "@/components/dashboard/recent-trades-card";
import WatchlistCard from "@/components/dashboard/watchlist-card";
import WelcomeCard from "@/components/dashboard/welcome-card";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  const isSignedIn = !!user;

  return (
    <div className="w-full px-4 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-screen-2xl mx-auto">
        {/* Left Column - Welcome Card and Watchlist */}
        <div className="space-y-6 w-full">
          <WelcomeCard userFirstName={user?.firstName} />
          <WatchlistCard isSignedIn={isSignedIn} />
        </div>
        {/* Right Column - Recent Trades */}
        <div className="w-full">
          <RecentTradesCard isSignedIn={isSignedIn} />
        </div>
      </div>
    </div>
  );
}
