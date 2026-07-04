"use client";

import React, { useState, useEffect, useRef } from "react";

interface DateFilterProps {
  dates: string[]; // Daftar tanggal log yang memiliki data (Format: DD/BULAN/YYYY)
  selectedDate: string; // Tanggal terpilih (Format: DD/BULAN/YYYY atau "Semua")
  onChange: (date: string) => void;
}

const MONTH_NAMES = [
  "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
  "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
];

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function DateFilter({ dates, selectedDate, onChange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // State tampilan bulan dan tahun pada kalender
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Parser tanggal format DD/BULAN/YYYY menjadi objek JS
  const parseLogDate = (logDate: string) => {
    if (!logDate || logDate === "Semua") return null;
    const parts = logDate.split("/");
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const monthIdx = MONTH_NAMES.indexOf(parts[1].toUpperCase());
    const year = parseInt(parts[2], 10);
    if (monthIdx === -1 || isNaN(day) || isNaN(year)) return null;
    return { day, month: monthIdx, year };
  };

  // Format tanggal log (DD/BULAN/YYYY) dari komponen hari/bulan/tahun
  const toLogDate = (d: number, m: number, y: number) => {
    const dd = String(d).padStart(2, "0");
    const mmStr = MONTH_NAMES[m];
    return `${dd}/${mmStr}/${y}`;
  };

  // Sinkronisasi bulan/tahun tampilan kalender dengan tanggal terpilih
  useEffect(() => {
    const parsed = parseLogDate(selectedDate);
    setTimeout(() => {
      if (parsed) {
        setCurrentMonth(parsed.month);
        setCurrentYear(parsed.year);
      } else if (dates && dates.length > 0) {
        // Default: Buka bulan dari log data terbaru
        const lastDate = dates[dates.length - 1];
        const parsedLast = parseLogDate(lastDate);
        if (parsedLast) {
          setCurrentMonth(parsedLast.month);
          setCurrentYear(parsedLast.year);
        }
      } else {
        const now = new Date();
        setCurrentMonth(now.getMonth());
        setCurrentYear(now.getFullYear());
      }
    }, 0);
  }, [selectedDate, dates]);

  // Efek klik di luar untuk menutup dropdown kalender
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

  // Navigasi bulan
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Logika pembuatan hari-hari dalam sebulan
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Mencari hari pertama (0 = Sunday, 1 = Monday, dst) dan disesuaikan agar Senin = 0
  const firstDayOfWeekIndex = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

  // Render trigger text
  const getTriggerText = () => {
    if (selectedDate === "Semua") return "Semua Tanggal";
    const parsed = parseLogDate(selectedDate);
    if (!parsed) return selectedDate;

    // Tampilkan format ramah pembaca
    const monthFormatted = MONTH_NAMES[parsed.month].toLowerCase();
    const capitalizedMonth = monthFormatted.charAt(0).toUpperCase() + monthFormatted.slice(1);
    return `${parsed.day} ${capitalizedMonth} ${parsed.year}`;
  };

  // Set tanggal
  const handleSelectDate = (day: number) => {
    const formatted = toLogDate(day, currentMonth, currentYear);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("Semua");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 min-w-[220px] relative z-40">
      <label className="text-black dark:text-zinc-300 text-sm md:text-base font-bold font-sans uppercase tracking-wider px-1">
        PILIH TANGGAL
      </label>

      {/* Tombol Pemicu Kalender */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-medium text-black dark:text-white outline-none transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer shadow-sm text-left focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-sans"
      >
        <span className="flex items-center gap-2">
          {/* Icon Kalender */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {getTriggerText()}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Popover Kalender HUD */}
      {isOpen && (
        <div className="absolute top-[72px] left-0 z-50 w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/95 text-zinc-850 dark:text-zinc-150 p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">

          {/* Opsi Semua Tanggal */}
          <button
            type="button"
            onClick={handleSelectAll}
            className={`w-full py-2 mb-3 rounded-lg text-xs font-bold uppercase transition-all duration-200 border cursor-pointer ${selectedDate === "Semua"
                ? "bg-cyan-500 text-white dark:text-zinc-950 border-cyan-400 font-extrabold shadow-md shadow-cyan-500/10"
                : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white"
              }`}
          >
            Semua Tanggal
          </button>

          {/* Kalender Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-800 dark:text-zinc-300">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Nama Hari */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1.5">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          {/* Grid Angka Hari */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Cell Kosong / Padding Awal Bulan */}
            {Array.from({ length: firstDayOfWeekIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="p-1.5"></div>
            ))}

            {/* Cell Angka Hari */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const day = idx + 1;
              const dateStr = toLogDate(day, currentMonth, currentYear);

              const isSelected = selectedDate === dateStr;
              const hasData = dates.includes(dateStr);

              // Conditional Styling untuk sel tanggal
              let cellClass = "p-1.5 rounded-lg transition-all cursor-pointer relative font-semibold ";

              if (isSelected) {
                // Tanggal aktif terpilih
                cellClass += "bg-cyan-500 text-white dark:text-zinc-950 font-extrabold shadow-md shadow-cyan-500/20 scale-105 z-10";
              } else if (hasData) {
                // Ada data log (Cyan Border & Soft Bg)
                cellClass += "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30 dark:border-cyan-500/30 hover:bg-cyan-500/20 dark:hover:bg-cyan-500/25";
              } else {
                // Kosong / Tidak ada data
                cellClass += "text-zinc-400 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-black dark:hover:text-zinc-200";
              }

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={cellClass}
                >
                  {day}

                  {/* Indikator Titik Kecil Jika Ada Data dan Tidak Terpilih */}
                  {hasData && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-500 dark:bg-cyan-400"></span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
