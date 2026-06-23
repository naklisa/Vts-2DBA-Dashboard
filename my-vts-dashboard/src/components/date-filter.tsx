import React from "react";

interface DateFilterProps {
  dates: string[];
  selectedDate: string;
  onChange: (date: string) => void;
}

export default function DateFilter({ dates, selectedDate, onChange }: DateFilterProps) {
  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      <label htmlFor="date-selector" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Pilih Tanggal Log (2DBA)
      </label>
      <div className="relative">
        <select
          id="date-selector"
          value={selectedDate}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium text-foreground outline-none ring-offset-background transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
        >
          {dates.length === 0 ? (
            <option value="" disabled className="bg-background text-foreground">
              Belum ada data tanggal
            </option>
          ) : (
            dates.map((date) => (
              <option key={date} value={date} className="bg-background text-foreground">
                {date}
              </option>
            ))
          )}
        </select>
        
        {/* Ikon panah bawah */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
}
