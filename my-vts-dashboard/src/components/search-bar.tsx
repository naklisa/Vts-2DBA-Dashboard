import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex flex-col gap-2 flex-1 min-w-[280px]">
      <label htmlFor="search-input" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Cari Nama Kapal / Call Sign
      </label>
      <div className="relative flex items-center">
        {/* Ikon Pencarian */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          id="search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cari kapal, misal: 'MV Samudera', 'CALL SIGN'..."
          className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-10 text-sm font-medium text-foreground placeholder-zinc-400 dark:placeholder-zinc-500 outline-none ring-offset-background transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
        />

        {/* Tombol Hapus Input (jika ada teks) */}
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-foreground transition-colors cursor-pointer"
            title="Bersihkan pencarian"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
