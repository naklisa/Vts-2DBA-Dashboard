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
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);

  // Fungsi pemutar suara sonar ping kapal selam
  const playSonarPing = () => {
    try {
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
    } catch (e) {
      console.error("Failed to play sonar ping:", e);
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
      setIsApiConfigured(false);
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
    if (storedSonar) setSonarActive(storedSonar === "true");

    const storedScroll = localStorage.getItem("vts_scroll_speed");
    if (storedScroll) setScrollSpeed(storedScroll);

    const storedSync = localStorage.getItem("vts_sync_interval");
    if (storedSync) {
      const parsedInterval = parseInt(storedSync, 10);
      setSyncInterval(parsedInterval);
      setCountdown(parsedInterval);
    }

    // Fetch data arrived dari DB internal server
    fetchArrivedStatus();
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

    setCountdown(syncInterval);

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
  useEffect(() => {
    if (!showAnalytics) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAnalytics(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAnalytics]);



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

  // Hitung statistik kargo untuk SVG Donut Chart
  const cargoStats = useMemo(() => {
    const counts: Record<string, number> = {
      "BATU BARA": 0,
      "CPO": 0,
      "MINYAK/BBM": 0,
      "KONTAINER": 0,
      "LAINNYA": 0,
      "KOSONG": 0,
    };
    
    filteredData.forEach(ship => {
      const cargo = (ship.Type_of_Cargo_On_Board || "").trim().toUpperCase();
      const loaded = (ship.Cargo_On_Board || "").trim().toLowerCase();
      const isEmpty = !loaded || loaded === "-" || loaded === "nil" || loaded === "no cargo" || loaded === "kosong";

      if (isEmpty) {
        counts["KOSONG"]++;
      } else if (cargo.includes("BATU BARA") || cargo.includes("COAL") || cargo.includes("KOBAL")) {
        counts["BATU BARA"]++;
      } else if (cargo.includes("CPO") || cargo.includes("SAWIT") || cargo.includes("PALM")) {
        counts["CPO"]++;
      } else if (cargo.includes("OIL") || cargo.includes("BBM") || cargo.includes("MINYAK") || cargo.includes("SOLAR") || cargo.includes("ASPHALT") || cargo.includes("ASPAL")) {
        counts["MINYAK/BBM"]++;
      } else if (cargo.includes("CONTAINER") || cargo.includes("PETIKEMAS") || cargo.includes("KONTAINER")) {
        counts["KONTAINER"]++;
      } else {
        counts["LAINNYA"]++;
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [filteredData]);

  // Hitung perbandingan bendera untuk SVG Bar Chart
  const flagStats = useMemo(() => {
    let domestic = 0;
    let foreign = 0;
    
    filteredData.forEach(ship => {
      const flag = (ship.FLAG || "").trim().toUpperCase();
      if (flag === "ID" || flag === "INDONESIA" || flag === "IDN") {
        domestic++;
      } else if (flag !== "" && flag !== "-") {
        foreign++;
      }
    });
    
    return { domestic, foreign };
  }, [filteredData]);

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
                Anda belum mengonfigurasi URL Web App Google Apps Script pada file <code className="text-amber-300">my-vts-dashboard/.env.local</code>. 
                Ganti nilai <code className="text-amber-300">NEXT_PUBLIC_API_URL</code> dengan URL yang valid agar data dari Google Sheets terintegrasi ke sistem ini.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Halaman Utama */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Monitoring 2DBA</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-450">Pantau pergerakan kapal 2 hari sebelum kedatangan (2 Days Before Arrival).</p>
        </div>
        
        {/* Tombol Tampilkan Analitik Grafik */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-md outline-none focus:ring-2 focus:ring-zinc-400/50 dark:focus:ring-zinc-700/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Tampilkan Analitik Grafik (Visual)
          </button>
        </div>
      </div>

      {/* Ringkasan Statistik */}
      <VtsStats filteredData={filteredData} />

      {/* Modal Popup Grafik Analitik */}
      {showAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-2xl border border-border bg-card/95 backdrop-blur-md p-6 shadow-2xl transition-colors duration-300 max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Analitik & Statistik Distribusi Kapal (2DBA)
              </h3>
              <button
                type="button"
                onClick={() => setShowAnalytics(false)}
                className="text-zinc-400 hover:text-foreground p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-zinc-400/50"
                title="Tutup (ESC)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Konten Modal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Donut Chart Distribusi Kargo */}
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
                  Distribusi Muatan Kapal (Cargo)
                </h4>
                
                {cargoStats.length === 0 ? (
                  <div className="text-xs text-zinc-500 py-10 text-center">Tidak ada data kargo untuk ditampilkan</div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-2">
                    {/* SVG Donut Chart */}
                    <div className="relative w-36 h-36 shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          className="stroke-zinc-100 dark:stroke-zinc-800"
                          strokeWidth="12"
                        />
                        {(() => {
                          let accumulatedPercent = 0;
                          const colors = [
                            "#06b6d4", // cyan-500
                            "#8b5cf6", // violet-500
                            "#f59e0b", // amber-500
                            "#ef4444", // red-500
                            "#10b981", // emerald-500
                            "#64748b", // slate-500
                          ];
                          const totalVal = cargoStats.reduce((sum, item) => sum + item.value, 0);

                          return cargoStats.map((item, index) => {
                            const percent = (item.value / totalVal) * 100;
                            const circumference = 2 * Math.PI * 40; // 251.3
                            const strokeDasharray = `${circumference}`;
                            const strokeDashoffset = circumference - (percent / 100) * circumference;
                            const rotationOffset = (accumulatedPercent / 100) * 360;
                            accumulatedPercent += percent;

                            return (
                              <circle
                                key={item.name}
                                cx="50"
                                cy="50"
                                r="40"
                                fill="transparent"
                                stroke={colors[index % colors.length]}
                                strokeWidth="12"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                transform={`rotate(${rotationOffset} 50 50)`}
                                className="transition-all duration-500 hover:stroke-[14px]"
                                style={{ transformOrigin: "50px 50px" }}
                              />
                            );
                          });
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-foreground">
                          {cargoStats.reduce((sum, item) => sum + item.value, 0)}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Kapal</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-2 w-full max-w-[200px]">
                      {(() => {
                        const colors = ["#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981", "#64748b"];
                        const totalVal = cargoStats.reduce((sum, item) => sum + item.value, 0);
                        return cargoStats.map((item, index) => (
                          <div key={item.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></span>
                              <span className="text-zinc-500 font-medium truncate max-w-[110px]">{item.name}</span>
                            </div>
                            <span className="font-bold text-foreground shrink-0">{item.value} ({Math.round((item.value / totalVal) * 100)}%)</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Chart 2: Bar Chart Perbandingan Bendera */}
              <div className="flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-6">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                  Perbandingan Bendera Kapal (Negara Asal)
                </h4>
                
                {flagStats.domestic === 0 && flagStats.foreign === 0 ? (
                  <div className="text-xs text-zinc-500 py-10 text-center">Tidak ada data bendera untuk ditampilkan</div>
                ) : (
                  <div className="flex flex-col items-stretch gap-4 py-2">
                    {/* Bar 1: Domestik */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                          🇮🇩 Domestik (Indonesia)
                        </span>
                        <span className="font-bold text-foreground">
                          {flagStats.domestic} Kapal ({flagStats.domestic + flagStats.foreign > 0 ? Math.round((flagStats.domestic / (flagStats.domestic + flagStats.foreign)) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-3.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-1000"
                          style={{ width: `${flagStats.domestic + flagStats.foreign > 0 ? (flagStats.domestic / (flagStats.domestic + flagStats.foreign)) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Bar 2: Asing */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                          🌐 Asing (Internasional)
                        </span>
                        <span className="font-bold text-foreground">
                          {flagStats.foreign} Kapal ({flagStats.domestic + flagStats.foreign > 0 ? Math.round((flagStats.foreign / (flagStats.domestic + flagStats.foreign)) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-3.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                          style={{ width: `${flagStats.domestic + flagStats.foreign > 0 ? (flagStats.foreign / (flagStats.domestic + flagStats.foreign)) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Kontrol Pencarian */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card backdrop-blur-md transition-colors duration-300 relative z-20">
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
