"use client";

import React, { useEffect, useState } from "react";

export default function SystemStatus() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleSyncUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ countdown: number; loading: boolean }>;
      if (customEvent.detail) {
        setCountdown(customEvent.detail.countdown);
        setLoading(customEvent.detail.loading);
      }
    };

    window.addEventListener("vts-sync-countdown", handleSyncUpdate);
    return () => {
      window.removeEventListener("vts-sync-countdown", handleSyncUpdate);
    };
  }, []);

  if (countdown === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-300 shadow-xl shrink-0 transition-colors duration-300">
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        System Live
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold border shadow-xl transition-colors duration-300 shrink-0 ${
        loading 
          ? "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse" 
          : "bg-zinc-900 text-zinc-300 border-zinc-800"
      }`}
      title={loading ? "Sedang memperbarui data kapal..." : "Data kapal akan diperbarui otomatis"}
    >
      <span 
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          loading ? "bg-amber-500 animate-spin" : "bg-emerald-500 animate-pulse"
        }`}
      />
      {loading ? "Syncing..." : `Auto Sync (${countdown}s)`}
    </span>
  );
}
