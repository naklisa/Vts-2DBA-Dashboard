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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={onCancel}
      />
      
      {/* Modal Dialog Content */}
      <div className="relative overflow-hidden w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Warning Indicator Icon */}
        <div className="flex items-center gap-4">
          <div className={`rounded-full p-3 ${isChecking ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30' : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30'}`}>
            {isChecking ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Konfirmasi Perubahan Status</h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400">Pemberitahuan penting untuk operator VTS</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed">
            Apakah Anda yakin ingin mengubah status kedatangan kapal:
          </p>
          <div className="mt-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-950 p-3 border border-border">
            <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400 break-words">{shipName}</p>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3.5">
            Status baru:{" "}
            <span className={`font-bold ${isChecking ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {isChecking ? "Telah Tiba (Arrived)" : "Batal Tiba (Belum Datang)"}
            </span>
          </p>
        </div>

        {/* Buttons Action */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-lg cursor-pointer ${
              isChecking 
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-950/20" 
                : "bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 hover:shadow-rose-950/20"
            }`}
          >
            Ya, Ubah Status
          </button>
        </div>
      </div>
    </div>
  );
}
