import React, { useRef, useEffect, useState } from "react";
import { ShipData } from "@/lib/fetcher";

interface DataTableProps {
  data: ShipData[];
  loading: boolean;
  checkedShips: Set<string>;
  onToggleCheck: (key: string) => void;
}

// Fungsi utilitas untuk parsing string tanggal "DD/BULAN/YYYY" menjadi objek Date
const parseDateString = (dateStr: string) => {
  if (!dateStr) return new Date(0);
  const parts = dateStr.split("/");
  if (parts.length !== 3) return new Date(0);
  const day = parseInt(parts[0], 10);
  const monthName = parts[1].toUpperCase();
  const year = parseInt(parts[2], 10);

  const monthMap: Record<string, number> = {
    JANUARI: 0, JAN: 0,
    FEBRUARI: 1, PEBRUARI: 1, FEB: 1,
    MARET: 2, MAR: 2,
    APRIL: 3, APR: 3,
    MEI: 4,
    JUNI: 5, JUN: 5,
    JULI: 6, JUL: 6,
    AGUSTUS: 7, AGS: 7, AGU: 7,
    SEPTEMBER: 8, SEP: 8,
    OKTOBER: 9, OKT: 9,
    NOVEMBER: 10, NOPEMBER: 10, NOV: 10,
    DESEMBER: 11, DES: 11
  };

  const month = monthMap[monthName] !== undefined ? monthMap[monthName] : 0;
  return new Date(year, month, day);
};

// Deteksi apakah ETA berselisih persis H-1 dari hari ini (realtime)
const isETA_H1 = (logDateStr: string, etaStr: string) => {
  if (!etaStr) return false;
  
  const etaDatePart = etaStr.split(" ")[0]; // "07/06/2026"
  const etaParts = etaDatePart.split("/");
  if (etaParts.length < 3) return false;
  const etaDay = parseInt(etaParts[0], 10);
  const etaMonth = parseInt(etaParts[1], 10) - 1; // 0-indexed
  const etaYear = parseInt(etaParts[2], 10);

  const etaDate = new Date(etaYear, etaMonth, etaDay);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = etaDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

// Deteksi apakah ETA sudah lewat dari hari ini (realtime)
const isETAPassed = (logDateStr: string, etaStr: string) => {
  if (!etaStr) return false;

  const etaDatePart = etaStr.split(" ")[0]; // "06/06/2026"
  const etaParts = etaDatePart.split("/");
  if (etaParts.length < 3) return false;
  const etaDay = parseInt(etaParts[0], 10);
  const etaMonth = parseInt(etaParts[1], 10) - 1; // 0-indexed
  const etaYear = parseInt(etaParts[2], 10);

  const etaDate = new Date(etaYear, etaMonth, etaDay);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return etaDate.getTime() <= today.getTime();
};

// Mengonversi string format ETA (seperti "25/06/2026/07.00LT" atau ISO) ke objek Date
const parseETA = (etaStr: string): Date | null => {
  if (!etaStr) return null;
  if (etaStr.includes("T") && etaStr.includes("Z")) {
    const d = new Date(etaStr);
    return isNaN(d.getTime()) ? null : d;
  }

  const cleanStr = etaStr.replace(/(LT|\(LT\))/gi, "").trim();
  const parts = cleanStr.split(/[\s/]/);
  if (parts.length < 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const year = parseInt(parts[2], 10);
  
  let hours = 0;
  let minutes = 0;
  if (parts.length >= 4) {
    const timePart = parts[3];
    const timeSubparts = timePart.split(/[.:]/);
    if (timeSubparts.length >= 1) hours = parseInt(timeSubparts[0], 10) || 0;
    if (timeSubparts.length >= 2) minutes = parseInt(timeSubparts[1], 10) || 0;
  }
  
  const d = new Date(year, month, day, hours, minutes);
  return isNaN(d.getTime()) ? null : d;
};

// Menghasilkan teks hitung mundur relatif ETA dari waktu sekarang
const getCountdownText = (etaStr: string): string => {
  const etaDate = parseETA(etaStr);
  if (!etaDate) return "";
  
  const now = new Date();
  const diffMs = etaDate.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  
  if (Math.abs(diffMins) < 60) {
    if (diffMins > 0) {
      return `Tiba dlm ${diffMins} mnt`;
    } else if (diffMins < 0) {
      return `Tiba ${Math.abs(diffMins)} mnt lalu`;
    } else {
      return "Tiba sekarang";
    }
  }
  
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(diffHours) < 24) {
    if (diffHours > 0) {
      return `Tiba dlm ${diffHours} jam`;
    } else {
      return `Tiba ${Math.abs(diffHours)} jam lalu`;
    }
  }
  
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) {
    return `Tiba dlm ${diffDays} hari`;
  } else {
    return `Tiba ${Math.abs(diffDays)} hari lalu`;
  }
};

