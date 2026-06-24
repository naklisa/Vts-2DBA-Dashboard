import React, { useState, useEffect } from "react";
import { ShipData } from "@/lib/fetcher";

interface VtsStatsProps {
  filteredData: ShipData[];
}

export default function VtsStats({ filteredData }: VtsStatsProps) {
  const totalShips = filteredData.length;
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-stretch gap-6 mb-8">
      {/* Card 1: Total Kapal */}
      <div className="relative overflow-hidden w-full md:max-w-sm rounded-2xl border border-border bg-card p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-950/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Kapal Aktif</p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{totalShips}</h3>
          </div>
          <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13l-1.5-6h-13L4 13m16 0H4m16 0a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 012-2m8-6V3" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
      </div>

      {/* Card 2: Waktu Real-time */}
      <div className="relative overflow-hidden w-full md:max-w-sm rounded-2xl border border-border bg-card p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-teal-500/50 hover:shadow-teal-950/10 md:ml-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Waktu Real-time</p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-foreground font-mono">
              {time ? formatTime(time) : "--:--:--"}
            </h3>
            <p className="text-xs text-zinc-450 dark:text-zinc-400 mt-1">
              {time ? formatDate(time) : "Memuat tanggal..."}
            </p>
          </div>

          <div className="flex items-center">
            {/* Animasi Radar VTS */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-teal-500/30 bg-teal-950/20 overflow-hidden shadow-inner">
              {/* Radar grid lines */}
              <div className="absolute inset-0 rounded-full border border-dashed border-teal-500/10 scale-75"></div>
              <div className="absolute inset-0 rounded-full border border-dashed border-teal-500/10 scale-50"></div>
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-teal-500/15"></div>
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-teal-500/15"></div>
              
              {/* Radar sweep hand */}
              <div className="absolute inset-0 origin-center animate-[spin_3s_linear_infinite] bg-gradient-to-tr from-transparent via-transparent to-teal-400/30 rounded-full"></div>
              
              {/* Radar target blips */}
              <span className="absolute top-3 left-4 h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping opacity-75"></span>
              <span className="absolute bottom-4 right-3 h-1 w-1 rounded-full bg-teal-400 animate-ping opacity-60"></span>
              
              {/* Center dot */}
              <div className="h-1 w-1 rounded-full bg-teal-400 shadow-lg shadow-teal-500"></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-teal-500 to-emerald-600" />
      </div>
    </div>
  );
}
