import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-[280px]">
      <label
        htmlFor="search-input"
        className="text-black dark:text-zinc-300 text-sm md:text-base font-bold font-sans uppercase tracking-wider px-1"
      >
        CARI NAMA KAPAL / CALL SIGN
      </label>
      <div className="relative flex items-center">
        {/* Search Icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          id="search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cari kapal, misal: ‘MV Samudera’"
          className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-3 pl-11 pr-10 text-sm font-medium text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-sans"
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title="Bersihkan pencarian"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
