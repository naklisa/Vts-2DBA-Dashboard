"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getShipData, ShipData } from "@/lib/fetcher";
import VtsStats from "@/components/vts-stats";
import DateFilter from "@/components/date-filter";
import SearchBar from "@/components/search-bar";
import DataTable from "@/components/data-table";
import ConfirmationModal from "@/components/confirmation-modal";
import SettingsPanel from "@/components/settings-panel";
import { isETAPassed, parseDateString } from "@/lib/date-utils";

export default function DashboardPage() {
  const [data, setData] = useState<ShipData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isApiConfigured, setIsApiConfigured] = useState<boolean>(true);
  
  // State untuk auto-sync countdown & suara sonar
  const [countdown, setCountdown] = useState<number>(10);
  const [sonarActive, setSonarActive] = useState<boolean>(true);
  const [scrollSpeed, setScrollSpeed] = useState<string>("normal");
  const [syncInterval, setSyncInterval] = useState<number>(10);

  // State untuk panel analitis grafik visual


  // Fungsi pemutar suara sonar ping kapal selam
  const playSonarPing = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 1.2);
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch {
      // Abaikan error audio
    }
  };
  
  // State untuk melacak kapal yang diceklis & override uncheck
  const [checkedShips, setCheckedShips] = useState<Set<string>>(new Set());
  const [uncheckedOverrides, setUncheckedOverrides] = useState<Set<string>>(new Set());

  // State untuk modal konfirmasi
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedShipKey, setSelectedShipKey] = useState<string>("");
  const [selectedShipName, setSelectedShipName] = useState<string>("");
  const [selectedShipAction, setSelectedShipAction] = useState<string>("");

  // Cek apakah API URL masih menggunakan placeholder
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    if (apiUrl.includes("YOUR_APPS_SCRIPT_DEPLOYMENT_ID") || !apiUrl) {
      setTimeout(() => {
        setIsApiConfigured(false);
      }, 0);
    }
  }, []);

  // Fetch status arrived & override dari server database internal
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

  // Load preferensi HUD dan fetch data awal
  useEffect(() => {
    // Jalankan preferensi client
    const storedSonar = localStorage.getItem("vts_sonar_active");
    const storedScroll = localStorage.getItem("vts_scroll_speed");
    const storedSync = localStorage.getItem("vts_sync_interval");

    setTimeout(() => {
      if (storedSonar) setSonarActive(storedSonar === "true");
      if (storedScroll) setScrollSpeed(storedScroll);
      if (storedSync) {
        const parsedInterval = parseInt(storedSync, 10);
        setSyncInterval(parsedInterval);
        setCountdown(parsedInterval);
      }
      // Fetch data arrived dari DB internal server
      fetchArrivedStatus();
    }, 0);
  }, []);

  // Fetch data kapal dari GAS sekali saja saat komponen di-load
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const shipData = await getShipData();
      setData(shipData);
      setLoading(false);
    }

    loadData();
  }, []);

  // Fungsi helper manual sync
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

  // HUD setters yang juga menyimpan ke localStorage
  const changeScrollSpeed = (speed: string) => {
    setScrollSpeed(speed);
    localStorage.setItem("vts_scroll_speed", speed);
  };

  const changeSonarActive = (active: boolean) => {
    setSonarActive(active);
    localStorage.setItem("vts_sonar_active", String(active));
  };

  const changeSyncInterval = (interval: number) => {
    setSyncInterval(interval);
    localStorage.setItem("vts_sync_interval", String(interval));
    setCountdown(interval);
  };

  // Auto-sync data berkala dengan interval dinamis & sonar detector
  useEffect(() => {
    if (syncInterval === 0) {
      // Mode Manual: timer dinonaktifkan
      return;
    }

    setTimeout(() => {
      setCountdown(syncInterval);
    }, 0);

    const interval = setInterval(async () => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const syncInBackground = async () => {
            try {
              const shipData = await getShipData();
              if (shipData && shipData.length > 0) {
                setData((prevData) => {
                  if (prevData.length > 0 && shipData.length > prevData.length) {
                    if (sonarActive) {
                      playSonarPing();
                    }
                  }
                  return shipData;
                });
              }
              await fetchArrivedStatus();
            } catch (e) {
              console.error("Auto-sync error:", e);
            }
          };
          syncInBackground();
          return syncInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sonarActive, syncInterval]);

  // Pancarkan event countdown auto-sync ke navbar
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("vts-sync-countdown", {
          detail: { countdown: syncInterval === 0 ? null : countdown, loading }
        })
      );
    }
  }, [countdown, loading, syncInterval]);

  // Listener ESC untuk menutup modal analitik




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

  // Helper untuk mendeteksi apakah kapal telah melewati ETA
  const isShipETAPassed = (shipKey: string) => {
    const ship = data.find(s => `${s.Tanggal_Log}-${s["NAME_OF_SHIP/_CALL_SIGN"]}` === shipKey);
    return ship ? isETAPassed(ship["ETA_/_ETD_(LT)"]) : false;
  };

  // Fungsi pemicu klik checkbox (tentukan aksi, lalu buka modal konfirmasi)
  const handleToggleCheckClick = (shipKey: string) => {
    const parts = shipKey.split("-");
    const shipName = parts.slice(1).join("-");
    
    const isPassed = isShipETAPassed(shipKey);
    const isCheckedInDb = checkedShips.has(shipKey);
    const isOverriddenUnchecked = uncheckedOverrides.has(shipKey);
    const currentlyArrived = isCheckedInDb || (isPassed && !isOverriddenUnchecked);

    let action = "";
    if (currentlyArrived) {
      // Ingin uncheck
      if (isPassed) {
        action = "uncheck_override"; // ETA sudah lewat, butuh override uncheck
      } else {
        action = "uncheck_manual"; // Belum lewat ETA, tinggal uncheck
      }
    } else {
      // Ingin check
      if (isPassed) {
        action = "reset_override"; // Sudah lewat ETA tapi teroverride, kita reset biar tercentang lagi
      } else {
        action = "check"; // Belum lewat ETA, kita tandai tiba manual
      }
    }

    setSelectedShipKey(shipKey);
    setSelectedShipName(shipName);
    setSelectedShipAction(action);
    setModalOpen(true);
  };

  // Callback dari Modal untuk konfirmasi perubahan ceklis (POST ke server)
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
      console.error("Failed to confirm arrived status update:", e);
    }
    setModalOpen(false);
  };

  // Saring data secara dinamis berdasarkan selectedDate & searchQuery
  const filteredData = useMemo(() => {
    return data.filter(ship => {
      const matchDate = selectedDate === "Semua" || ship.Tanggal_Log === selectedDate;
      const shipName = (ship["NAME_OF_SHIP/_CALL_SIGN"] || "").toLowerCase();
      const matchSearch = shipName.includes(searchQuery.toLowerCase());
      return matchDate && matchSearch;
    });
  }, [data, selectedDate, searchQuery]);



  return (
    <div className="flex flex-col gap-6">
      
      {/* Banner Peringatan Developer jika API belum disetup */}
      {!isApiConfigured && (
        <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4 backdrop-blur-md max-w-[1760px] mx-auto w-full">
          <div className="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="text-sm font-bold text-amber-400">Peringatan Integrasi API (GAS)</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Anda belum mengonfigurasi URL Web App Google Apps Script pada file <code className="text-amber-300">my-vts-dashboard/.env.local</code>. 
                Ganti nilai <code className="text-amber-300">NEXT_PUBLIC_API_URL</code> dengan URL yang valid agar data dari Google Sheets terintegrasi ke sistem ini.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Blue Header Banner - Stats and Title Section */}
      <div className="relative overflow-hidden -mx-6 md:-mx-12 xl:-mx-20 px-6 md:px-12 xl:px-20 py-8 bg-primary/10 dark:bg-primary/20 border-b border-zinc-200 dark:border-zinc-800/60 transition-colors duration-300">
        


        <div className="relative max-w-[1760px] mx-auto z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-black dark:text-white font-sans">
                Dashboard Monitoring
              </h2>
              <p className="text-sm text-zinc-555 dark:text-zinc-400 mt-1">
                Pantau pergerakan kapal 2 hari sebelum kedatangan (2 Days Before Arrival).
              </p>
            </div>
            

          </div>

          {/* Ringkasan Statistik */}
          <VtsStats filteredData={filteredData} />
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
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-2 bg-background/50 p-3 rounded-xl border border-border transition-colors duration-300">
          <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">Legenda Baris Tabel:</span>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-arrived border border-emerald-500/40"></span>
            <span>Hijau: Kapal Tiba / Selesai (Dicentang / ETA Lewat)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-h1 border border-amber-500/40"></span>
            <span>Kuning: Kapal H-1 Kedatangan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-sticky border border-border"></span>
            <span>Abu-abu / Terang: Normal (H-2 atau lebih)</span>
          </div>
        </div>
      </div>

      {/* Tabel Data Utama */}
        <DataTable 
          data={filteredData} 
          loading={loading} 
          checkedShips={checkedShips}
          uncheckedOverrides={uncheckedOverrides}
          onToggleCheck={handleToggleCheckClick}
          scrollSpeed={scrollSpeed}
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
        setScrollSpeed={changeScrollSpeed}
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
