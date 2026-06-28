"use client";

import React, { useEffect, useState } from "react";

export default function DigitalClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setTime(new Date());
    }, 0);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className="w-48 h-20 px-3 py-2 bg-white dark:bg-zinc-900 rounded-xl shadow-[0px_4px_10px_rgba(0,0,0,0.15)] border border-black/5 dark:border-white/10 flex flex-col justify-center items-center">
        <span className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold animate-pulse">Loading Clock...</span>
      </div>
    );
  }

  const hours = String(time.getHours()).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");
  const formattedTime = `${hours}:${minutes}:${seconds}`;

  const formattedDate = time.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-44 h-16 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-250 dark:border-zinc-800 flex flex-col justify-center items-center shrink-0 shadow-sm transition-colors duration-300">
      <div className="flex flex-col justify-center items-center w-full">
        <div className="text-primary text-xl font-bold font-sans tracking-wider leading-none">
          {formattedTime}
        </div>
        <div className="text-black dark:text-zinc-300 text-[10px] font-semibold font-sans mt-1 text-center leading-tight">
          {formattedDate}
        </div>
      </div>
    </div>
  );
}
