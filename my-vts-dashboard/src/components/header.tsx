"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DigitalClock from "@/components/digital-clock";

export default function Header() {
  const pathname = usePathname();

  const isDashboardActive = pathname === "/";
  const isArrivedActive = pathname === "/arrived";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors duration-300 py-4 px-6 md:px-12 xl:px-20 shadow-sm">
      <div className="max-w-[1760px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left Section: Logo & Titles */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="Logo VTS" className="h-14 w-14 object-contain" />
            </div>
            <div className="flex flex-col justify-start">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-black dark:text-white font-sans leading-tight">
                VTS PANJANG
              </h1>
              <p className="text-sm md:text-base font-semibold text-zinc-555 dark:text-zinc-400 font-sans tracking-wide">
                Manajemen Kedatangan Kapal
              </p>
            </div>
          </Link>
        </div>

        {/* Right Section: Navigation & Clock Widget */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 xl:gap-16">
          
          {/* Navigation Menu Tabs */}
          <nav className="flex items-center gap-8 md:gap-12">
            <Link
              href="/"
              className={`pb-1 text-lg font-bold font-sans tracking-wide transition-all ${
                isDashboardActive
                  ? "text-primary border-b-2 border-primary font-extrabold"
                  : "text-black dark:text-zinc-400 hover:text-primary border-b-2 border-transparent"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/arrived"
              className={`pb-1 text-lg font-bold font-sans tracking-wide transition-all ${
                isArrivedActive
                  ? "text-primary border-b-2 border-primary font-extrabold"
                  : "text-black dark:text-zinc-400 hover:text-primary border-b-2 border-transparent"
              }`}
            >
              Arrival Status
            </Link>
          </nav>

          {/* Digital Clock Wrapper */}
          <div className="flex items-center gap-4">
            <DigitalClock />
          </div>
        </div>

      </div>
    </header>
  );
}
