import React from "react";
import { ShipData } from "@/lib/fetcher";

interface VtsStatsProps {
  filteredData: ShipData[];
}

export default function VtsStats({ filteredData }: VtsStatsProps) {
  // 1. Total Kapal
  const totalShips = filteredData.length;

  // 2. Total Gross Tonnage (GT)
  const totalGT = filteredData.reduce((acc, ship) => {
    // Cari angka di Gross_Tonnage (misal: "3,215 GT" atau "5000" -> 3215 / 5000)
    const gtStr = ship.Gross_Tonnage || "";
    const cleanGT = gtStr.replace(/[^\d]/g, ""); // hanya ambil angka
    const gtVal = parseInt(cleanGT, 10);
    return acc + (isNaN(gtVal) ? 0 : gtVal);
  }, 0);

  // 3. Kapal Bermuatan (Cargo On Board tidak kosong / bukan "-")
  const loadedShips = filteredData.filter(ship => {
    const cargo = (ship.Cargo_On_Board || "").trim().toLowerCase();
    return cargo !== "" && cargo !== "-" && cargo !== "nil" && cargo !== "no cargo";
  }).length;

  // 4. Pelabuhan Terakhir Unik
  const uniquePorts = new Set(
    filteredData
      .map(ship => (ship.Last_Port || "").trim().toLowerCase())
      .filter(port => port !== "" && port !== "-")
  ).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Card 1: Total Kapal */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-950/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Kapal Aktif</p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">{totalShips}</h3>
          </div>
          <div className="rounded-xl bg-cyan-950/60 p-3 text-cyan-400 border border-cyan-800/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-cyan-500 to-blue-600" />
      </div>

      {/* Card 2: Total GT */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-950/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Total Gross Tonnage (GT)</p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
              {totalGT.toLocaleString("id-ID")} <span className="text-xs text-zinc-500 font-normal">GT</span>
            </h3>
          </div>
          <div className="rounded-xl bg-emerald-950/60 p-3 text-emerald-400 border border-emerald-800/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
      </div>

      {/* Card 3: Kapal Bermuatan */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-violet-500/50 hover:shadow-violet-950/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Kapal Bermuatan</p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">{loadedShips} <span className="text-xs text-zinc-500 font-normal">Kapal</span></h3>
          </div>
          <div className="rounded-xl bg-violet-950/60 p-3 text-violet-400 border border-violet-800/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-violet-500 to-purple-600" />
      </div>

      {/* Card 4: Pelabuhan Asal */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-amber-950/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">Pelabuhan Asal Unik</p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">{uniquePorts} <span className="text-xs text-zinc-500 font-normal">Lokasi</span></h3>
          </div>
          <div className="rounded-xl bg-amber-950/60 p-3 text-amber-400 border border-amber-800/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-amber-500 to-orange-600" />
      </div>
    </div>
  );
}
