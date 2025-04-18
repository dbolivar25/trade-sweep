"use client";

import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { useTimeProvider } from "@/lib/hooks/use-time-provider";
import { Skeleton } from "../ui/skeleton";

type WelcomeCardProps = {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: unknown;
};

export default function WelcomeCard({
  isLoaded,
  isSignedIn,
  user,
}: WelcomeCardProps) {
  const { formattedTime } = useTimeProvider();

  if (!isLoaded) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
              Welcome,
            </h1>
            <Skeleton className="h-8 w-32 mt-1 rounded-md" />{" "}
          </div>
        </CardHeader>
        <CardFooter>
          <p className="text-stone-500 dark:text-stone-400">
            Current time: {formattedTime}
          </p>
        </CardFooter>
      </Card>
    );
  }

  if (!isSignedIn) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
              Welcome,
            </h1>
            <h2 className="text-2xl text-stone-900 dark:text-stone-100 mt-1">
              Trader
            </h2>
          </div>
        </CardHeader>
        <CardFooter>
          <p className="text-stone-500 dark:text-stone-400">
            Current time: {formattedTime}
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
            Welcome,
          </h1>
          <h2 className="text-2xl text-stone-900 dark:text-stone-100 mt-1">
            {user?.firstName ?? "Trader"}
          </h2>
        </div>
      </CardHeader>
      <CardFooter>
        <p className="text-stone-500 dark:text-stone-400">
          Current time: {formattedTime}
        </p>
      </CardFooter>
    </Card>
  );
}
