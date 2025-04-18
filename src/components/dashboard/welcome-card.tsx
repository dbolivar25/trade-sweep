"use client";

import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { useTimeProvider } from "@/lib/hooks/use-time-provider";

type WelcomeCardProps = {
  userFirstName: string | null | undefined;
};

export default function WelcomeCard({ userFirstName }: WelcomeCardProps) {
  const { formattedTime } = useTimeProvider();

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
            Welcome,
          </h1>
          <h2 className="text-2xl text-stone-900 dark:text-stone-100 mt-1">
            {userFirstName ?? "Trader"}
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
