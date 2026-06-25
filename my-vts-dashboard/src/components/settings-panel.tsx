"use client";

import React, { useState, useEffect, useRef } from "react";

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
  const panelRef = useRef<HTMLDivElement>(null);

  // Tutup panel ketika klik di luar komponen
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
    <div ref={panelRef} className="fixed bottom-6 right-20 z-50 flex items-center">
      {/* Panel Pengaturan HUD Melayang */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 rounded-2xl border border-border bg-zinc-950/90 text-zinc-100 p-5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500 animate-[spin_8s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              VTS Control Panel
            </h3>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">v1.1 HUD</span>
          </div>

          <div className="flex flex-col gap-5">
            {/* Opsi 1: Kecepatan Auto-Scroll */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Kecepatan Auto-Scroll
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["off", "slow", "normal", "fast"] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setScrollSpeed(speed)}
                    className={`rounded-lg py-1.5 text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                      scrollSpeed === speed
                        ? "bg-cyan-500 text-zinc-950 font-extrabold shadow-md shadow-cyan-500/20"
                        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"
                    }`}
                  >
                    {speed === "off" ? "Mati" : speed === "slow" ? "Lambat" : speed === "normal" ? "Sedang" : "Cepat"}
                  </button>
                ))}
              </div>
            </div>

            {/* Opsi 2: Interval Auto-Sync Data */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Interval Auto-Sync Data
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {([10, 30, 60, 0] as const).map((secs) => (
                  <button
                    key={secs}
                    onClick={() => setSyncInterval(secs)}
                    className={`rounded-lg py-1.5 text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                      syncInterval === secs
                        ? "bg-teal-500 text-zinc-950 font-extrabold shadow-md shadow-teal-500/20"
                        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"
                    }`}
                  >
                    {secs === 0 ? "Manual" : `${secs}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Opsi 3: Sakelar Bunyi Sonar */}
            <div className="flex items-center justify-between bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/60">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-zinc-250">Suara Sonar Kapal Baru</span>
                <span className="text-[9px] text-zinc-500">Bunyi ping saat mendeteksi kapal baru</span>
              </div>
              <button
                onClick={() => setSonarActive(!sonarActive)}
                className={`relative inline-flex h-5.5 w-10.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  sonarActive ? "bg-cyan-500" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    sonarActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Tombol Manual Sync jika Mode Interval adalah Manual */}
            {syncInterval === 0 && (
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white py-2 text-xs font-bold transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
                </svg>
                {isSyncing ? "Syncing..." : "Sync Sekarang"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tombol Gir Melayang HUD */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer ${
          isOpen
            ? "text-cyan-400 ring-2 ring-cyan-500/50 bg-zinc-950 border-cyan-800/40"
            : "hover:text-cyan-400 dark:hover:text-cyan-400"
        }`}
        title="Pengaturan Panel HUD"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isOpen ? "animate-[spin_10s_linear_infinite] text-cyan-400" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
}
