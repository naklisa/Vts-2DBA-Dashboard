import React, { useRef, useEffect, useState } from "react";
import { ShipData } from "@/lib/fetcher";
import { parseETA, isETAPassed, isETA_H1 } from "@/lib/date-utils";

interface DataTableProps {
  data: ShipData[];
  loading: boolean;
  checkedShips: Set<string>;
  uncheckedOverrides: Set<string>;
  onToggleCheck: (key: string) => void;
  scrollSpeed?: string;
}

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

export default function DataTable({
  data,
  loading,
  checkedShips,
  uncheckedOverrides,
  onToggleCheck,
  scrollSpeed = "normal",
}: DataTableProps) {
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

    // Nilai kecepatan gulir dinamis
    const getScrollSpeedVal = (speed: string) => {
      switch (speed) {
        case "slow":
          return 8;
        case "fast":
          return 36;
        case "off":
          return 0;
        case "normal":
        default:
          return 18;
      }
    };

    const speedVal = getScrollSpeedVal(scrollSpeed);

    const scroll = (now: number) => {
      if (isHoveredRef.current || isPaused || speedVal === 0) {
        lastTime = now;
        animationFrameId = requestAnimationFrame(scroll);
        return;
      }

      const delta = (now - lastTime) / 1000;
      lastTime = now;

      scrollAccumulator += speedVal * delta;
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
  }, [data, scrollSpeed]);

  // Helper to render action badges based on keyword
  const getActionBadge = (action: string) => {
    const act = (action || "").trim().toLowerCase();
    if (!act || act === "-") return <span className="text-zinc-400 font-medium">-</span>;

    if (act.includes("anchor") || act.includes("labuh")) {
      return (
        <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
          {action}
        </span>
      );
    } else if (act.includes("monitor") || act.includes("pantau")) {
      return (
        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
          {action}
        </span>
      );
    } else if (act.includes("tunda") || act.includes("tug") || act.includes("assist")) {
      return (
        <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
          {action}
        </span>
      );
    } else if (act.includes("sandar") || act.includes("dock") || act.includes("berth")) {
      return (
        <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {action}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
        {action}
      </span>
    );
  };

  // Helper to split and stack QSO date/time
  const formatQSO = (qsoStr: string) => {
    if (!qsoStr) return <span className="text-zinc-450 font-medium">-</span>;
    const parts = qsoStr.trim().split(" ");
    if (parts.length >= 2) {
      return (
        <div className="flex flex-col items-center justify-center font-mono leading-tight">
          <span className="text-zinc-800 dark:text-zinc-200 font-bold">{parts[0]}</span>
          <span className="text-zinc-500 dark:text-zinc-400 text-[10px] mt-0.5">{parts.slice(1).join(" ")}</span>
        </div>
      );
    }
    return <span className="font-mono">{qsoStr}</span>;
  };

  // Helper to split and stack Ship Name
  const formatShipName = (nameStr: string) => {
    if (!nameStr) return <span className="text-zinc-450 font-medium">-</span>;
    if (nameStr.includes("/")) {
      const parts = nameStr.split("/");
      return (
        <div className="flex flex-col justify-start items-start leading-tight">
          <span className="font-extrabold text-black dark:text-white uppercase text-[11px]">{parts[0]}</span>
          <span className="text-[10px] text-zinc-555 dark:text-zinc-450 mt-0.5 font-bold">/{parts.slice(1).join("/")}</span>
        </div>
      );
    }
    return <span className="font-extrabold uppercase text-[11px]">{nameStr}</span>;
  };

  // Helper to render 2DBA Remark badge
  const getRemark2DBABadge = (remark: string, isArrived: boolean) => {
    const rem = (remark || "").trim().toLowerCase();
    if (!rem || rem === "-") return <span className="text-zinc-400">-</span>;

    const rawRem = (remark || "").trim();

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

    let content: React.ReactNode = rawRem;
    if (rem.includes("2 days before arrival")) {
      content = (
        <div className="flex flex-col items-center justify-center leading-none py-1 font-semibold">
          <span>2 Days</span>
          <span className="mt-0.5">Before</span>
          <span className="mt-0.5">Arrival</span>
        </div>
      );
    }

    if (isArrived) {
      return (
        <span className="inline-flex items-center justify-center rounded-lg bg-[rgba(39,200,64,0.15)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#27C840] border border-[#27C840]/30 min-w-[85px] leading-tight text-center">
          {content}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-zinc-600 dark:text-zinc-350 border border-zinc-200 dark:border-zinc-700 min-w-[85px] leading-tight text-center">
        {content}
      </span>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl transition-colors duration-300">
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="overflow-auto max-h-[515px]"
      >
        <table className="w-full border-collapse text-left text-xs text-black dark:text-white">
          <thead>
            {/* Row header menggunakan bg-header yang seragam dan solid */}
            <tr className="bg-slate-50 dark:bg-zinc-950 font-bold text-zinc-700 dark:text-zinc-350 transition-colors duration-300 border-b border-zinc-200 dark:border-zinc-800">
              {/* Checkbox Column Header - Sticky top-0 & left-0 */}
              <th className="py-3.5 text-center w-[50px] min-w-[50px] max-w-[50px] sticky top-0 left-0 bg-slate-50 dark:bg-zinc-950 z-30 border border-zinc-200 dark:border-zinc-800">
                
              </th>
              {/* NO Column Header - Sticky top-0 & left-50 */}
              <th className="py-3.5 text-center w-[60px] min-w-[60px] max-w-[60px] sticky top-0 left-[50px] bg-slate-50 dark:bg-zinc-950 z-30 border border-zinc-200 dark:border-zinc-800">
                No
              </th>
              <th className="px-4 py-3.5 min-w-[80px] sticky top-0 bg-slate-50 dark:bg-zinc-950 z-20 border border-zinc-200 dark:border-zinc-800 text-center">QSO</th>
              <th className="px-4 py-3.5 min-w-[120px] sticky top-0 bg-slate-50 dark:bg-zinc-950 z-20 border border-zinc-200 dark:border-zinc-800 text-center">Remark 2DBA</th>
              {/* NAME Column Header - Sticky top-0 & left-110 */}
              <th className="px-5 py-3.5 w-[240px] min-w-[240px] max-w-[240px] sticky top-0 left-[110px] bg-slate-50 dark:bg-zinc-950 z-30 border border-zinc-200 dark:border-zinc-800 text-left">
                Name of Ship / Call Sign
              </th>
              <th className="px-4 py-3.5 min-w-[140px] sticky top-0 bg-slate-50 dark:bg-zinc-950 z-20 border border-zinc-200 dark:border-zinc-800 text-center">Type of Cargo</th>
              <th className="px-4 py-3.5 min-w-[120px] sticky top-0 bg-slate-50 dark:bg-zinc-950 z-20 border border-zinc-200 dark:border-zinc-800 text-center">QTY Cargo</th>
              <th className="px-4 py-3.5 min-w-[80px] sticky top-0 bg-slate-50 dark:bg-zinc-950 z-20 border border-zinc-200 dark:border-zinc-800 text-center">Flag</th>
              <th className="px-4 py-3.5 min-w-[150px] sticky top-0 bg-slate-50 dark:bg-zinc-950 z-20 border border-zinc-200 dark:border-zinc-800 text-center">Cargo on Board</th>
              <th className="px-4 py-3.5 min-w-[130px] sticky top-0 bg-slate-50 dark:bg-zinc-950 z-20 border border-zinc-200 dark:border-zinc-800 text-center">Last Port</th>
              <th className="px-4 py-3.5 min-w-[100px] sticky top-0 bg-slate-50 dark:bg-zinc-950 z-20 border border-zinc-200 dark:border-zinc-800 text-center">GT</th>
              <th className="px-4 py-3.5 min-w-[145px] sticky top-0 bg-slate-50 dark:bg-zinc-950 z-20 border border-zinc-200 dark:border-zinc-800 text-center">ETA / ETD (LT)</th>
              <th className="px-4 py-3.5 min-w-[120px] sticky top-0 bg-slate-50 dark:bg-zinc-950 z-20 border border-zinc-200 dark:border-zinc-800 text-center">General Remark</th>
              {/* Action VTS Column Header */}
              <th className="px-4 py-3.5 min-w-[120px] text-left sticky top-0 bg-slate-50 dark:bg-zinc-950 z-20 border border-zinc-200 dark:border-zinc-800">Action VTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-transparent transition-colors duration-300">
            {loading ? (
              // Loading Skeleton Row (14 columns)
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="w-[50px] min-w-[50px] max-w-[50px] py-3.5 bg-white dark:bg-zinc-900 sticky left-0 z-10 border-r border-zinc-200 dark:border-zinc-800">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4 mx-auto"></div>
                  </td>
                  <td className="w-[60px] min-w-[60px] max-w-[60px] py-3.5 bg-white dark:bg-zinc-900 sticky left-[50px] z-10 border-r border-zinc-200 dark:border-zinc-800">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-6 mx-auto"></div>
                  </td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-12"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div></td>
                  <td className="w-[240px] min-w-[240px] max-w-[240px] py-3.5 bg-white dark:bg-zinc-900 sticky left-[110px] z-10 border-r border-zinc-200 dark:border-zinc-800">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-28 mx-auto"></div>
                  </td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-10"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-12"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div></td>
                  <td className="px-4 py-3.5 text-left"><div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State Row (14 columns)
              <tr>
                <td colSpan={14} className="px-6 py-16 text-center bg-white dark:bg-zinc-900">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-400 dark:text-zinc-650" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                    </svg>
                    <p className="text-sm font-bold text-zinc-555">Tidak ada data kapal ditemukan</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">Coba ubah filter tanggal atau kata kunci pencarian Anda.</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Actual Data Rows
              data.map((ship, index) => {
                const shipKey = `${ship.Tanggal_Log}-${ship["NAME_OF_SHIP/_CALL_SIGN"]}`;
                const isPassed = isETAPassed(ship["ETA_/_ETD_(LT)"]);
                const isH1 = isETA_H1(ship["ETA_/_ETD_(LT)"]);

                const isCheckedInDb = checkedShips.has(shipKey);
                const isOverriddenUnchecked = uncheckedOverrides.has(shipKey);

                // Kapal dianggap Tiba jika diceklis di DB ATAU (ETA sudah terlewat DAN tidak di-override uncheck)
                const isArrived = isCheckedInDb || (isPassed && !isOverriddenUnchecked);

                // Penentuan styling baris berdasarkan status kapal
                let rowBgClass = "bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200";
                let stickyBgClass = "bg-white group-hover:bg-slate-50 dark:bg-zinc-900 dark:group-hover:bg-zinc-800";

                if (isArrived) {
                  // Hijau untuk Kapal Tiba/Selesai (#27C840)
                  rowBgClass = "bg-[rgba(39,200,64,0.15)] hover:bg-[rgba(39,200,64,0.22)] text-emerald-950 dark:text-emerald-100";
                  stickyBgClass = "bg-[#eafae7] dark:bg-[#072418] group-hover:opacity-90";
                } else if (isH1) {
                  // Kuning untuk Kapal H-1 (#FFCC00)
                  rowBgClass = "bg-[rgba(255,204,0,0.15)] hover:bg-[rgba(255,204,0,0.22)] text-amber-950 dark:text-amber-100";
                  stickyBgClass = "bg-[#fffceb] dark:bg-[#211b05] group-hover:opacity-90";
                }

                return (
                  <tr
                    key={`${ship.NO}-${ship["NAME_OF_SHIP/_CALL_SIGN"]}-${index}`}
                    className={`transition-colors duration-300 border-b border-zinc-200 dark:border-zinc-800 group ${rowBgClass}`}
                  >
                    {/* CHECKBOX - Sticky left-0 */}
                    <td className={`w-[50px] min-w-[50px] max-w-[50px] py-3 text-center sticky left-0 z-10 border border-zinc-200 dark:border-zinc-800 transition-colors duration-300 ${stickyBgClass}`}>
                      <button
                        type="button"
                        onClick={() => onToggleCheck(shipKey)}
                        className="flex justify-center items-center w-full focus:outline-none cursor-pointer"
                        title="Tandai kapal sudah tiba/selesai"
                      >
                        {isArrived ? (
                          <div className="w-5 h-5 flex items-center justify-center rounded bg-[#27C840] border border-[#27C840] mx-auto shadow-sm">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded border-2 border-[#27C840] bg-transparent mx-auto hover:bg-[#27C840]/10 transition-colors duration-200"></div>
                        )}
                      </button>
                    </td>

                    {/* NO - Sticky left-50 */}
                    <td className={`w-[60px] min-w-[60px] max-w-[60px] py-3 text-center font-bold text-zinc-500 dark:text-zinc-400 sticky left-[50px] z-10 border border-zinc-200 dark:border-zinc-800 transition-colors duration-300 ${stickyBgClass}`}>
                      {index + 1}
                    </td>

                    {/* QSO */}
                    <td className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 text-center">
                      {formatQSO(ship.QSO)}
                    </td>

                    {/* Remark 2DBA */}
                    <td className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 text-center">
                      {getRemark2DBABadge(ship.Remark_2DBA, isArrived)}
                    </td>

                    {/* NAME OF SHIP / CALL SIGN - Sticky left-110 */}
                    <td className={`w-[240px] min-w-[240px] max-w-[240px] px-5 py-3 font-semibold sticky left-[110px] z-10 border border-zinc-200 dark:border-zinc-800 tracking-wide transition-colors duration-300 whitespace-normal break-words leading-relaxed ${stickyBgClass} ${isArrived ? 'text-emerald-800 dark:text-emerald-300 font-bold' : isH1 ? 'text-amber-800 dark:text-amber-300 font-bold' : 'text-black dark:text-white'}`} title={ship["NAME_OF_SHIP/_CALL_SIGN"]}>
                      {formatShipName(ship["NAME_OF_SHIP/_CALL_SIGN"])}
                    </td>

                    {/* Type of Cargo */}
                    <td className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-center font-medium">
                      {ship.Type_of_Cargo_On_Board || "-"}
                    </td>

                    {/* Qty Cargo */}
                    <td className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-center">
                      {ship.Quantity_of_Cargo_on_Board || "-"}
                    </td>

                    {/* FLAG */}
                    <td className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-700 dark:text-zinc-300 text-center uppercase">
                      {ship.FLAG || "-"}
                    </td>

                    {/* Cargo On Board */}
                    <td className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 max-w-[150px] truncate text-zinc-600 dark:text-zinc-400 text-center" title={ship.Cargo_On_Board}>
                      {ship.Cargo_On_Board || "-"}
                    </td>

                    {/* Last Port */}
                    <td className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-center uppercase">
                      {ship.Last_Port || "-"}
                    </td>

                    {/* Gross Tonnage */}
                    <td className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-zinc-650 dark:text-zinc-400 text-center">
                      {ship.Gross_Tonnage || "-"}
                    </td>

                    {/* ETA / ETD (LT) */}
                    <td className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 text-primary dark:text-blue-400 font-bold text-center">
                      <div>{ship["ETA_/_ETD_(LT)"] || "-"}</div>
                      {ship["ETA_/_ETD_(LT)"] && getCountdownText(ship["ETA_/_ETD_(LT)"]) && (
                        <div className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium mt-1">
                          {getCountdownText(ship["ETA_/_ETD_(LT)"])}
                        </div>
                      )}
                    </td>

                    {/* General Remark */}
                    <td className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 italic text-zinc-600 dark:text-zinc-400 text-center">
                      {ship.REMARK || "-"}
                    </td>

                    {/* Action from VTS */}
                    <td className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 text-left">
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
