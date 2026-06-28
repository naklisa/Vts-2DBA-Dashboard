# VTS 2DBA Dashboard 🚢

Aplikasi Dashboard Pemantauan Kapal (Vessel Traffic Service - VTS) berbasis web yang modern dan responsif. Aplikasi ini mengintegrasikan data dari Google Spreadsheet secara real-time via Google Apps Script (GAS), serta menyediakan fitur pelacakan kedatangan kapal secara mandiri dengan basis data lokal.

---

## 🚀 Fitur Utama

- **Integrasi Google Sheets Real-time**: Sinkronisasi data log kapal langsung dari Google Sheets via API Google Apps Script.
- **Auto-Sync & Manual Sync**: Server secara otomatis melakukan pembaruan berkala dengan countdown indikator visual, serta opsi sinkronisasi manual.
- **Sonar Sound Effect (MIL-SPEC HUD)**: Efek suara "sonar ping" kapal selam saat melakukan sinkronisasi data (menggunakan Web Audio API, tanpa file aset audio eksternal).
- **Sistem Status Kedatangan (Arrived Status)**: 
  - Melacak kapal yang sudah tiba (arrived) atau belum sandar.
  - Penanganan khusus (override) untuk kapal yang telah melewati Estimasi Waktu Kedatangan (ETA) namun belum tiba.
  - Menggunakan API endpoint lokal (`/api/arrived`) yang menyimpan data dalam format JSON (`data/arrived-ships.json`).
- **HUD Settings Control**: Panel pengaturan untuk menyesuaikan:
  - Kecepatan gulir teks (Scroll Speed).
  - Status audio Sonar Ping (aktif/nonaktif).
  - Interval waktu sinkronisasi otomatis.
  - Menyimpan semua preferensi pengguna secara lokal (`localStorage`).
- **Analitik Visual**: Panel statistik ringkas untuk memantau total kapal terdaftar, kapal yang sudah tiba, kapal dalam perjalanan (ETA belum terlewati), dan kapal yang mengalami keterlambatan/delay (ETA terlewati tapi belum tiba).
- **Pencarian & Filter Tanggal**: Kemudahan memfilter daftar kapal berdasarkan kata kunci (nama kapal, call sign, cargo) dan tanggal log terkait.

---

## 📁 Struktur Folder Proyek

```text
Vts-2DBA-Dashboard/
├── google-apps-script/
│   └── Code.gs                  # Kode script untuk di-deploy di Google Apps Script (GAS)
└── my-vts-dashboard/
    ├── src/
    │   ├── app/
    │   │   ├── api/arrived/     # Endpoint backend API untuk menyimpan status tiba/delay
    │   │   │   └── route.ts
    │   │   ├── arrived/         # Halaman khusus daftar kapal tiba
    │   │   ├── developers/      # Halaman profil pengembang / kontributor
    │   │   ├── globals.css      # Styling global dan token Tailwind CSS 4
    │   │   ├── layout.tsx       # Root layout dashboard
    │   │   └── page.tsx         # Dashboard utama (logika utama, sinkronisasi, HUD)
    │   ├── components/          # Komponen UI modular
    │   │   ├── confirmation-modal.tsx
    │   │   ├── data-table.tsx
    │   │   ├── date-filter.tsx
    │   │   ├── search-bar.tsx
    │   │   ├── settings-panel.tsx
    │   │   ├── system-status.tsx
    │   │   ├── theme-toggle.tsx
    │   │   └── vts-stats.tsx
    │   └── lib/                 # Utilitas helper
    │       ├── date-utils.ts    # Formatting & validasi tanggal/waktu ETA/ETD
    │       └── fetcher.ts       # Service fetcher data kapal dari API GAS
    ├── .env.example             # Contoh konfigurasi environment variable
    └── package.json             # Konfigurasi dependensi project (Next.js, React 19, Tailwind 4)
```

---

## 🛠️ Langkah-Langkah Instalasi & Menjalankan Aplikasi

### 1. Setup Google Apps Script (Sumber Data)
1. Buka Google Spreadsheet tempat Anda mencatat log kapal 2DBA.
2. Klik **Ekstensi** > **Apps Script**.
3. Hapus kode bawaan, lalu salin seluruh isi file [Code.gs](file:///d:/VTS/Vts-2DBA-Dashboard/google-apps-script/Code.gs) ke editor Apps Script.
4. Sesuaikan nama sheet pada baris ke-5 jika berbeda (bawaan: `"01-30 JUNI 2026"`).
5. Klik **Terapkan (Deploy)** > **Penerapan Baru (New Deployment)**.
6. Pilih jenis penerapan **Aplikasi Web (Web App)**:
   - *Jalankan sebagai*: Diri Anda sendiri.
   - *Siapa yang memiliki akses*: Siapa saja (Anyone).
7. Klik **Terapkan**, lalu salin **URL Aplikasi Web** yang diberikan (URL ini akan berakhiran `/exec`).

### 2. Setup Project Next.js
1. Masuk ke terminal dan arahkan ke direktori project:
   ```bash
   cd my-vts-dashboard
   ```
2. Buat file `.env.local` dengan menduplikat dari `.env.example`:
   ```bash
   cp .env.example .env.local
   # Jika menggunakan Windows PowerShell:
   # copy .env.example .env.local
   ```
3. Buka `.env.local` dan masukkan URL Google Apps Script Web App yang Anda dapatkan tadi pada variable `NEXT_PUBLIC_API_URL`:
   ```env
   NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/AKfycbxxx.../exec
   ```
4. Install seluruh package/dependency:
   ```bash
   npm install
   ```
5. Jalankan server lokal untuk mode pengembangan (development):
   ```bash
   npm run dev
   ```
6. Buka browser kesayangan Anda dan akses [http://localhost:3000](http://localhost:3000).

---

## 🏗️ Production Build

Untuk mem-build aplikasi ke mode production agar berjalan lebih optimal dan cepat:

```bash
# Build project
npm run build

# Jalankan hasil build
npm run start
```

---

## 📝 Catatan Teknis
- **Web Audio API**: Efek suara sonar dibangkitkan langsung lewat kode program di klien menggunakan Oscillator node bertipe *sine wave* yang mengalami penurunan frekuensi eksponensial untuk meniru suara sonar kapal selam asli.
- **Penyimpanan Lokal**:
  - Konfigurasi HUD (Sonar Active, Scroll Speed, Sync Interval) disimpan di `localStorage` pada browser pengguna.
  - Data status kedatangan kapal (checklist arrived) disimpan secara persisten di sisi server pada path `./my-vts-dashboard/data/arrived-ships.json`.
