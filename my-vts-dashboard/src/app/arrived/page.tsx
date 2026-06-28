"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getShipData, ShipData } from "@/lib/fetcher";
import { isETAPassed, parseDateString } from "@/lib/date-utils";
import VtsStats from "@/components/vts-stats";
import DateFilter from "@/components/date-filter";
import SearchBar from "@/components/search-bar";
import DataTable from "@/components/data-table";
import ConfirmationModal from "@/components/confirmation-modal";
import SettingsPanel from "@/components/settings-panel";

export default function ArrivedPage() {
  const [data, setData] = useState<ShipData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // State untuk auto-sync countdown & status
  const [countdown, setCountdown] = useState<number>(10);
  const [checkedShips, setCheckedShips] = useState<Set<string>>(new Set());
  const [uncheckedOverrides, setUncheckedOverrides] = useState<Set<string>>(new Set());
  const [syncInterval, setSyncInterval] = useState<number>(10);

  // State untuk settings panel
  const [scrollSpeed, setScrollSpeed] = useState<string>("off");
  const [sonarActive, setSonarActive] = useState<boolean>(true);

  // State untuk modal konfirmasi
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedShipKey, setSelectedShipKey] = useState<string>("");
  const [selectedShipName, setSelectedShipName] = useState<string>("");
  const [selectedShipAction, setSelectedShipAction] = useState<string>("");

  // Fetch status arrived & override dari database internal
  const fetchArrivedStatus = async () => {
    try {
      const response = await fetch("/api/arrived");
      if (response.ok) {
        const result = await response.json();
        setCheckedShips(new Set(result.arrivedKeys || []));
        setUncheckedOverrides(new Set(result.undockedKeys || []));
      }
    } catch (e) {
      console.error("Failed to fetch arrived status:", e);
    }
  };

  // Load preferensi sync, sonar, scroll & initial fetches
  useEffect(() => {
    const storedSync = localStorage.getItem("vts_sync_interval");
    const storedSonar = localStorage.getItem("vts_sonar_active");
    const storedScroll = localStorage.getItem("vts_scroll_speed");
    setTimeout(() => {
      if (storedSync) {
        const parsedInterval = parseInt(storedSync, 10);
        setSyncInterval(parsedInterval);
        setCountdown(parsedInterval);
      }
      if (storedSonar) {
        setSonarActive(storedSonar === "true");
      }
      if (storedScroll) {
        setScrollSpeed(storedScroll);
      }
      fetchArrivedStatus();
    }, 0);
  }, []);

  // Fungsi pengubah preferensi
  const changeSonarActive = (active: boolean) => {
    setSonarActive(active);
    localStorage.setItem("vts_sonar_active", active ? "true" : "false");
  };

  const changeSyncInterval = (interval: number) => {
    setSyncInterval(interval);
    setCountdown(interval);
    localStorage.setItem("vts_sync_interval", interval.toString());
  };

  const handleManualSync = async () => {
    setLoading(true);
    try {
      const shipData = await getShipData();
      if (shipData && shipData.length > 0) {
        setData(shipData);
      }
      await fetchArrivedStatus();
    } catch (e) {
      console.error("Manual sync error:", e);
    } finally {
      setLoading(false);
    }
  };

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

  // Auto-sync data secara berkala setiap N detik dengan hitung mundur
  useEffect(() => {
    if (syncInterval === 0) {
      return;
    }

    setTimeout(() => {
      setCountdown(syncInterval);
    }, 0);

    const interval = setInterval(async () => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const syncData = async () => {
            setLoading(true);
            try {
              const shipData = await getShipData();
              if (shipData && shipData.length > 0) {
                setData(shipData);
              }
              await fetchArrivedStatus();
            } catch (e) {
              console.error("Auto-sync error:", e);
            } finally {
              setLoading(false);
            }
          };
          syncData();
          return syncInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [syncInterval]);

  // Pancarkan event countdown auto-sync ke navbar/settings panel
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("vts-sync-countdown", {
          detail: { countdown: syncInterval === 0 ? null : countdown, loading }
        })
      );
    }
  }, [countdown, loading, syncInterval]);

  // Fungsi pengurutan tanggal
  const sortDates = (dateList: string[]) => {
    return [...dateList].sort((a, b) => {
      return parseDateString(a).getTime() - parseDateString(b).getTime();
    });
  };

  // Ambil semua daftar tanggal unik untuk filter dropdown
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(data.map(ship => ship.Tanggal_Log).filter(Boolean)));
    return sortDates(dates);
  }, [data]);

  // Saring semua kapal yang berstatus arrived
  const arrivedShips = useMemo(() => {
    return data.filter(ship => {
      const shipKey = `${ship.Tanggal_Log}-${ship["NAME_OF_SHIP/_CALL_SIGN"]}`;
      const isChecked = checkedShips.has(shipKey);
      const isPassed = isETAPassed(ship["ETA_/_ETD_(LT)"]);
      const isOverriddenUnchecked = uncheckedOverrides.has(shipKey);
      return isChecked || (isPassed && !isOverriddenUnchecked);
    });
  }, [data, checkedShips, uncheckedOverrides]);

  // Saring berdasarkan tanggal & pencarian input
  const filteredArrivedShips = useMemo(() => {
    return arrivedShips.filter(ship => {
      const matchDate = selectedDate === "Semua" || ship.Tanggal_Log === selectedDate;
      const shipName = (ship["NAME_OF_SHIP/_CALL_SIGN"] || "").toLowerCase();
      const matchSearch = shipName.includes(searchQuery.toLowerCase());
      return matchDate && matchSearch;
    });
  }, [arrivedShips, selectedDate, searchQuery]);

  // Untuk stats card: tampilkan data sesuai tanggal log yang dipilih
  const statsData = useMemo(() => {
    return data.filter(ship => {
      const matchDate = selectedDate === "Semua" || ship.Tanggal_Log === selectedDate;
      return matchDate;
    });
  }, [data, selectedDate]);

  // Panggil modal konfirmasi pas diklik checkbox (tentukan target action)
  const handleToggleCheckClick = (shipKey: string) => {
    const parts = shipKey.split("-");
    const shipName = parts.slice(1).join("-");
    
    // Cari status kapal
    const ship = data.find(s => `${s.Tanggal_Log}-${s["NAME_OF_SHIP/_CALL_SIGN"]}` === shipKey);
    const isPassed = ship ? isETAPassed(ship["ETA_/_ETD_(LT)"]) : false;
    const isCheckedInDb = checkedShips.has(shipKey);
    const isOverriddenUnchecked = uncheckedOverrides.has(shipKey);
    const currentlyArrived = isCheckedInDb || (isPassed && !isOverriddenUnchecked);

    let action = "";
    if (currentlyArrived) {
      if (isPassed) {
        action = "uncheck_override";
      } else {
        action = "uncheck_manual";
      }
    } else {
      if (isPassed) {
        action = "reset_override";
      } else {
        action = "check";
      }
    }

    setSelectedShipKey(shipKey);
    setSelectedShipName(shipName);
    setSelectedShipAction(action);
    setModalOpen(true);
  };

  // Konfirmasi perubahan ceklis dengan memanggil API server
  const handleConfirmToggle = async () => {
    try {
      const response = await fetch("/api/arrived", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipKey: selectedShipKey, action: selectedShipAction }),
      });
      if (response.ok) {
        const result = await response.json();
        setCheckedShips(new Set(result.arrivedKeys || []));
        setUncheckedOverrides(new Set(result.undockedKeys || []));
      }
    } catch (e) {
      console.error("Failed to update status on server:", e);
    }
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Blue Header Banner - Stats and Title Section */}
      <div className="relative overflow-hidden -mx-6 md:-mx-12 xl:-mx-20 px-6 md:px-12 xl:px-20 py-8 bg-primary/10 dark:bg-primary/20 border-b border-zinc-200 dark:border-zinc-800/60 transition-colors duration-300">
        
        {/* Subtle Watermark inside Banner */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Logo.png" alt="Watermark Banner" className="w-[450px] h-[450px] object-contain select-none animate-[pulse_6s_ease-in-out_infinite]" />
        </div>

        <div className="relative max-w-[1760px] mx-auto z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-black dark:text-white font-sans">
                Kapal Tiba Monitoring
              </h2>
              <p className="text-sm text-zinc-555 dark:text-zinc-400 mt-1">
                Pantau pergerakan kapal 2 hari sebelum kedatangan (2 Days Before Arrival).
              </p>
            </div>
          </div>

          {/* Ringkasan Statistik */}
          <VtsStats filteredData={statsData} />
        </div>
      </div>

      {/* Main Content Area: Filters, Legend and Data Table */}
      <div className="max-w-[1760px] mx-auto w-full flex flex-col gap-6 relative z-20">
        
        {/* Filter & Kontrol Pencarian */}
        <div className="flex flex-col gap-4 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-slate-100/50 dark:bg-zinc-900/30 backdrop-blur-md transition-colors duration-300 relative z-40">
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
          <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-2 bg-white dark:bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
            <span className="text-black dark:text-zinc-300 uppercase tracking-wider text-[11px] font-extrabold">LEGENDA BARIS TABEL:</span>
            
            <div className="flex items-center gap-2">
              <span className="h-4.5 w-6 rounded bg-[rgba(39,200,64,0.15)] border border-[rgba(39,200,64,0.3)] shadow-sm"></span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Hijau: Kapal Tiba / Melewati ETA</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="h-4.5 w-6 rounded bg-[rgba(255,204,0,0.15)] border border-[rgba(255,204,0,0.3)] shadow-sm"></span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Kuning: H-1 Kedatangan</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="h-4.5 w-6 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"></span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Putih: H-2 / Lebih Kedatangan</span>
            </div>
          </div>
        </div>

        {/* Tabel Data Utama */}
        <DataTable 
          data={filteredArrivedShips} 
          loading={loading} 
          checkedShips={checkedShips}
          uncheckedOverrides={uncheckedOverrides}
          onToggleCheck={handleToggleCheckClick}
          scrollSpeed="off"
        />
      </div>

      {/* Modal Konfirmasi Ceklis */}
      <ConfirmationModal
        isOpen={modalOpen}
        shipName={selectedShipName}
        isChecking={selectedShipAction === "check" || selectedShipAction === "reset_override"}
        onConfirm={handleConfirmToggle}
        onCancel={() => setModalOpen(false)}
      />

      {/* Panel Pengaturan HUD Melayang */}
      <SettingsPanel
        scrollSpeed={scrollSpeed}
        setScrollSpeed={setScrollSpeed}
        sonarActive={sonarActive}
        setSonarActive={changeSonarActive}
        syncInterval={syncInterval}
        setSyncInterval={changeSyncInterval}
        onManualSync={handleManualSync}
        isSyncing={loading}
      />
    </div>
  );
}
