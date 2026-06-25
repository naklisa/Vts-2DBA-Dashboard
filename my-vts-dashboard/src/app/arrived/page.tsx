"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getShipData, ShipData } from "@/lib/fetcher";
import { isETAPassed } from "@/lib/date-utils";
import SearchBar from "@/components/search-bar";
import DataTable from "@/components/data-table";
import ConfirmationModal from "@/components/confirmation-modal";

export default function ArrivedPage() {
  const [data, setData] = useState<ShipData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [checkedShips, setCheckedShips] = useState<Set<string>>(new Set());
  const [uncheckedOverrides, setUncheckedOverrides] = useState<Set<string>>(new Set());

  // State untuk modal konfirmasi
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedShipKey, setSelectedShipKey] = useState<string>("");
  const [selectedShipName, setSelectedShipName] = useState<string>("");
  const [selectedShipAction, setSelectedShipAction] = useState<string>("");
  const [syncInterval, setSyncInterval] = useState<number>(10);

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

  // Load preferensi sync & initial fetches
  useEffect(() => {
    const storedSync = localStorage.getItem("vts_sync_interval");
    if (storedSync) {
      const parsedInterval = parseInt(storedSync, 10);
      setSyncInterval(parsedInterval);
      setCountdown(parsedInterval);
    }
    fetchArrivedStatus();
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

  // Auto-sync data secara berkala setiap N detik dengan hitung mundur
  useEffect(() => {
    if (syncInterval === 0) {
      // Manual sync mode: countdown dihentikan
      return;
    }

    setCountdown(syncInterval);

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



  const arrivedShips = useMemo(() => {
    return data.filter(ship => {
      const shipKey = `${ship.Tanggal_Log}-${ship["NAME_OF_SHIP/_CALL_SIGN"]}`;
      const isChecked = checkedShips.has(shipKey);
      const isPassed = isETAPassed(ship["ETA_/_ETD_(LT)"]);
      const isOverriddenUnchecked = uncheckedOverrides.has(shipKey);
      return isChecked || (isPassed && !isOverriddenUnchecked);
    });
  }, [data, checkedShips, uncheckedOverrides]);

  // Saring berdasarkan input pencarian
  const filteredArrivedShips = useMemo(() => {
    return arrivedShips.filter(ship => {
      const shipName = (ship["NAME_OF_SHIP/_CALL_SIGN"] || "").toLowerCase();
      return shipName.includes(searchQuery.toLowerCase());
    });
  }, [arrivedShips, searchQuery]);

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
        uncheckedOverrides={uncheckedOverrides}
        onToggleCheck={handleToggleCheckClick}
        scrollSpeed="off"
      />

      {/* Modal Konfirmasi */}
      <ConfirmationModal
        isOpen={modalOpen}
        shipName={selectedShipName}
        isChecking={selectedShipAction === "check" || selectedShipAction === "reset_override"}
        onConfirm={handleConfirmToggle}
        onCancel={() => setModalOpen(false)}
      />

    </div>
  );
}
