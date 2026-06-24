"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getShipData, ShipData } from "@/lib/fetcher";
import SearchBar from "@/components/search-bar";
import DataTable from "@/components/data-table";
import ConfirmationModal from "@/components/confirmation-modal";

export default function ArrivedPage() {
  const [data, setData] = useState<ShipData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [checkedShips, setCheckedShips] = useState<Set<string>>(new Set());

  // State untuk modal konfirmasi
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedShipKey, setSelectedShipKey] = useState<string>("");
  const [selectedShipName, setSelectedShipName] = useState<string>("");

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
        console.error("Failed to parse checked ships:", e);
      }
    }
  }, []);

  // Fetch data kapal dari GAS
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const shipData = await getShipData();
      setData(shipData);
      setLoading(false);
    }
    loadData();
  }, []);

  // Auto-sync data secara berkala setiap 10 detik tanpa memblokir UI
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const shipData = await getShipData();
        if (shipData && shipData.length > 0) {
          setData(shipData);
        }
      } catch (e) {
        console.error("Auto-sync error:", e);
      }
    }, 10000);

    return () => clearInterval(interval);
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

  // Helper untuk cek apakah ETA sudah lewat dari hari ini (realtime)
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

  // Saring kapal yang sudah tiba (diceklis ATAU ETA-nya sudah terlampaui)
  const arrivedShips = useMemo(() => {
    return data.filter(ship => {
      const shipKey = `${ship.Tanggal_Log}-${ship["NAME_OF_SHIP/_CALL_SIGN"]}`;
      const isChecked = checkedShips.has(shipKey);
      const isPassed = isETAPassed(ship.Tanggal_Log, ship["ETA_/_ETD_(LT)"]);
      return isChecked || isPassed;
    });
  }, [data, checkedShips]);

  // Saring berdasarkan input pencarian
  const filteredArrivedShips = useMemo(() => {
    return arrivedShips.filter(ship => {
      const shipName = (ship["NAME_OF_SHIP/_CALL_SIGN"] || "").toLowerCase();
      return shipName.includes(searchQuery.toLowerCase());
    });
  }, [arrivedShips, searchQuery]);

  // Panggil modal konfirmasi pas diklik checkbox
  const handleToggleCheckClick = (shipKey: string) => {
    const parts = shipKey.split("-");
    const shipName = parts.slice(1).join("-");
    
    setSelectedShipKey(shipKey);
    setSelectedShipName(shipName);
    setModalOpen(true);
  };

  // Konfirmasi perubahan ceklis
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

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Riwayat Kedatangan Kapal</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-450">Daftar semua kapal yang telah bersandar atau melewati waktu ETA terencana.</p>
        </div>
        
        {/* Total Arrived Stats Badge (Menggunakan variabel arrived CSS) */}
        <div className="rounded-xl border border-emerald-500/20 bg-arrived px-4 py-2 text-arrived-text font-bold text-sm transition-colors duration-300">
          Total Tiba: {arrivedShips.length} Kapal
        </div>
      </div>

      {/* Kontrol Pencarian */}
      <div className="flex flex-col p-6 rounded-2xl border border-border bg-card backdrop-blur-md transition-colors duration-300">
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
        />
      </div>

      {/* Tabel Data Utama */}
      <DataTable 
        data={filteredArrivedShips} 
        loading={loading} 
        checkedShips={checkedShips}
        onToggleCheck={handleToggleCheckClick}
      />

      {/* Modal Konfirmasi */}
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
