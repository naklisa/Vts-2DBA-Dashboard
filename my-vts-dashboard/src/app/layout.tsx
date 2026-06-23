import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ThemeToggle from "@/components/theme-toggle";

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
              })()
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 font-sans">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-300">
          <div className="flex h-16 items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-6">
              {/* Logo VTS */}
              <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                {/* Radar Icon */}
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                  </span>
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
              <span className="inline-flex items-center rounded-full bg-cyan-950/80 px-3 py-1 text-xs font-semibold text-cyan-400 border border-cyan-800/40">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                System Live
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-background/30 py-6 text-center text-xs text-zinc-500 transition-colors duration-300">
          <p>© {new Date().getFullYear()} VTS Panjang. All rights reserved.</p>
        </footer>

        {/* Floating Theme Toggle (Bottom Right) */}
        <ThemeToggle />
      </body>
    </html>
  );
}
