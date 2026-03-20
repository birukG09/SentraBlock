import { Link, useLocation } from "wouter";
import { History, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import blockchainLogo from "@assets/blockchain_(1)_1774046195357.png";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-foreground flex flex-col relative overflow-hidden">
      {/* Subtle radial gradient glow from center top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#00C1B3] opacity-[0.03] rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Navbar */}
      <header className="relative z-10 bg-[#0A0A0A] border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-9 h-9 rounded-lg overflow-hidden"
              >
                <img src={blockchainLogo} alt="SentraBlock" className="w-full h-full object-contain" />
              </motion.div>
              <span className="font-bold text-xl tracking-tight text-white">
                Sentra<span className="text-[#00C1B3]">Block</span>
              </span>
            </Link>

            <nav className="flex items-center space-x-6">
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors relative pb-1",
                  location === "/"
                    ? "text-white"
                    : "text-[#706F78] hover:text-white"
                )}
              >
                <Activity className="w-4 h-4" />
                Scanner
                {location === "/" && (
                  <span className="absolute -bottom-[18px] left-0 right-0 h-[2px] bg-[#00C1B3] rounded-t-full shadow-[0_0_8px_rgba(0,193,179,0.8)]" />
                )}
              </Link>
              <Link
                href="/history"
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors relative pb-1",
                  location.startsWith("/history")
                    ? "text-white"
                    : "text-[#706F78] hover:text-white"
                )}
              >
                <History className="w-4 h-4" />
                History
                {location.startsWith("/history") && (
                  <span className="absolute -bottom-[18px] left-0 right-0 h-[2px] bg-[#00C1B3] rounded-t-full shadow-[0_0_8px_rgba(0,193,179,0.8)]" />
                )}
              </Link>

              <div className="pl-6 ml-2 border-l border-white/[0.08] flex items-center">
                <Link href="/">
                  <button className="flex items-center gap-2 text-sm font-semibold text-black px-4 py-2 rounded-full bg-gradient-to-r from-[#00C1B3] to-[#9273FF] hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(0,193,179,0.3)]">
                    Analyze
                  </button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
