"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getShipData, ShipData } from "@/lib/fetcher";
import VtsStats from "@/components/vts-stats";
import DateFilter from "@/components/date-filter";
import SearchBar from "@/components/search-bar";
import DataTable from "@/components/data-table";
import ConfirmationModal from "@/components/confirmation-modal";

export default function DashboardPage() {
  const [data, setData] = useState<ShipData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>("01/JUNI/2026");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isApiConfigured, setIsApiConfigured] = useState<boolean>(true);
  
  // State untuk melacak kapal yang diceklis (persisten via localStorage)
  const [checkedShips, setCheckedShips] = useState<Set<string>>(new Set());

  // State untuk modal konfirmasi
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedShipKey, setSelectedShipKey] = useState<string>( "");
  const [selectedShipName, setSelectedShipName] = useState<string>("");

  // Cek apakah API URL masih menggunakan placeholder
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    if (apiUrl.includes("YOUR_APPS_SCRIPT_DEPLOYMENT_ID") || !apiUrl) {
      setIsApiConfigured(false);
    }
  }, []);

  // Load status ceklis kapal dari localStorage saat pertama kali masuk (Client-side)
  useEffect(() => {
    const stored = localStorage.getItem("vts_checked_ships");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCheckedShips(new Set(parsed));
        }
      } catch (e) {
        console.error("Failed to parse checked ships from localStorage:", e);
      }
    }
  }, []);

  // Fetch data kapal dari GAS sekali saja saat komponen di-load
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const shipData = await getShipData();
      setData(shipData);
      
      // Jika data berhasil di-fetch dan tidak kosong
      if (shipData.length > 0) {
        // Ambil semua tanggal unik yang ada di data
        const uniqueDates = Array.from(new Set(shipData.map(s => s.Tanggal_Log).filter(Boolean)));
        
        // Cek apakah default "01/JUNI/2026" ada di dalam data
        if (uniqueDates.includes("01/JUNI/2026")) {
          setSelectedDate("01/JUNI/2026");
        } else if (uniqueDates.length > 0) {
          // Jika tidak ada, pakai tanggal pertama yang tersedia (setelah diurutkan)
          const sorted = sortDates(uniqueDates);
          setSelectedDate(sorted[0]);
        }
      }
      setLoading(false);
    }

    loadData();
  }, []);

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

  // Fungsi pengurutan tanggal
  const sortDates = (dateList: string[]) => {
    return [...dateList].sort((a, b) => {
      return parseDateString(a).getTime() - parseDateString(b).getTime();
    });
  };

  // Ambil semua daftar tanggal unik untuk filter dropdown (urut kalender)
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(data.map(ship => ship.Tanggal_Log).filter(Boolean)));
    return sortDates(dates);
  }, [data]);

  // Fungsi pemicu klik checkbox (buka modal terlebih dahulu)
  const handleToggleCheckClick = (shipKey: string) => {
    const parts = shipKey.split("-");
    const shipName = parts.slice(1).join("-");
    
    setSelectedShipKey(shipKey);
    setSelectedShipName(shipName);
    setModalOpen(true);
  };

  // Callback dari Modal untuk konfirmasi perubahan ceklis
  const handleConfirmToggle = () => {
    setCheckedShips(prev => {
      const next = new Set(prev);
      if (next.has(selectedShipKey)) {
        next.delete(selectedShipKey);
      } else {
        next.add(selectedShipKey);
      }
      localStorage.setItem("vts_checked_ships", JSON.stringify(Array.from(next)));
      return next;
    });
    setModalOpen(false);
  };

  // Saring data secara dinamis berdasarkan selectedDate & searchQuery
  const filteredData = useMemo(() => {
    return data.filter(ship => {
      const matchDate = ship.Tanggal_Log === selectedDate;
      const shipName = (ship["NAME_OF_SHIP/_CALL_SIGN"] || "").toLowerCase();
      const matchSearch = shipName.includes(searchQuery.toLowerCase());
      return matchDate && matchSearch;
    });
  }, [data, selectedDate, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Banner Peringatan Developer jika API belum disetup */}
      {!isApiConfigured && (
        <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4 backdrop-blur-md">
          <div className="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-sm font-bold text-amber-400">Peringatan Integrasi API (GAS)</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Brek, lo belum ngeset URL Web App Google Apps Script lo di file <code className="text-amber-300">my-vts-dashboard/.env.local</code>. 
                Ganti nilai <code className="text-amber-300">NEXT_PUBLIC_API_URL</code> dengan URL asli biar data dari Google Sheets ngalir ke sini ya.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Halaman Utama */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard Monitoring 2DBA</h2>
          <p className="text-sm text-zinc-400">Pantau pergerakan kapal 2 hari sebelum kedatangan (2 Days Before Arrival).</p>
        </div>
        
        {/* Tombol refresh data */}
        <button
          onClick={async () => {
            setLoading(true);
            const shipData = await getShipData();
            setData(shipData);
            setLoading(false);
          }}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-white font-medium text-sm px-4 py-2.5 transition-all outline-none focus:ring-2 focus:ring-zinc-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
          </svg>
          Sync Data
        </button>
      </div>

      {/* Ringkasan Statistik */}
      <VtsStats filteredData={filteredData} />

      {/* Filter & Kontrol Pencarian */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-6">
          <DateFilter 
            dates={availableDates} 
            selectedDate={selectedDate} 
            onChange={setSelectedDate} 
          />
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
          />
        </div>

        {/* Legenda Warna Baris */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-400 mt-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
          <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Legenda Baris Tabel:</span>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/40"></span>
            <span>Hijau: Kapal Tiba / Selesai (Dicentang / ETA Lewat)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-amber-500/20 border border-amber-500/40"></span>
            <span>Kuning: Kapal H-1 Kedatangan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-zinc-900 border border-zinc-850"></span>
            <span>Abu-abu: Normal (H-2 atau lebih)</span>
          </div>
        </div>
      </div>

      {/* Tabel Data Utama */}
      <DataTable 
        data={filteredData} 
        loading={loading} 
        checkedShips={checkedShips}
        onToggleCheck={handleToggleCheckClick}
      />

      {/* Modal Konfirmasi Ceklis */}
      <ConfirmationModal
        isOpen={modalOpen}
        shipName={selectedShipName}
        isChecking={!checkedShips.has(selectedShipKey)}
        onConfirm={handleConfirmToggle}
        onCancel={() => setModalOpen(false)}
      />

    </div>
  );
}
