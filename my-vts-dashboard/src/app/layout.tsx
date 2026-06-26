import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ThemeToggle from "@/components/theme-toggle";
import SystemStatus from "@/components/system-status";

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
            <img src="/Logo.png" alt="Watermark VTS" className="w-[500px] h-[500px] max-w-[80vw] max-h-[80vh] object-contain select-none" />
          </div>
        </div>

        {/* Top Navbar */}
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300">
          <div className="flex h-16 items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-6">
              {/* Logo VTS */}
              <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                {/* Logo Image */}
                <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800">
                  <img src="/Logo.png" alt="Logo VTS" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-wider text-foreground">VTS PANJANG</h1>
                  <p className="text-[10px] font-medium text-cyan-550 tracking-widest uppercase">Pelaporan Terintegrasi</p>
                </div>
              </Link>

              {/* Navigation Menu Tabs */}
              <nav className="flex items-center gap-4 ml-6 border-l border-border pl-6 h-8">
                <Link
                  href="/"
                  className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/arrived"
                  className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-foreground transition-colors"
                >
                  Kapal Tiba
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <SystemStatus />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-[95%] xl:max-w-[98%] mx-auto px-6 py-8 transition-all duration-300">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background/30 py-6 transition-colors duration-300">
          <div className="max-w-[95%] xl:max-w-[98%] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>
                Created By <span className="text-cyan-600 dark:text-cyan-400 font-bold tracking-wider">VTS PANJANG</span> X <span className="text-foreground font-bold font-mono">KP IF ITERA 2026</span>
              </span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 font-bold font-mono">
              Vessel Traffic Service Command Center
            </div>
          </div>
        </footer>

        {/* Floating Theme Toggle (Bottom Right) */}
        <ThemeToggle />
      </body>
    </html>
  );
}
