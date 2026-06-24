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
      <span className="inline-flex items-center rounded-full bg-cyan-950/80 px-3 py-1.5 text-xs font-semibold text-cyan-400 border border-cyan-800/40">
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
        System Live
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold border transition-colors duration-300 ${
        loading 
          ? "bg-amber-500/10 text-amber-500 border-amber-500/30" 
          : "bg-cyan-950/80 text-cyan-400 border-cyan-800/40 animate-pulse"
      }`}
      title={loading ? "Sedang memperbarui data kapal..." : "Data kapal akan diperbarui otomatis"}
    >
      <span 
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          loading ? "bg-amber-500 animate-spin" : "bg-cyan-500 animate-pulse"
        }`}
      />
      {loading ? "Syncing..." : `Auto Sync (${countdown}s)`}
    </span>
  );
}