export default function DataTable({ data, loading, checkedShips, onToggleCheck }: DataTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(isHovered);

  // Sinkronisasi ref dengan state hover
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let scrollAccumulator = 0;
    let pauseTimeout: NodeJS.Timeout;
    let isPaused = false;

    // Kecepatan auto-scroll (pixel per detik)
    const scrollSpeed = 15;

    const scroll = (now: number) => {
      if (isHoveredRef.current || isPaused) {
        lastTime = now;
        animationFrameId = requestAnimationFrame(scroll);
        return;
      }

      const delta = (now - lastTime) / 1000;
      lastTime = now;

      scrollAccumulator += scrollSpeed * delta;
      if (scrollAccumulator >= 1) {
        const pixelsToScroll = Math.floor(scrollAccumulator);
        scrollAccumulator -= pixelsToScroll;

        container.scrollTop += pixelsToScroll;

        const maxScrollTop = container.scrollHeight - container.clientHeight;
        if (container.scrollTop >= maxScrollTop - 1) {
          isPaused = true;
          pauseTimeout = setTimeout(() => {
            container.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => {
              isPaused = false;
            }, 1500);
          }, 3000);
        }
      }

      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(pauseTimeout);
    };
  }, [data]);

  // Helper to render action badges based on keyword
  const getActionBadge = (action: string) => {
    const act = (action || "").trim().toLowerCase();
    if (!act || act === "-") return <span className="text-zinc-550 font-medium">-</span>;

    if (act.includes("anchor") || act.includes("labuh")) {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-550/20">
          {action}
        </span>
      );
    } else if (act.includes("monitor") || act.includes("pantau")) {
      return (
        <span className="inline-flex items-center rounded-md bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 ring-1 ring-inset ring-cyan-550/20">
          {action}
        </span>
      );
    } else if (act.includes("tunda") || act.includes("tug") || act.includes("assist")) {
      return (
        <span className="inline-flex items-center rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 ring-1 ring-inset ring-purple-550/20">
          {action}
        </span>
      );
    } else if (act.includes("sandar") || act.includes("dock") || act.includes("berth")) {
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-550/20">
          {action}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-md bg-zinc-500/10 px-2 py-0.5 text-[10px] font-bold text-zinc-650 dark:text-zinc-300 ring-1 ring-inset ring-zinc-500/20">
        {action}
      </span>
    );
  };

  // Helper to render 2DBA Remark badge
  const getRemark2DBABadge = (remark: string) => {
    const rem = (remark || "").trim().toLowerCase();
    if (!rem || rem === "-") return <span className="text-zinc-500">-</span>;

    if (rem.includes("inbound") || rem.includes("masuk")) {
      return (
        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
          Inbound
        </span>
      );
    } else if (rem.includes("outbound") || rem.includes("keluar")) {
      return (
        <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
          Outbound
        </span>
      );
    } else if (rem.includes("transit")) {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
          Transit
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-md bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
        {remark}
      </span>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-md shadow-2xl transition-colors duration-300">
      <div 
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="overflow-auto max-h-[515px] scrollbar-thin"
      >
        <table className="w-full border-collapse text-left text-xs text-foreground/80">
          <thead>
            {/* Row header menggunakan bg-header yang seragam dan solid */}
            <tr className="border-b border-border bg-header font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 transition-colors duration-300">
              {/* Checkbox Column Header - Sticky top-0 & left-0 (Solid bg-header) */}
              <th className="py-4 text-center w-[50px] min-w-[50px] max-w-[50px] sticky top-0 left-0 bg-header z-30 border-r border-border transition-colors duration-300">
                CHECK
              </th>
              {/* NO Column Header - Sticky top-0 & left-50 (Solid bg-header) */}
              <th className="py-4 text-center w-[60px] min-w-[60px] max-w-[60px] sticky top-0 left-[50px] bg-header z-30 border-r border-border transition-colors duration-300">
                NO
              </th>
              <th className="px-4 py-4 min-w-[80px] sticky top-0 bg-header z-20">QSO</th>
              <th className="px-4 py-4 min-w-[120px] sticky top-0 bg-header z-20">Remark 2DBA</th>
              {/* NAME Column Header - Sticky top-0 & left-110 (Solid bg-header) */}
              <th className="px-5 py-4 w-[240px] min-w-[240px] max-w-[240px] sticky top-0 left-[110px] bg-header z-30 border-r border-border font-bold text-foreground transition-colors duration-300">
                NAME OF SHIP / CALL SIGN
              </th>
              <th className="px-4 py-4 min-w-[140px] sticky top-0 bg-header z-20">Type of Cargo</th>
              <th className="px-4 py-4 min-w-[120px] sticky top-0 bg-header z-20">Qty Cargo</th>
              <th className="px-4 py-4 min-w-[80px] sticky top-0 bg-header z-20">FLAG</th>
              <th className="px-4 py-4 min-w-[150px] sticky top-0 bg-header z-20">Cargo On Board</th>
              <th className="px-4 py-4 min-w-[130px] sticky top-0 bg-header z-20">Last Port</th>
              <th className="px-4 py-4 min-w-[100px] sticky top-0 bg-header z-20">GT</th>
              <th className="px-4 py-4 min-w-[145px] sticky top-0 bg-header z-20">ETA / ETD (LT)</th>
              <th className="px-4 py-4 min-w-[120px] sticky top-0 bg-header z-20">General Remark</th>
              {/* Action VTS Column Header - Left aligned and tighter min-width */}
              <th className="px-4 py-4 min-w-[120px] text-left sticky top-0 bg-header z-20">Action VTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-transparent transition-colors duration-300">
            {loading ? (
              // Loading Skeleton Row (14 columns)
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="w-[50px] min-w-[50px] max-w-[50px] py-3.5 bg-sticky sticky left-0 z-10 border-r border-border"><div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-4 mx-auto"></div></td>
                  <td className="w-[60px] min-w-[60px] max-w-[60px] py-3.5 bg-sticky sticky left-[50px] z-10 border-r border-border"><div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-6 mx-auto"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-12"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-16"></div></td>
                  <td className="w-[240px] min-w-[240px] max-w-[240px] py-3.5 bg-sticky sticky left-[110px] z-10 border-r border-border"><div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-28 mx-auto"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-20"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-16"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-10"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-24"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-16"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-12"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-20"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-300 dark:bg-zinc-800 rounded w-20"></div></td>
                  <td className="px-4 py-3.5 text-left"><div className="h-5 bg-zinc-300 dark:bg-zinc-800 rounded w-24"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State Row (14 columns)
              <tr>
                <td colSpan={14} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                    </svg>
                    <p className="text-sm font-bold text-zinc-500">Tidak ada data kapal ditemukan</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">Coba ubah filter tanggal atau kata kunci pencarian Anda.</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Actual Data Rows
              data.map((ship, index) => {
                const shipKey = `${ship.Tanggal_Log}-${ship["NAME_OF_SHIP/_CALL_SIGN"]}`;
                const isChecked = checkedShips.has(shipKey);
                const isPassed = isETAPassed(ship.Tanggal_Log, ship["ETA_/_ETD_(LT)"]);
                const isH1 = isETA_H1(ship.Tanggal_Log, ship["ETA_/_ETD_(LT)"]);
                
                // Penentuan styling baris berdasarkan status kapal (Opaque CSS Variables)
                let rowBgClass = "hover:bg-zinc-200/40 dark:hover:bg-zinc-800/30 text-foreground/80";
                let stickyBgClass = "bg-sticky group-hover:bg-sticky-hover";
                let highlightBorderClass = "";

                if (isChecked || isPassed) {
                  // Hijau untuk Kapal Tiba/Selesai
                  rowBgClass = "bg-arrived hover:opacity-90";
                  stickyBgClass = "bg-arrived-sticky group-hover:bg-arrived-sticky-hover text-arrived-text";
                  highlightBorderClass = "border-l-4 border-l-emerald-500/80";
                } else if (isH1) {
                  // Kuning untuk Kapal H-1
                  rowBgClass = "bg-h1 hover:opacity-90";
                  stickyBgClass = "bg-h1-sticky group-hover:bg-h1-sticky-hover text-h1-text";
                  highlightBorderClass = "border-l-4 border-l-amber-500/80";
                }

                return (
                  <tr 
                    key={`${ship.NO}-${ship["NAME_OF_SHIP/_CALL_SIGN"]}-${index}`}
                    className={`transition-colors duration-300 border-b border-border group ${rowBgClass} ${highlightBorderClass}`}
                  >
                    {/* CHECKBOX - Sticky left-0 (Solid background) */}
                    <td className={`w-[50px] min-w-[50px] max-w-[50px] py-3.5 text-center sticky left-0 z-10 border-r border-border transition-colors duration-300 ${stickyBgClass}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleCheck(shipKey)}
                        className="h-4.5 w-4.5 rounded border-zinc-300 dark:border-zinc-700 bg-background text-cyan-600 focus:ring-cyan-500 focus:ring-offset-background cursor-pointer"
                        title="Tandai kapal sudah tiba/selesai"
                      />
                    </td>

                    {/* NO - Sticky left-50 (Solid background) */}
                    <td className={`w-[60px] min-w-[60px] max-w-[60px] py-3.5 text-center font-bold text-zinc-400 dark:text-zinc-550 sticky left-[50px] z-10 border-r border-border transition-colors duration-300 ${stickyBgClass}`}>
                      {index + 1}
                    </td>
                    
                    {/* QSO */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-550 dark:text-zinc-400">
                      {ship.QSO || "-"}
                    </td>
                    
                    {/* Remark 2DBA */}
                    <td className="px-4 py-3.5">
                      {getRemark2DBABadge(ship.Remark_2DBA)}
                    </td>
                    
                    {/* NAME OF SHIP / CALL SIGN - Sticky left-110 (Solid background) */}
                    <td className={`w-[240px] min-w-[240px] max-w-[240px] px-5 py-3.5 font-bold sticky left-[110px] z-10 border-r border-border tracking-wide transition-colors duration-300 whitespace-normal break-words leading-relaxed ${stickyBgClass} ${isChecked || isPassed ? 'text-arrived-text font-extrabold' : isH1 ? 'text-h1-text font-extrabold' : 'text-foreground'}`} title={ship["NAME_OF_SHIP/_CALL_SIGN"]}>
                      {ship["NAME_OF_SHIP/_CALL_SIGN"] || "-"}
                    </td>
                    
                    {/* Type of Cargo */}
                    <td className="px-4 py-3.5 text-zinc-550 dark:text-zinc-400 font-medium">
                      {ship.Type_of_Cargo_On_Board || "-"}
                    </td>
                    
                    {/* Qty Cargo */}
                    <td className="px-4 py-3.5 text-zinc-500 dark:text-zinc-400">
                      {ship.Quantity_of_Cargo_on_Board || "-"}
                    </td>
                    
                    {/* FLAG */}
                    <td className="px-4 py-3.5 font-bold text-zinc-600 dark:text-zinc-350">
                      {ship.FLAG || "-"}
                    </td>
                    
                    {/* Cargo On Board */}
                    <td className="px-4 py-3.5 max-w-[150px] truncate text-zinc-500 dark:text-zinc-400" title={ship.Cargo_On_Board}>
                      {ship.Cargo_On_Board || "-"}
                    </td>
                    
                    {/* Last Port */}
                    <td className="px-4 py-3.5 text-zinc-500 dark:text-zinc-400">
                      {ship.Last_Port || "-"}
                    </td>
                    
                    {/* Gross Tonnage */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      {ship.Gross_Tonnage || "-"}
                    </td>
                    
                    {/* ETA / ETD (LT) */}
                    <td className="px-4 py-3.5 text-cyan-600 dark:text-cyan-400 font-semibold">
                      <div>{ship["ETA_/_ETD_(LT)"] || "-"}</div>
                      {ship["ETA_/_ETD_(LT)"] && getCountdownText(ship["ETA_/_ETD_(LT)"]) && (
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-450 font-normal mt-0.5 animate-pulse">
                          {getCountdownText(ship["ETA_/_ETD_(LT)"])}
                        </div>
                      )}
                    </td>
                    
                    {/* General Remark */}
                    <td className="px-4 py-3.5 italic text-zinc-500 dark:text-zinc-450">
                      {ship.REMARK || "-"}
                    </td>
                    
                    {/* Action from VTS - Left aligned and padded correctly */}
                    <td className="px-4 py-3.5 text-left">
                      {getActionBadge(ship.ACTION_FROM_VTS)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
