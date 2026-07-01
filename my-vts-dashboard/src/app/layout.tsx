import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Header from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VTS Panjang | 2DBA Ship Monitoring Dashboard",
  description: "Sistem Monitoring Kapal 2 Days Before Arrival (2DBA) terintegrasi dengan Google Sheets - VTS Panjang.",
  icons: {
    icon: "/Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-flicker inline script untuk inisialisasi tema instan */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('vts_theme') || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 font-sans">
        {/* Ambient Glow & Watermark Logo Effects (VTS HUD Aesthetic) */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[30%] -left-[10%] h-[70%] w-[50%] rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-[120px]"></div>
          <div className="absolute top-[30%] -right-[15%] h-[60%] w-[45%] rounded-full bg-teal-500/5 dark:bg-teal-500/10 blur-[100px]"></div>

          {/* Subtle Centered Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.04] transition-opacity duration-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.png" alt="Watermark VTS" className="w-[500px] h-[500px] max-w-[80vw] max-h-[80vh] object-contain select-none" />
          </div>
        </div>

        {/* Top Navbar */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 w-full max-w-[95%] xl:max-w-[98%] mx-auto px-6 py-8 transition-all duration-300">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-30 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-5 transition-colors duration-300">
          <div className="max-w-[1760px] mx-auto px-6 flex justify-center items-center">
            <div className="text-[11px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-center">
              <span>
                Created By <span className="text-cyan-600 dark:text-cyan-400 font-bold tracking-wider"></span> <Link href="/developers" className="inline-block bg-gradient-to-r from-cyan-500 to-teal-500 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent hover:from-blue-500 hover:to-cyan-400 dark:hover:from-blue-400 dark:hover:to-cyan-300 font-extrabold font-mono transition-all duration-300 hover:scale-[1.04] active:scale-95 cursor-pointer drop-shadow-[0_0_12px_rgba(6,182,212,0.25)]">KELOMPOK KULIAH PRAKTIK TEKNIK INFORMATIKA ITERA 2026</Link>
              </span>
            </div>
          </div>
        </footer>


      </body>
    </html>
  );
}
