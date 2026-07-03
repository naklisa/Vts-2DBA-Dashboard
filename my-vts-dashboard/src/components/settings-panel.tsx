"use client";

import React, { useState, useEffect, useRef } from "react";
import SystemStatus from "@/components/system-status";

interface SettingsPanelProps {
  scrollSpeed: string;
  setScrollSpeed: (speed: string) => void;
  sonarActive: boolean;
  setSonarActive: (active: boolean) => void;
  syncInterval: number;
  setSyncInterval: (seconds: number) => void;
  onManualSync: () => Promise<void>;
  isSyncing: boolean;
}

export default function SettingsPanel({
  scrollSpeed,
  setScrollSpeed,
  sonarActive,
  setSonarActive,
  syncInterval,
  setSyncInterval,
  onManualSync,
  isSyncing,
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync theme status on client mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("vts_theme") as "light" | "dark" | null;
    setTimeout(() => {
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        // Default to dark mode
        setTheme("dark");
      }
    }, 0);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("vts_theme", nextTheme);
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Close settings panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      
      {/* Floating SystemStatus (Auto Sync pill) next to setting button */}
      <SystemStatus />

      {/* Settings Dialog Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary animate-[spin_10s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-base font-bold tracking-tight">
              Settingan Antarmuka
            </h3>
          </div>

          <div className="flex flex-col gap-4">
            
            {/* Opsi 1: Kecepatan auto scroll */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Kecepatan auto scroll
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(["off", "slow", "normal", "fast"] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setScrollSpeed(speed)}
                    className={`rounded-lg py-1.5 text-[10px] font-bold transition-all duration-200 cursor-pointer border ${
                      scrollSpeed === speed
                        ? "bg-primary border-primary text-white font-extrabold shadow-sm"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {speed === "off" ? "Mati" : speed === "slow" ? "Lambat" : speed === "normal" ? "Sedang" : "Cepat"}
                  </button>
                ))}
              </div>
            </div>

            {/* Opsi 2: Interval auto-sync data */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Interval auto-sync data
              </label>
              <div className="grid grid-cols-4 gap-1">
                {([5, 10, 20, 0] as const).map((secs) => (
                  <button
                    key={secs}
                    onClick={() => setSyncInterval(secs)}
                    className={`rounded-lg py-1.5 text-[10px] font-bold transition-all duration-200 cursor-pointer border ${
                      syncInterval === secs
                        ? "bg-primary border-primary text-white font-extrabold shadow-sm"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {secs === 0 ? "Manual" : `${secs}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Opsi 3: Suara notifikasi kapal baru */}
            <div className="flex items-center justify-between py-1 border-t border-zinc-100 dark:border-zinc-800/80 mt-1 pt-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Suara notifikasi kapal baru</span>
                <span className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-0.5 leading-tight">Bunyi ping saat terdapat kapal baru</span>
              </div>
              <button
                type="button"
                onClick={() => setSonarActive(!sonarActive)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  sonarActive ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    sonarActive ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Opsi 4: Dark / Light mode */}
            <div className="flex items-center justify-between py-1 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Dark / Light mode</span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  theme === "dark" ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    theme === "dark" ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Tombol Manual Sync jika Mode Interval adalah Manual */}
            {syncInterval === 0 && (
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white py-2 text-xs font-bold transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                </svg>
                {isSyncing ? "Syncing..." : "Sync Sekarang"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Gear Button (White container with blue outline gear icon) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-primary shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer ${
          isOpen
            ? "ring-2 ring-primary/30"
            : ""
        }`}
        title="Settingan Antarmuka"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isOpen ? "animate-[spin_8s_linear_infinite]" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
}
