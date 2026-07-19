# VTS 2DBA Ship Monitoring Dashboard 🚢

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black?style=flat-poly&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/Library-React%2019-blue?style=flat-poly&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20v4.0-38bdf8?style=flat-poly&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-poly)](#)

Aplikasi Dashboard Pemantauan Kapal **Vessel Traffic Service (VTS) Panjang** berbasis web yang modern, interaktif, dan responsif. Aplikasi ini dirancang khusus untuk mengintegrasikan data log kedatangan kapal 2DBA secara real-time dari Google Spreadsheet, serta mendukung pelacakan status kedatangan kapal (*arrived*) secara mandiri menggunakan basis data lokal persisten.

---

## 🗺️ Arsitektur Sistem & Aliran Data

Aplikasi ini menggunakan arsitektur hibrida yang memadukan cloud spreadsheets sebagai pengelola data input dengan server Next.js lokal untuk penanganan logika status kedatangan (*override state*) dan penyajian antarmuka pengguna (UI/UX).

```mermaid
graph TD
    subgraph Google Workspace (Cloud)
        A[Google Spreadsheet] -->|Sumber Data Log| B(Google Apps Script Web App GET API)
    end
    subgraph Server Next.js (Local/Host)
        C[Next.js Client-Side fetcher.ts] -->|HTTP Request| B
        D[Next.js API Route: /api/arrived] -->|Read/Write JSON| E[Local DB: arrived-ships.json]
    end
    subgraph Browser Pengguna (Client)
        F[Dashboard Page] -->|Render & Auto-Sync| C
        F -->|POST Update Status| D
        F -->|Preferences| G[Local Storage]
        F -->|Audio Engine| H[Web Audio API Sonar Ping]
    end
    
    style A fill:#4CAF50,stroke:#388E3C,color:#fff
    style B fill:#FF9800,stroke:#F57C00,color:#fff
    style E fill:#9C27B0,stroke:#7B1FA2,color:#fff
    style H fill:#00BCD4,stroke:#0097A7,color:#fff
```

---

## 🚀 Fitur Utama

### 1. Integrasi Google Sheets Real-time
Sinkronisasi data log pergerakan kapal langsung dari Google Sheets via API Google Apps Script (GAS) dengan penanganan optimasi performa agar query berjalan sangat cepat dan efisien.

### 2. Auto-Sync dengan Indikator Countdown
Sistem melakukan sinkronisasi ulang secara berkala di latar belakang untuk mendapatkan pembaruan log kapal terbaru. Dilengkapi dengan indikator visual berbentuk pill status yang interaktif, timer countdown, serta tombol sinkronisasi manual.

### 3. Audio Sonar Ping (MIL-SPEC HUD)
Menghadirkan nuansa ruang kendali VTS (Vessel Traffic Service) militer dengan efek suara "sonar ping" kapal selam saat melakukan sinkronisasi data. Efek suara ini **dibangkitkan langsung lewat kode program** menggunakan *Web Audio API* (tanpa menggunakan file aset audio eksternal `.mp3` atau `.wav`), sehingga hemat bandwidth dan instan.

### 4. Sistem Status Kedatangan (Arrived Status) & Override
Memungkinkan operator VTS untuk menandai apakah suatu kapal sudah bersandar/tiba di pelabuhan.
* **Legenda Warna Baris**:
  * <span style="color:#27C840">■</span> **Hijau**: Kapal telah tiba atau selesai proses sandar.
  * <span style="color:#FFCC00">■</span> **Kuning**: Kapal H-1 dari Estimasi Waktu Kedatangan (ETA).
  * <span style="color:#71717a">■</span> **Abu-abu**: Kapal dengan ETA normal (H-2 atau lebih).
* **Simpan Status Persisten**: Log checklist kapal disimpan secara aman di backend server lokal dalam format file JSON.

### 5. Control Panel Preferensi HUD
Panel pengaturan HUD bergaya futuristik yang disimpan secara permanen di browser pengguna (`localStorage`), mencakup:
* Pengaturan kecepatan gulir teks otomatis (*Auto-scroll Speed*).
* Sakelar aktif/nonaktif suara Sonar Ping (*Mute/Unmute*).
* Pengaturan durasi interval sinkronisasi data otomatis (`10 detik`, `30 detik`, `60 detik`).

### 6. Filter Pencarian & Tanggal Log
Kemudahan dalam menyaring ratusan baris data kapal berdasarkan nama kapal, Call Sign, jenis kargo, atau memfilter data berdasarkan tanggal log secara spesifik dengan antarmuka kalender yang bersih.

---

## 💻 Tech Stack yang Digunakan

* **Core Framework**: [Next.js 15 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
* **CSS & Styling**: [Tailwind CSS v4.0](https://tailwindcss.com/) dengan variabel warna HSL kustom dan efek Glassmorphism.
* **Icons**: [Lucide React](https://lucide.dev/)
* **Local Database**: File JSON (`data/arrived-ships.json`) dibaca dan ditulis melalui filesystem API Node.js secara asinkron.
* **Audio Engine**: Web Audio API (AudioContext, OscillatorNode, GainNode).

---

## 📁 Struktur Folder Proyek

```text
Vts-2DBA-Dashboard/
├── google-apps-script/
│   └── Code.gs                  # Kode script untuk di-deploy di Google Apps Script (GAS)
└── my-vts-dashboard/
    ├── data/
    │   └── arrived-ships.json   # Database lokal penyimpan status checklist kapal arrived
    ├── public/
    │   ├── Logo.png             # Logo VTS Panjang (Watermark & Navbar)
    │   └── gian_ivander.png     # Foto profil pengembang Gian Ivander
    ├── src/
    │   ├── app/
    │   │   ├── api/arrived/     # Endpoint REST API Next.js (GET & POST) untuk arrived status
    │   │   │   └── route.ts
    │   │   ├── arrived/         # Halaman visual khusus daftar Kapal Tiba
    │   │   │   └── page.tsx
    │   │   ├── developers/      # Halaman profil tim pengembang & kontributor
    │   │   │   └── page.tsx
    │   │   ├── globals.css      # Styling global, scrollbar, HUD, dan token Tailwind CSS 4
    │   │   ├── layout.tsx       # Root layout dashboard & global footer
    │   │   └── page.tsx         # Halaman utama monitoring dashboard
    │   ├── components/          # Komponen UI modular & reusable
    │   │   ├── confirmation-modal.tsx  # Modal warning perubahan status kapal
    │   │   ├── data-table.tsx          # Tabel utama data kapal (sticky columns, auto-scroll)
    │   │   ├── date-filter.tsx         # Dropdown filter tanggal log kapal
    │   │   ├── search-bar.tsx          # Input pencarian nama kapal / Call Sign
    │   │   ├── settings-panel.tsx      # Panel kontrol preferensi HUD (sound, scroll, sync)
    │   │   ├── system-status.tsx       # Indikator status sync & countdown timer
    │   │   ├── theme-toggle.tsx        # Tombol switch Light Mode / Dark Mode
    │   │   └── vts-stats.tsx           # Panel metrik ringkasan statistik kapal
    │   └── lib/                 # Utilitas helper dan service layer
    │       ├── date-utils.ts    # Perhitungan waktu, format tanggal, & status keterlambatan
    │       └── fetcher.ts       # Integrasi fetch data log kapal dari API GAS
    ├── .env.example             # Contoh konfigurasi environment variable
    └── package.json             # Dependensi dan script build proyek
```

---

## 🛠️ Panduan Instalasi & Menjalankan Aplikasi

### Langkah 1: Deploy Google Apps Script (Sumber Data)
1. Buka file Google Spreadsheet tempat Anda mencatat log kapal 2DBA.
2. Pada menu atas, klik **Ekstensi** > **Apps Script**.
3. Hapus kode bawaan di editor, lalu salin seluruh isi file [Code.gs](file:///d:/VTS/Vts-2DBA-Dashboard/google-apps-script/Code.gs) ke editor Apps Script tersebut.
4. Sesuaikan nama sheet pada baris ke-5 jika berbeda (bawaan: `"01-30 JUNI 2026"`).
5. Klik **Terapkan (Deploy)** > **Penerapan Baru (New Deployment)**.
6. Konfigurasikan jenis penerapan sebagai **Aplikasi Web (Web App)**:
   * **Jalankan sebagai (Execute as)**: `Diri Anda sendiri (email-pemilik@gmail.com)`
   * **Siapa yang memiliki akses (Who has access)**: **`Siapa saja (Anyone)`** *(Sangat penting agar API bisa diakses secara publik oleh server Next.js)*
7. Klik **Terapkan**, lalu salin **URL Aplikasi Web** yang diberikan (URL berakhiran `/exec`).

### Langkah 2: Setup Project Next.js
1. Buka terminal atau Command Prompt, lalu masuk ke direktori proyek Next.js:
   ```bash
   cd my-vts-dashboard
   ```
2. Salin file template `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   # Atau pada Windows Command Prompt:
   # copy .env.example .env
   ```
3. Buka file `.env` yang baru dibuat, lalu masukkan URL Google Apps Script Web App yang Anda salin tadi pada variable `NEXT_PUBLIC_API_URL`:
   ```env
   NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/AKfycbxxx.../exec
   ```
4. Install semua dependensi proyek menggunakan npm:
   ```bash
   npm install
   ```

### Langkah 3: Menjalankan Aplikasi

#### Mode Pengembangan (Development)
Untuk menjalankan server lokal dalam mode development dengan fitur Hot Reloading:
```bash
npm run dev
```
Buka browser Anda dan akses **[http://localhost:3000](http://localhost:3000)**.

#### Mode Produksi (Production Build)
Untuk membangun dan menjalankan aplikasi dalam mode produksi agar berjalan dengan performa maksimal dan optimal:
```bash
# Build dan compile project
npm run build

# Jalankan server production
npm run start
```

---

## 🔌 Dokumentasi REST API Lokal (`/api/arrived`)

Server Next.js menyediakan endpoint API internal untuk membaca dan memodifikasi status kedatangan kapal.

### 1. Dapatkan Daftar Status Kapal Tiba
* **Endpoint**: `/api/arrived`
* **Method**: `GET`
* **Response (Success - 200 OK)**:
  ```json
  {
    "arrived": ["SHIP_ID_1", "SHIP_ID_2"],
    "uncheckedOverrides": ["SHIP_ID_3"]
  }
  ```

### 2. Perbarui Status Kedatangan Kapal
* **Endpoint**: `/api/arrived`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "shipId": "SHIP_ID_1",
    "isArrived": true,
    "overrideUnchecked": false
  }
  ```
* **Response (Success - 200 OK)**:
  ```json
  {
    "success": true,
    "arrived": ["SHIP_ID_1", "SHIP_ID_2"],
    "uncheckedOverrides": ["SHIP_ID_3"]
  }
  ```

---

## 📝 Catatan Teknis & Optimasi UI/UX

* **Sintesis Audio Real-time**: Audio sonar ping dibuat menggunakan node generator oscillator bawaan peramban Web Audio API:
  ```typescript
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, audioCtx.currentTime); // Frekuensi awal
  osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 1.2); // Pitch-drop khas sonar
  ```
  Hal ini menghemat bandwidth karena tidak memerlukan pemuatan aset audio eksternal dan bebas hambatan latency.
* **DX & Error Handling**: fetcher API secara otomatis menangkap error 403 atau kegagalan jaringan dan mengubahnya menjadi pesan string sebelum ditulis ke log console untuk mencegah *development error screen* Next.js menutupi layar pengerjaan lokal (DX improvement).
* **Z-Index Layering**: Komponen navbar `<Header />` diatur menggunakan `z-50` guna memastikan baris tabel berkategori `sticky` tidak pernah menumpuk atau terlihat di atas area navbar saat digulir.

---

## 👥 Tim Pengembang & Kontributor

Dibuat dengan dedikasi tinggi oleh **KELOMPOK KP TEKNIK INFORMATIKA ITERA 2026** untuk mendukung efektivitas pemantauan operasional lalu lintas kapal pada **Vessel Traffic Service (VTS) Panjang**:

* **Nahli Saud Ramdani** - *Lead Fullstack Developer* 💻
  * Integrasi arsitektur data, state management, dan sinkronisasi real-time data kapal.
* **Gian Ivander** - *UI / UX Designer* 🎨
  * Perancangan desain HUD premium, konsistensi warna gelap/terang, dan micro-interactions antarmuka.

---
*KELOMPOK KP TEKNIK INFORMATIKA ITERA 2026*
