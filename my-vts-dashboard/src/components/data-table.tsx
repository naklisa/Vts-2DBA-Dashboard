import React from "react";
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

// Deteksi apakah ETA berselisih persis H-1 dari Tanggal_Log
const isETA_H1 = (logDateStr: string, etaStr: string) => {
  if (!logDateStr || !etaStr) return false;
  
  const logDate = parseDateString(logDateStr);

  const etaDatePart = etaStr.split(" ")[0]; // "07/06/2026"
  const etaParts = etaDatePart.split("/");
  if (etaParts.length !== 3) return false;
  const etaDay = parseInt(etaParts[0], 10);
  const etaMonth = parseInt(etaParts[1], 10) - 1; // 0-indexed
  const etaYear = parseInt(etaParts[2], 10);

  const etaDate = new Date(etaYear, etaMonth, etaDay);

  const diffTime = etaDate.getTime() - logDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

// Deteksi apakah ETA sudah lewat dari Tanggal_Log
const isETAPassed = (logDateStr: string, etaStr: string) => {
  if (!logDateStr || !etaStr) return false;
  
  const logDate = parseDateString(logDateStr);

  const etaDatePart = etaStr.split(" ")[0]; // "06/06/2026"
  const etaParts = etaDatePart.split("/");
  if (etaParts.length !== 3) return false;
  const etaDay = parseInt(etaParts[0], 10);
  const etaMonth = parseInt(etaParts[1], 10) - 1; // 0-indexed
  const etaYear = parseInt(etaParts[2], 10);

  const etaDate = new Date(etaYear, etaMonth, etaDay);

  return etaDate.getTime() <= logDate.getTime();
};

export default function DataTable({ data, loading, checkedShips, onToggleCheck }: DataTableProps) {
  // Helper to render action badges based on keyword
  const getActionBadge = (action: string) => {
    const act = (action || "").trim().toLowerCase();
    if (!act || act === "-") return <span className="text-zinc-500 font-medium">-</span>;

    if (act.includes("anchor") || act.includes("labuh")) {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-inset ring-amber-500/20">
          {action}
        </span>
      );
    } else if (act.includes("monitor") || act.includes("pantau")) {
      return (
        <span className="inline-flex items-center rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 ring-1 ring-inset ring-cyan-500/20">
          {action}
        </span>
      );
    } else if (act.includes("tunda") || act.includes("tug") || act.includes("assist")) {
      return (
        <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400 ring-1 ring-inset ring-purple-500/20">
          {action}
        </span>
      );
    } else if (act.includes("sandar") || act.includes("dock") || act.includes("berth")) {
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
          {action}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-md bg-zinc-500/10 px-2 py-0.5 text-[10px] font-bold text-zinc-300 ring-1 ring-inset ring-zinc-500/20">
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
        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
          Inbound
        </span>
      );
    } else if (rem.includes("outbound") || rem.includes("keluar")) {
      return (
        <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
          Outbound
        </span>
      );
    } else if (rem.includes("transit")) {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
          Transit
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
        {remark}
      </span>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-zinc-300">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80 font-bold uppercase tracking-wider text-zinc-400">
              {/* Checkbox Column Header - Sticky left-0 */}
              <th className="py-4 text-center w-[50px] min-w-[50px] max-w-[50px] sticky left-0 bg-zinc-950/95 z-20 border-r border-zinc-800">
                CHECK
              </th>
              {/* NO Column Header - Sticky left-50 */}
              <th className="py-4 text-center w-[60px] min-w-[60px] max-w-[60px] sticky left-[50px] bg-zinc-950/95 z-20 border-r border-zinc-800">
                NO
              </th>
              <th className="px-4 py-4 min-w-[80px]">QSO</th>
              <th className="px-4 py-4 min-w-[120px]">Remark 2DBA</th>
              {/* NAME Column Header - Sticky left-110 */}
              <th className="px-5 py-4 w-[240px] min-w-[240px] max-w-[240px] sticky left-[110px] bg-zinc-950/95 z-20 border-r border-zinc-800 font-bold text-white">
                NAME OF SHIP / CALL SIGN
              </th>
              <th className="px-4 py-4 min-w-[140px]">Type of Cargo</th>
              <th className="px-4 py-4 min-w-[120px]">Qty Cargo</th>
              <th className="px-4 py-4 min-w-[80px]">FLAG</th>
              <th className="px-4 py-4 min-w-[150px]">Cargo On Board</th>
              <th className="px-4 py-4 min-w-[130px]">Last Port</th>
              <th className="px-4 py-4 min-w-[100px]">GT</th>
              <th className="px-5 py-4 min-w-[220px]">Other Info</th>
              <th className="px-4 py-4 min-w-[150px]">Present Position</th>
              <th className="px-4 py-4 min-w-[145px]">ETA / ETD (LT)</th>
              <th className="px-4 py-4 min-w-[150px]">General Remark</th>
              <th className="px-5 py-4 min-w-[150px] text-right">Action VTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50 bg-transparent">
            {loading ? (
              // Loading Skeleton Row
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="w-[50px] min-w-[50px] max-w-[50px] py-3.5 bg-zinc-900/20 sticky left-0 z-10 border-r border-zinc-800/60"><div className="h-4 bg-zinc-800 rounded w-4 mx-auto"></div></td>
                  <td className="w-[60px] min-w-[60px] max-w-[60px] py-3.5 bg-zinc-900/20 sticky left-[50px] z-10 border-r border-zinc-800/60"><div className="h-4 bg-zinc-800 rounded w-6 mx-auto"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-800 rounded w-12"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-800 rounded w-16"></div></td>
                  <td className="w-[240px] min-w-[240px] max-w-[240px] py-3.5 bg-zinc-900/20 sticky left-[110px] z-10 border-r border-zinc-800/60"><div className="h-4 bg-zinc-800 rounded w-28 mx-auto"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-800 rounded w-20"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-800 rounded w-16"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-800 rounded w-10"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-800 rounded w-24"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-800 rounded w-16"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-800 rounded w-12"></div></td>
                  <td className="px-5 py-3.5"><div className="h-4 bg-zinc-800 rounded w-36"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-800 rounded w-24"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-800 rounded w-20"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-800 rounded w-20"></div></td>
                  <td className="px-5 py-3.5 text-right"><div className="h-5 bg-zinc-800 rounded w-24 ml-auto"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State Row
              <tr>
                <td colSpan={16} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-650" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                    </svg>
                    <p className="text-sm font-bold text-zinc-400">Tidak ada data kapal ditemukan</p>
                    <p className="text-xs text-zinc-550">Coba ubah filter tanggal atau kata kunci pencarian lo, brek.</p>
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
                
                // Penentuan styling baris berdasarkan status kapal
                let rowBgClass = "hover:bg-zinc-800/25 text-zinc-300";
                let stickyBgClass = "bg-zinc-950/80 group-hover:bg-zinc-900/90";
                let highlightBorderClass = "";

                if (isChecked || isPassed) {
                  // Hijau untuk Kapal Tiba/Selesai
                  rowBgClass = "bg-emerald-950/10 text-emerald-300 hover:bg-emerald-950/20";
                  stickyBgClass = "bg-emerald-995/95 group-hover:bg-emerald-900/95";
                  highlightBorderClass = "border-l-2 border-l-emerald-500/80";
                } else if (isH1) {
                  // Kuning untuk Kapal H-1
                  rowBgClass = "bg-amber-950/10 text-amber-300 hover:bg-amber-950/20";
                  stickyBgClass = "bg-amber-995/95 group-hover:bg-amber-900/95";
                  highlightBorderClass = "border-l-2 border-l-amber-500/80";
                }

                return (
                  <tr 
                    key={`${ship.NO}-${ship["NAME_OF_SHIP/_CALL_SIGN"]}-${index}`}
                    className={`transition-colors border-b border-zinc-800/40 group ${rowBgClass} ${highlightBorderClass}`}
                  >
                    {/* CHECKBOX - Sticky left-0 */}
                    <td className={`w-[50px] min-w-[50px] max-w-[50px] py-3.5 text-center sticky left-0 z-10 border-r border-zinc-800/60 transition-colors ${stickyBgClass}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleCheck(shipKey)}
                        className="h-4.5 w-4.5 rounded border-zinc-700 bg-zinc-900 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-zinc-950 cursor-pointer"
                        title="Tandai kapal sudah tiba/selesai"
                      />
                    </td>

                    {/* NO - Sticky left-50 */}
                    <td className={`w-[60px] min-w-[60px] max-w-[60px] py-3.5 text-center font-bold text-zinc-550 sticky left-[50px] z-10 border-r border-zinc-800/60 transition-colors ${stickyBgClass}`}>
                      {ship.NO}
                    </td>
                    
                    {/* QSO */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-400">
                      {ship.QSO || "-"}
                    </td>
                    
                    {/* Remark 2DBA */}
                    <td className="px-4 py-3.5">
                      {getRemark2DBABadge(ship.Remark_2DBA)}
                    </td>
                    
                    {/* NAME OF SHIP / CALL SIGN - Sticky left-110 */}
                    <td className={`w-[240px] min-w-[240px] max-w-[240px] px-5 py-3.5 font-bold sticky left-[110px] z-10 border-r border-zinc-800/60 tracking-wide transition-colors truncate ${stickyBgClass} ${isChecked || isPassed ? 'text-emerald-400' : isH1 ? 'text-amber-400' : 'text-white'}`} title={ship["NAME_OF_SHIP/_CALL_SIGN"]}>
                      {ship["NAME_OF_SHIP/_CALL_SIGN"] || "-"}
                    </td>
                    
                    {/* Type of Cargo */}
                    <td className="px-4 py-3.5 text-zinc-400 font-medium">
                      {ship.Type_of_Cargo_On_Board || "-"}
                    </td>
                    
                    {/* Qty Cargo */}
                    <td className="px-4 py-3.5 text-zinc-400">
                      {ship.Quantity_of_Cargo_on_Board || "-"}
                    </td>
                    
                    {/* FLAG */}
                    <td className="px-4 py-3.5 font-bold text-zinc-350">
                      {ship.FLAG || "-"}
                    </td>
                    
                    {/* Cargo On Board */}
                    <td className="px-4 py-3.5 max-w-[150px] truncate text-zinc-450" title={ship.Cargo_On_Board}>
                      {ship.Cargo_On_Board || "-"}
                    </td>
                    
                    {/* Last Port */}
                    <td className="px-4 py-3.5 text-zinc-400">
                      {ship.Last_Port || "-"}
                    </td>
                    
                    {/* Gross Tonnage */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-450">
                      {ship.Gross_Tonnage || "-"}
                    </td>
                    
                    {/* Other Related Information */}
                    <td className="px-5 py-3.5 max-w-[220px] break-words text-zinc-450" title={ship.Other_Related_Information}>
                      {ship.Other_Related_Information || "-"}
                    </td>
                    
                    {/* Present Position */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-450">
                      {ship.Present_Position || "-"}
                    </td>
                    
                    {/* ETA / ETD (LT) */}
                    <td className="px-4 py-3.5 text-cyan-400 font-semibold">
                      {ship["ETA_/_ETD_(LT)"] || "-"}
                    </td>
                    
                    {/* General Remark */}
                    <td className="px-4 py-3.5 italic text-zinc-455">
                      {ship.REMARK || "-"}
                    </td>
                    
                    {/* Action from VTS */}
                    <td className="px-5 py-3.5 text-right">
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
