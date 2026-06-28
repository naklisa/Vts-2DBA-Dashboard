"use client";

import React from "react";
import Link from "next/link";

interface Developer {
  id: number;
  name: string;
  role: string;
  initials: string;
  gradient: string;
  bio: string;
  github: string;
  linkedin: string;
}

const developers: Developer[] = [
  {
    id: 1,
    name: "Nahli Saud Ramdani",
    role: "Lead Fullstack Developer",
    initials: "NSR",
    gradient: "from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500",
    bio: "Fokus pada integrasi arsitektur data, state management, dan sinkronisasi real-time data kapal.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: 2,
    name: "Gian Ivander",
    role: "UI/UX Designer",
    initials: "GI",
    gradient: "from-purple-550 to-pink-600 dark:from-purple-400 dark:to-pink-500",
    bio: "Merancang desain HUD premium, konsistensi warna gelap/terang, dan micro-interactions antarmuka.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: 3,
    name: "Muhammad Dzaky",
    role: "Frontend Engineer",
    initials: "MD",
    gradient: "from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500",
    bio: "Bertanggung jawab atas implementasi antarmuka responsif, filtering data, dan optimasi komponen UI.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
  {
    id: 4,
    name: "Danar Prayogo",
    role: "DevOps & API Specialist",
    initials: "DP",
    gradient: "from-amber-550 to-orange-600 dark:from-amber-400 dark:to-orange-500",
    bio: "Mengelola integrasi API Google Sheets, konfigurasi deployment, serta optimasi performa query.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
  },
];

export default function DevelopersPage() {
  return (
    <div className="relative min-h-[70vh] flex flex-col justify-center py-6">
      {/* Header Halaman */}
      <div className="mb-10 text-center relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-border text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-all duration-200 mb-6 group cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform duration-200"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali ke Dashboard
        </Link>

        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl uppercase font-mono">
          Tim Pengembang <span className="text-cyan-600 dark:text-cyan-400">Dev Team</span>
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-sm text-zinc-550 dark:text-zinc-400 font-medium">
          Dibuat dengan dedikasi tinggi oleh tim magang Informatika ITERA 2026 untuk mendukung operasional Vessel Traffic Service (VTS) Panjang.
        </p>
      </div>

      {/* Grid Tim Pengembang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto w-full px-2 relative z-10">
        {developers.map((dev) => (
          <div
            key={dev.id}
            className="group relative flex flex-col items-center p-6 rounded-2xl bg-card border border-border/80 dark:bg-zinc-950/40 backdrop-blur-md shadow-lg transition-all duration-500 ease-out hover:scale-[1.04] hover:-translate-y-2 hover:border-cyan-500/60 dark:hover:border-cyan-500/40 hover:shadow-[0_15px_30px_rgba(6,182,212,0.12)]"
          >
            {/* Ambient Card Background Glow on Hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 dark:group-hover:from-cyan-400/5 group-hover:to-transparent transition-all duration-500 -z-10" />

            {/* Container Avatar dengan Efek Hover Zoom */}
            <div className="relative mb-6">
              {/* Ring Glowing Border */}
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 opacity-60 blur-xs group-hover:opacity-100 group-hover:blur-sm transition duration-500" />
              
              {/* Avatar Utama */}
              <div className={`relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${dev.gradient} text-white font-mono text-3xl font-bold tracking-wider shadow-inner select-none overflow-hidden transform group-hover:scale-105 transition-transform duration-500`}>
                {dev.initials}
                {/* Tech Pattern overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-40" />
              </div>
            </div>

            {/* Nama & Role */}
            <h3 className="text-lg font-bold text-foreground tracking-tight transition-colors duration-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 text-center">
              {dev.name}
            </h3>
            <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase mt-1 mb-4 text-center">
              {dev.role}
            </p>

            {/* Bio Deskripsi */}
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium text-center line-clamp-3 mb-6 flex-grow leading-relaxed">
              {dev.bio}
            </p>

            {/* Tombol Tautan Sosial Media */}
            <div className="flex items-center gap-3 w-full border-t border-border/60 pt-4 mt-auto">
              {/* GitHub Button */}
              <a
                href={dev.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-foreground border border-border/80 transition-all duration-300 group/btn cursor-pointer"
              >
                <svg
                  className="w-4 h-4 text-zinc-500 group-hover/btn:text-foreground transition-colors duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>GitHub</span>
              </a>

              {/* LinkedIn Button */}
              <a
                href={dev.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 border border-border/80 transition-all duration-300 group/btn cursor-pointer"
              >
                <svg
                  className="w-4 h-4 text-zinc-500 group-hover/btn:text-cyan-500 dark:group-hover/btn:text-cyan-400 transition-colors duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
