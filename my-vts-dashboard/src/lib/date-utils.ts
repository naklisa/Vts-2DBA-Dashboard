// Fungsi utilitas untuk parsing string tanggal log "DD/BULAN/YYYY" menjadi objek Date
export const parseDateString = (dateStr: string): Date => {
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

// Mengonversi berbagai format ETA (seperti "06/06/2026/07.00LT", "13-06-2026 07:00:00", "20062026", "1600 LT / 21 JUNE 2026", atau ISO) ke objek Date
export const parseETA = (etaStr: string): Date | null => {
  if (!etaStr) return null;
  
  // 1. Cek jika format ISO UTC
  if (etaStr.includes("T") && etaStr.includes("Z")) {
    const d = new Date(etaStr);
    if (!isNaN(d.getTime())) return d;
  }

  // Bersihkan teks: hapus "(LT)" atau "LT" secara global (termasuk yang di tengah string), trim whitespace
  const cleanStr = etaStr.replace(/(LT|\(LT\))/gi, "").trim();

  let day = 1;
  let month = 0; // 0-indexed (Januari = 0)
  let year = new Date().getFullYear();
  let hours = 0;
  let minutes = 0;
  let matched = false;

  const monthMap: Record<string, number> = {
    JANUARI: 0, JAN: 0, JANUARY: 0,
    FEBRUARI: 1, PEBRUARI: 1, FEB: 1, FEBRUARY: 1,
    MARET: 2, MAR: 2, MARCH: 2,
    APRIL: 3, APR: 3,
    MEI: 4, MAY: 4,
    JUNI: 5, JUN: 5, JUNE: 5,
    JULI: 6, JUL: 6, JULY: 6,
    AGUSTUS: 7, AGS: 7, AGU: 7, AUGUST: 7,
    SEPTEMBER: 8, SEP: 8,
    OKTOBER: 9, OKT: 9, OCTOBER: 9,
    NOVEMBER: 10, NOPEMBER: 10, NOV: 10,
    DESEMBER: 11, DES: 11, DECEMBER: 11
  };

  // Pola 1: DD/MM/YYYY atau DD-MM-YYYY (Contoh: "13-06-2026 07:00:00" atau "06/06/2026/07.00")
  const patternDashesOrSlashes = /^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})(.*)$/;
  const match1 = cleanStr.match(patternDashesOrSlashes);

  if (match1) {
    day = parseInt(match1[1], 10);
    month = parseInt(match1[2], 10) - 1;
    year = parseInt(match1[3], 10);
    const timePart = match1[4].trim();
    
    // Cari bagian waktu (jam:menit:detik atau jam.menit)
    const timeMatch = timePart.match(/(\d{1,2})[.:](\d{2})(?:[.:](\d{2}))?/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
    }
    matched = true;
  }

  // Pola 2: DDMMYYYY (Contoh: "20062026" atau "21062026/07.00")
  if (!matched) {
    const patternDigitsOnly = /^(\d{2})(\d{2})(\d{4})(.*)$/;
    const match2 = cleanStr.match(patternDigitsOnly);
    if (match2) {
      day = parseInt(match2[1], 10);
      month = parseInt(match2[2], 10) - 1;
      year = parseInt(match2[3], 10);
      const timePart = match2[4].trim();
      
      const timeMatch = timePart.match(/(\d{1,2})[.:](\d{2})/);
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
      }
      matched = true;
    }
  }

  // Pola 3: HHMM / DD MONTHNAME YYYY (Contoh: "1600 / 21 JUNE 2026" setelah LT dibersihkan)
  if (!matched) {
    const patternTimeFirst = /^(\d{2})[.:]?(\d{2})\s*\/\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i;
    const match3 = cleanStr.match(patternTimeFirst);
    if (match3) {
      hours = parseInt(match3[1], 10);
      minutes = parseInt(match3[2], 10);
      day = parseInt(match3[3], 10);
      const mName = match3[4].toUpperCase();
      month = monthMap[mName] !== undefined ? monthMap[mName] : 0;
      year = parseInt(match3[5], 10);
      matched = true;
    }
  }

  // Pola 4: DD MONTHNAME YYYY (Contoh: "21 JUNE 2026" atau "21 JUNI 2026")
  if (!matched) {
    const patternDateWordOnly = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i;
    const match4 = cleanStr.match(patternDateWordOnly);
    if (match4) {
      day = parseInt(match4[1], 10);
      const mName = match4[2].toUpperCase();
      month = monthMap[mName] !== undefined ? monthMap[mName] : 0;
      year = parseInt(match4[3], 10);
      matched = true;
    }
  }

  if (!matched) {
    return null;
  }

  const dateObj = new Date(year, month, day, hours, minutes);
  return isNaN(dateObj.getTime()) ? null : dateObj;
};

// Deteksi apakah ETA sudah lewat atau hari ini (realtime)
export const isETAPassed = (etaStr: string): boolean => {
  const etaDate = parseETA(etaStr);
  if (!etaDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Bandingkan berdasarkan tanggal saja (abaikan jam)
  const etaCompare = new Date(etaDate.getFullYear(), etaDate.getMonth(), etaDate.getDate());
  return etaCompare.getTime() <= today.getTime();
};

// Deteksi apakah ETA berselisih persis H-1 dari hari ini (realtime)
export const isETA_H1 = (etaStr: string): boolean => {
  const etaDate = parseETA(etaStr);
  if (!etaDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const etaCompare = new Date(etaDate.getFullYear(), etaDate.getMonth(), etaDate.getDate());
  const diffTime = etaCompare.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};
