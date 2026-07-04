"use client";

import React, { useState, useEffect, useRef } from "react";

interface StatusFilterProps {
  statusFilter: "semua" | "belum-tiba";
  onChange: (status: "semua" | "belum-tiba") => void;
}

export default function StatusFilter({ statusFilter, onChange }: StatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Efek klik di luar untuk menutup dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  const handleSelect = (val: "semua" | "belum-tiba") => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 min-w-[220px] relative z-30">
      <label className="text-black dark:text-zinc-300 text-sm md:text-base font-bold font-sans uppercase tracking-wider px-1">
        STATUS KEDATANGAN
      </label>

      {/* Tombol Pemicu Dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-medium text-black dark:text-white outline-none transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer shadow-sm text-left focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-sans"
      >
        <span>
          {statusFilter === "semua" ? "Semua Kapal" : "Belum Tiba"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Popover Dropdown HUD */}
      {isOpen && (
        <div className="absolute top-[72px] left-0 z-50 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/95 text-zinc-800 dark:text-zinc-100 p-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            type="button"
            onClick={() => handleSelect("semua")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${statusFilter === "semua"
                ? "bg-cyan-500 text-white dark:text-zinc-950 font-extrabold shadow-md shadow-cyan-500/10"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
              }`}
          >
            Semua Kapal
          </button>
          <button
            type="button"
            onClick={() => handleSelect("belum-tiba")}
            className={`w-full text-left px-4 py-2.5 mt-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${statusFilter === "belum-tiba"
                ? "bg-cyan-500 text-white dark:text-zinc-950 font-extrabold shadow-md shadow-cyan-500/10"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
              }`}
          >
            Belum Tiba
          </button>
        </div>
      )}
    </div>
  );
}
