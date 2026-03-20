import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle, Search, Clock, ArrowRight } from "lucide-react";
import { useGetAnalysisHistory } from "@workspace/api-client-react";
import { formatAddress, formatDate } from "@/lib/utils";

export default function History() {
  const { data, isLoading, error } = useGetAnalysisHistory({ limit: 50 });

  const getRiskStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return { hex: '#00C1B3', icon: <ShieldCheck className="w-4 h-4 text-[#00C1B3]" /> };
      case 'medium': return { hex: '#F59E0B', icon: <AlertTriangle className="w-4 h-4 text-[#F59E0B]" /> };
      case 'high': return { hex: '#FF4D6A', icon: <ShieldAlert className="w-4 h-4 text-[#FF4D6A]" /> };
      default: return { hex: '#706F78', icon: <ShieldAlert className="w-4 h-4 text-[#706F78]" /> };
    }
  };

  return (
    <div className="space-y-8 pt-6 pb-12 max-w-6xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Scan History</h1>
          <p className="text-[#706F78]">Review previously analyzed smart contracts</p>
        </div>
        <Link href="/">
          <button className="flex items-center gap-2 text-sm font-medium text-black px-5 py-2.5 rounded-full bg-[#00C1B3] hover:bg-[#1fffed] transition-colors shadow-[0_0_15px_rgba(0,193,179,0.3)]">
            <Search className="w-4 h-4" />
            New Scan
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="glass-card rounded-2xl overflow-hidden p-6 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="glass-card rounded-2xl p-12 text-center border-l-4 border-l-[#FF4D6A]">
          <AlertTriangle className="w-10 h-10 text-[#FF4D6A] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">Failed to load history</h3>
          <p className="text-[#706F78] mt-2">Please try again later or check your connection.</p>
        </div>
      ) : data?.items.length === 0 ? (
        <div className="border border-white/10 border-dashed rounded-3xl py-20 text-center bg-white/[0.01]">
          <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-[#706F78]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No history found</h3>
          <p className="text-[#706F78] mb-8 max-w-md mx-auto">You haven't scanned any contracts yet. Start by entering a contract address in the scanner.</p>
          <Link href="/">
            <button className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              Start your first scan
            </button>
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs text-[#706F78] uppercase tracking-wider bg-black/40 border-b border-white/[0.08]">
                <tr>
                  <th className="px-6 py-5 font-bold">Contract Address</th>
                  <th className="px-6 py-5 font-bold">Network</th>
                  <th className="px-6 py-5 font-bold">Risk Score</th>
                  <th className="px-6 py-5 font-bold">Risk Level</th>
                  <th className="px-6 py-5 font-bold">Date</th>
                  <th className="px-6 py-5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {data?.items.map((item, i) => {
                  const riskStyle = getRiskStyle(item.riskLevel);
                  return (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <span className="font-mono font-medium text-white group-hover:text-[#00C1B3] transition-colors">
                          {formatAddress(item.address)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white">
                          {item.chain}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${item.riskScore}%`,
                                backgroundColor: riskStyle.hex,
                                boxShadow: `0 0 10px ${riskStyle.hex}`
                              }}
                            />
                          </div>
                          <span className="font-mono font-bold text-white">{item.riskScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/40 border border-white/5" style={{ color: riskStyle.hex }}>
                          {riskStyle.icon}
                          {item.riskLevel}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[#706F78]">
                        <div className="flex items-center gap-2 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(item.analyzedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link href={`/history/${item.id}`}>
                          <button className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-white/5 hover:bg-[#00C1B3] hover:text-black px-4 py-2 rounded-lg transition-all">
                            View
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
