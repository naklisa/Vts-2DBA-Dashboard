"use client";

import React from "react";
import Link from "next/link";

interface Developer {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  github: string;
  linkedin: string;
  instagram: string;
}

const developers: Developer[] = [
  {
    id: 1,
    name: "Nahli Saud Ramdani",
    role: "Lead Fullstack Developer",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
    bio: "Fokus pada integrasi arsitektur data, state management, dan sinkronisasi real-time data kapal.",
    github: "https://github.com/naklisa",
    linkedin: "https://linkedin.com",
    instagram: "https://www.instagram.com/xnahl_sr/",
  },
  {
    id: 2,
    name: "Gian Ivander",
    role: "UI / UX Designer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    bio: "Merancang desain HUD premium, konsistensi warna gelap/terang, dan micro-interactions antarmuka.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
  },
  {
    id: 3,
    name: "Muhammad Dzaky",
    role: "Frontend Engineer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    bio: "Bertanggung jawab atas implementasi antarmuka responsif, filtering data, dan optimasi komponen UI.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
  },
  {
    id: 4,
    name: "Danar Prayogo",
    role: "DevOps & API Specialist",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
    bio: "Mengelola integrasi API Google Sheets, konfigurasi deployment, serta optimasi performa query.",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
  },
];

export default function DevelopersPage() {
  return (
    <div className="relative min-h-[75vh] flex flex-col justify-center py-8">

      {/* Header Halaman */}
      <div className="mb-12 text-center relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary shadow-sm hover:scale-105 transition-all duration-250 mb-6 group cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform duration-200"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Kembali ke Dashboard
        </Link>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black dark:text-white uppercase font-sans">
          TIM PENGEMBANG
        </h2>

        <p className="mt-4 max-w-3xl mx-auto text-base sm:text-lg text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed px-4">
          Dibuat dengan dedikasi tinggi oleh tim kuliah praktik teknik informatika ITERA 2026 untuk mendukung operasional Vessel Traffic Service (VTS) Panjang.
        </p>
      </div>

      {/* Grid Tim Pengembang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto w-full px-6 relative z-10">
        {developers.map((dev) => (
          <div key={dev.id} className="relative group w-full h-[470px]">

            {/* 1. Background Outline Layer (rotates left on hover) */}
            <div className="absolute inset-0 rounded-[32px] border-4 border-sky-400 bg-transparent transition-all duration-500 group-hover:rotate-[-2.5deg] group-hover:scale-[1.02] shadow-[0px_4px_30px_rgba(0,194,255,0.25)] dark:shadow-none" />

            {/* 2. Main Card Layer (slides, scales, rotates right on hover) */}
            <div className="relative w-full h-full rounded-[32px] border-4 border-sky-400 dark:border-zinc-800 bg-sky-500 dark:bg-zinc-950 transition-all duration-500 overflow-hidden cursor-pointer group-hover:rotate-[2.5deg] group-hover:-translate-y-2 z-10 shadow-[0px_4px_30px_rgba(0,194,255,0.3)] dark:shadow-none hover:shadow-[0px_10px_50px_rgba(0,194,255,0.55)]">

              {/* Coder Image Background (Visible by default) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dev.image}
                alt={dev.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Cyan overlay to tint the default photo background */}
              <div className="absolute inset-0 bg-sky-500/20 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0" />

              {/* Bottom text shading overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-0" />

              {/* Default State: Bottom-Left Name & Role */}
              <div className="absolute bottom-6 left-6 right-6 text-left transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4">
                <h3 className="text-xl font-extrabold text-white uppercase tracking-wide leading-tight drop-shadow-md">
                  {dev.name}
                </h3>
                <p className="text-xs font-bold text-sky-200 mt-1 uppercase tracking-widest leading-none drop-shadow-sm">
                  {dev.role}
                </p>
              </div>

              {/* Hover State: Solid cyan panel sliding up */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#00c2ff] to-[#0055aa] dark:from-zinc-900 dark:to-zinc-950 transition-all duration-500 transform translate-y-full group-hover:translate-y-0 flex flex-col items-center justify-center p-6 text-center text-white z-20">

                <div className="flex flex-col items-center justify-center gap-3">
                  {/* Developer Name */}
                  <h3 className="text-xl font-extrabold uppercase tracking-wide leading-tight text-white drop-shadow-md">
                    {dev.name}
                  </h3>

                  {/* Developer Role */}
                  <p className="text-xs font-bold text-white/90 uppercase tracking-widest leading-none drop-shadow-sm">
                    {dev.role}
                  </p>

                  {/* Developer Bio */}
                  <p className="text-xs text-white mt-4 leading-relaxed font-normal px-2">
                    {dev.bio}
                  </p>
                </div>

                {/* Social Links (Instagram, LinkedIn, GitHub in solid black icons) */}
                <div className="flex items-center gap-6 mt-8">
                  {/* Instagram */}
                  <a
                    href={dev.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-900 dark:text-white hover:scale-120 transition-transform duration-200 cursor-pointer"
                    title="Instagram"
                  >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                  {/* LinkedIn */}
                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-900 dark:text-white hover:scale-120 transition-transform duration-200 cursor-pointer"
                    title="LinkedIn"
                  >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                  {/* GitHub */}
                  <a
                    href={dev.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-900 dark:text-white hover:scale-120 transition-transform duration-200 cursor-pointer"
                    title="GitHub"
                  >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
