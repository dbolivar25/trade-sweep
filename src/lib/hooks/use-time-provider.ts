"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

export function useTimeProvider() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = format(currentTime, "HH:mm");

  return { currentTime, formattedTime };
}
