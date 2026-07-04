import React, { useMemo } from "react";
import { ShipData } from "@/lib/fetcher";

interface VtsStatsProps {
  filteredData: ShipData[];
}

export default function VtsStats({ filteredData }: VtsStatsProps) {
  const stats = useMemo(() => {
    const total = filteredData.length;
    let domestic = 0;
    let international = 0;
    let cargoOnBoard = 0;
    let nilCargo = 0;

    filteredData.forEach((ship) => {
      // 1. FLAG check
      const flag = (ship.FLAG || "").trim().toUpperCase();
      if (flag === "ID" || flag === "INDONESIA" || flag === "IDN") {
        domestic++;
      } else if (flag !== "" && flag !== "-") {
        international++;
      }

      // 2. Cargo check
      const loaded = (ship.Cargo_On_Board || "").trim().toLowerCase();
      const isEmpty =
        !loaded ||
        loaded === "-" ||
        loaded === "nil" ||
        loaded === "no cargo" ||
        loaded === "kosong";

      if (isEmpty) {
        nilCargo++;
      } else {
        cargoOnBoard++;
      }
    });

    return { total, domestic, international, cargoOnBoard, nilCargo };
  }, [filteredData]);

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 xl:gap-8 my-6">

      {/* Card 1: Total Kapal Aktif */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm transition-all hover:scale-102 hover:shadow-md shrink-0">
        <span className="text-zinc-700 dark:text-zinc-300 text-[13px] md:text-sm font-extrabold uppercase tracking-wider font-sans leading-tight">
          Total Kapal Aktif
        </span>
        <div className="flex items-end justify-between w-full mt-auto">
          <span className="text-black dark:text-white text-4xl md:text-5xl font-extrabold font-sans leading-none">
            {stats.total}
          </span>
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/stat-total-active.png" alt="Total Kapal" className="h-14 w-14 object-contain" />
          </div>
        </div>
      </div>

      {/* Card 2: Kapal DALAM NEGERI */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm transition-all hover:scale-102 hover:shadow-md shrink-0">
        <span className="text-zinc-700 dark:text-zinc-300 text-[13px] md:text-sm font-extrabold uppercase tracking-wider font-sans leading-tight">
          Kapal Dalam Negeri
        </span>
        <div className="flex items-end justify-between w-full mt-auto">
          <span className="text-black dark:text-white text-4xl md:text-5xl font-extrabold font-sans leading-none">
            {stats.domestic}
          </span>
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/stat-nil-cargo.png" alt="Kapal DN" className="h-14 w-14 object-contain" />
          </div>
        </div>
      </div>

      {/* Card 3: Kapal LUAR NEGERI */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm transition-all hover:scale-102 hover:shadow-md shrink-0">
        <span className="text-zinc-700 dark:text-zinc-300 text-[13px] md:text-sm font-extrabold uppercase tracking-wider font-sans leading-tight">
          Kapal Luar Negeri
        </span>
        <div className="flex items-end justify-between w-full mt-auto">
          <span className="text-black dark:text-white text-4xl md:text-5xl font-extrabold font-sans leading-none">
            {stats.international}
          </span>
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/stat-international.png" alt="Kapal LN" className="h-14 w-14 object-contain" />
          </div>
        </div>
      </div>

      {/* Card 4: Cargo on Board */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm transition-all hover:scale-102 hover:shadow-md shrink-0">
        <span className="text-zinc-700 dark:text-zinc-300 text-[13px] md:text-sm font-extrabold uppercase tracking-wider font-sans leading-tight">
          Cargo on Board
        </span>
        <div className="flex items-end justify-between w-full mt-auto">
          <span className="text-black dark:text-white text-4xl md:text-5xl font-extrabold font-sans leading-none">
            {stats.cargoOnBoard}
          </span>
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/stat-cargo-on-board.png" alt="Cargo on Board" className="h-14 w-14 object-contain" />
          </div>
        </div>
      </div>

      {/* Card 5: Nil Cargo */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between h-32 shadow-sm transition-all hover:scale-102 hover:shadow-md shrink-0">
        <span className="text-zinc-700 dark:text-zinc-300 text-[13px] md:text-sm font-extrabold uppercase tracking-wider font-sans leading-tight">
          Nil Cargo
        </span>
        <div className="flex items-end justify-between w-full mt-auto">
          <span className="text-black dark:text-white text-4xl md:text-5xl font-extrabold font-sans leading-none">
            {stats.nilCargo}
          </span>
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/stat-domestic.png" alt="Nil Cargo" className="h-14 w-14 object-contain" />
          </div>
        </div>
      </div>

    </div>
  );
}
