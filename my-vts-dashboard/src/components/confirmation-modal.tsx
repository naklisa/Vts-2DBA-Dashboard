"use client";

import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  shipName: string;
  onSelectAction: (actionType: "arrived" | "declined" | "normal") => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  shipName,
  onSelectAction,
  onCancel,
}: ConfirmationModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Dialog Content */}
      <div className="relative overflow-hidden w-full max-w-lg rounded-[28px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Warning Indicator Header */}
        <div className="flex items-center gap-4">
          {/* Action icon for ship status */}
          <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-extrabold text-black dark:text-white leading-tight font-sans">
            Ubah Status Kedatangan
          </h3>
        </div>
        
        {/* Description Text */}
        <p className="text-xs font-semibold text-zinc-555 dark:text-zinc-400 mt-3 leading-relaxed font-sans">
          Pilih status kedatangan terbaru untuk kapal di bawah ini:
        </p>

        {/* Container Box holding Ship Name */}
        <div className="mt-4 rounded-2xl bg-zinc-950 dark:bg-black/60 p-4 text-center select-all border border-zinc-800 shadow-inner">
          <p className="text-sm md:text-base font-extrabold text-primary break-words tracking-wide">
            {shipName}
          </p>
        </div>

        {/* Pilihan Opsi Status */}
        <div className="mt-6 flex flex-col gap-3">
          {/* Opsi 1: Telah Tiba */}
          <button
            type="button"
            onClick={() => onSelectAction("arrived")}
            className="flex items-center gap-4 w-full p-4 rounded-2xl border border-emerald-500/10 dark:border-emerald-500/5 bg-emerald-500/5 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 text-emerald-750 dark:text-emerald-400 text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#27C840] text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-sm uppercase tracking-wide">Telah Tiba / Selesai</div>
              <div className="text-xs text-zinc-555 dark:text-emerald-300/70 mt-0.5 font-bold">Tandai kapal sudah bersandar atau selesai (Hijau)</div>
            </div>
          </button>

          {/* Opsi 2: Batal / Decline */}
          <button
            type="button"
            onClick={() => onSelectAction("declined")}
            className="flex items-center gap-4 w-full p-4 rounded-2xl border border-rose-500/10 dark:border-rose-500/5 bg-rose-500/5 hover:bg-rose-500/10 dark:hover:bg-rose-500/15 text-rose-750 dark:text-rose-400 text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#EA3838] text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-sm uppercase tracking-wide">Batal / Tidak Jadi Sandar</div>
              <div className="text-xs text-zinc-555 dark:text-rose-300/70 mt-0.5 font-bold">Kapal batal bersandar atau decline (Merah)</div>
            </div>
          </button>

          {/* Opsi 3: Normal / Reset */}
          <button
            type="button"
            onClick={() => onSelectAction("normal")}
            className="flex items-center gap-4 w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-400 dark:bg-zinc-650 text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18.24" />
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-sm uppercase tracking-wide">Belum Tiba / Normal</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-bold">Kembalikan ke status awal berdasarkan ETA (Abu-abu/Kuning)</div>
            </div>
          </button>
        </div>

        {/* Buttons Action aligned bottom right */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-2.5 text-sm font-extrabold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors duration-150 cursor-pointer shadow-sm"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
