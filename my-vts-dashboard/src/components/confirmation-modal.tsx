"use client";

import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  shipName: string;
  isChecking: boolean; // true if checking, false if unchecking
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  shipName,
  isChecking,
  onConfirm,
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
        <div className="flex items-start gap-4">
          {/* Filled Red Triangle Exclamation SVG */}
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-[#EA3838] mt-0.5">
            <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" fill="currentColor" />
          </svg>
          
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-black dark:text-white leading-tight font-sans">
              Konfirmasi Perubahan Status
            </h3>
            
            {/* Description Text with Color Status Highlights */}
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-350 mt-4 leading-relaxed font-sans">
              Apakah anda yakin melakukan perubahan status kapal menjadi{" "}
              {isChecking ? (
                <span className="text-[#27C840] font-extrabold">telah tiba</span>
              ) : (
                <span className="text-[#EA3838] font-extrabold">belum / batal tiba</span>
              )}{" "}
              ?
            </p>
          </div>
        </div>

        {/* Black Container Box holding Ship Name in Blue font */}
        <div className="mt-6 rounded-xl bg-black p-4 text-center select-all shadow-inner">
          <p className="text-sm md:text-base font-extrabold text-primary break-words tracking-wide">
            {shipName}
          </p>
        </div>

        {/* Buttons Action aligned bottom right */}
        <div className="mt-8 flex justify-end gap-3.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-zinc-200 dark:border-zinc-750 bg-white dark:bg-zinc-800 px-6 py-2.5 text-sm font-extrabold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors duration-150 cursor-pointer shadow-sm"
          >
            Batal
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-6 py-2.5 text-sm font-extrabold text-white transition-all shadow-md cursor-pointer ${
              isChecking
                ? "bg-[#27C840] hover:bg-[#22b339] hover:shadow-[#27C840]/20"
                : "bg-[#EA3838] hover:bg-[#d62e2e] hover:shadow-[#EA3838]/20"
            }`}
          >
            Ya, Ubah Status
          </button>
        </div>
      </div>
    </div>
  );
}
