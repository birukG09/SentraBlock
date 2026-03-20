import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertCircle } from "lucide-react";
import { useAnalyzeContract, AnalyzeContractRequestChain } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { ScanningAnimation } from "@/components/scanning-animation";
import { AnalysisReport } from "@/components/analysis-report";

import nodesIcon from "@assets/nodes_1774046195356.png";
import blockchainCubesIcon from "@assets/blockchain_(1)_1774046195357.png";
import cryptoWalletIcon from "@assets/crypto-wallet_1774046195357.png";
import blockchainIcon from "@assets/blockchain_1774046195355.png";
import programmerIcon from "@assets/programmer_1774046195356.png";

const features = [
  {
    icon: nodesIcon,
    title: "Multi-Chain Network",
    description: "Supports Ethereum, Arbitrum, Optimism, Polygon, Base, BSC, and Avalanche with unified analysis.",
    animation: {
      animate: { y: [0, -6, 0] },
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
    glow: "rgba(0,193,179,0.3)",
    filter: undefined,
  },
  {
    icon: blockchainCubesIcon,
    title: "Static Analysis",
    description: "Detects reentrancy, privilege escalation, mint functions, blacklists, and self-destruct patterns.",
    animation: {
      animate: { rotate: [0, 3, -3, 0] },
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
    },
    glow: "rgba(146,115,255,0.3)",
    filter: undefined,
  },
  {
    icon: cryptoWalletIcon,
    title: "DeFi Risk Scoring",
    description: "Assigns a 0–100 risk score by weighing vulnerability severity and on-chain behavior patterns.",
    animation: {
      animate: { scale: [1, 1.06, 1] },
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
    },
    glow: "rgba(245,158,11,0.3)",
    filter: undefined,
  },
  {
    icon: blockchainIcon,
    title: "RAG-Powered Context",
    description: "Retrieval-augmented generation grounds AI explanations in real vulnerability databases and audit history.",
    animation: {
      animate: { opacity: [0.85, 1, 0.85] },
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
    glow: "rgba(0,193,179,0.25)",
    filter: "invert(1) sepia(1) saturate(3) hue-rotate(140deg) brightness(1.1)",
  },
  {
    icon: programmerIcon,
    title: "AI Plain Language",
    description: "Large language models explain complex vulnerabilities in plain English so anyone can understand the risk.",
    animation: {
      animate: { y: [0, 4, 0] },
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 },
    },
    glow: "rgba(146,115,255,0.25)",
    filter: "invert(1) sepia(1) saturate(2) hue-rotate(200deg) brightness(1.2)",
  },
];

export default function Home() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState<AnalyzeContractRequestChain>(AnalyzeContractRequestChain.ethereum);
  const { toast } = useToast();

  const analyzeMutation = useAnalyzeContract({
    mutation: {
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: error.message || "Failed to analyze contract. Please check the address and try again.",
        });
      }
    }
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      toast({ title: "Address Required", description: "Please enter a smart contract address.", variant: "destructive" });
      return;
    }
    analyzeMutation.mutate({ data: { address, chain } });
  };

  const handleReset = () => {
    analyzeMutation.reset();
    setAddress("");
  };

  return (
    <div className="relative pb-16 w-full flex flex-col">
      <AnimatePresence mode="wait">
        {!analyzeMutation.data && !analyzeMutation.isPending && (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col space-y-16 pt-12 relative"
          >
            {/* 3D Grid Background */}
            <div
              className="absolute inset-0 overflow-hidden -z-10 pointer-events-none"
              style={{
                height: "520px",
                maskImage: "linear-gradient(to bottom, black 20%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 100%)",
              }}
            >
              <div className="absolute inset-0 perspective-grid opacity-50" />
            </div>

            {/* Hero */}
            <div className="text-center space-y-6 max-w-4xl mx-auto z-10 px-4">
              {/* Floating logo hero element */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-20 h-20 mb-2"
                style={{ filter: "drop-shadow(0 0 24px rgba(0,193,179,0.5))" }}
              >
                <img src={blockchainCubesIcon} alt="SentraBlock" className="w-full h-full object-contain" />
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                <span className="gradient-text">Audit Smart Contracts</span>
                <br />
                In Real Time.
              </h1>

              <p className="text-[#706F78] text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
                <span className="text-white font-medium">SentraBlock</span> is an AI-powered smart contract risk analyzer
                that helps users understand blockchain contracts instantly. By combining static analysis, RAG, and large
                language models, it detects vulnerabilities, assigns risk scores, and explains behavior in plain language
                — enabling safer decisions in Web3.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto w-full z-10 px-4">
              <form
                onSubmit={handleAnalyze}
                className="relative flex items-center bg-[#111111] border border-white/[0.08] rounded-full p-2 shadow-2xl focus-within:ring-1 focus-within:ring-[#00C1B3] focus-within:border-[#00C1B3] transition-all"
              >
                <div className="flex items-center pl-4 pr-2">
                  <select
                    className="bg-transparent text-white font-medium text-sm focus:outline-none cursor-pointer appearance-none pr-4"
                    value={chain}
                    onChange={(e) => setChain(e.target.value as AnalyzeContractRequestChain)}
                  >
                    {Object.values(AnalyzeContractRequestChain).map(c => (
                      <option key={c} value={c} className="bg-[#111111] text-white">
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="h-8 w-[1px] bg-white/[0.08] mx-2" />

                <div className="flex-1 flex items-center px-4">
                  <Search className="text-[#706F78] w-5 h-5 mr-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter contract address 0x..."
                    className="w-full bg-transparent text-white placeholder:text-[#706F78] font-mono text-sm focus:outline-none"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#00C1B3] hover:bg-[#1fffed] text-black font-bold rounded-full px-7 py-3 transition-colors shadow-[0_0_20px_rgba(0,193,179,0.4)] shrink-0"
                >
                  Analyze
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 mt-4 text-[#706F78] text-xs font-medium">
                <div className="w-2 h-2 rounded-full bg-[#00C1B3] shadow-[0_0_8px_rgba(0,193,179,0.8)]" />
                Trusted by builders • 7 chains supported
              </div>
            </div>

            {/* Feature Cards — all 5 icons */}
            <div className="z-10 px-4 space-y-4 max-w-6xl mx-auto w-full">
              <h2 className="text-center text-xs font-semibold tracking-[0.2em] text-[#706F78] uppercase mb-6">
                Key Capabilities
              </h2>

              {/* Row 1: 3 cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {features.slice(0, 3).map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ rotateY: 4, rotateX: -4, scale: 1.02 }}
                    style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                    className="glass-card p-6 rounded-2xl cursor-default flex flex-col items-center text-center space-y-4"
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
                      style={{ background: `radial-gradient(circle at center, ${feature.glow} 0%, transparent 70%)` }}
                    >
                      <motion.img
                        src={feature.icon}
                        alt={feature.title}
                        className="w-12 h-12 object-contain"
                        style={{ filter: feature.filter }}
                        {...feature.animation}
                      />
                    </div>
                    <h3 className="font-semibold text-white text-base">{feature.title}</h3>
                    <p className="text-sm text-[#706F78] leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Row 2: 2 cards centered */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:max-w-2xl md:mx-auto">
                {features.slice(3).map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i + 3) * 0.1, duration: 0.5 }}
                    whileHover={{ rotateY: 4, rotateX: -4, scale: 1.02 }}
                    style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                    className="glass-card p-6 rounded-2xl cursor-default flex flex-col items-center text-center space-y-4"
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
                      style={{ background: `radial-gradient(circle at center, ${feature.glow} 0%, transparent 70%)` }}
                    >
                      <motion.img
                        src={feature.icon}
                        alt={feature.title}
                        className="w-12 h-12 object-contain"
                        style={{ filter: feature.filter }}
                        {...feature.animation}
                      />
                    </div>
                    <h3 className="font-semibold text-white text-base">{feature.title}</h3>
                    <p className="text-sm text-[#706F78] leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {analyzeMutation.isPending && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex items-center justify-center py-20"
          >
            <ScanningAnimation />
          </motion.div>
        )}

        {/* Results */}
        {analyzeMutation.data && !analyzeMutation.isPending && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-8"
          >
            <div className="mb-8 flex justify-between items-center bg-[#111111] p-4 rounded-xl border border-white/[0.08] shadow-sm">
              <div className="flex items-center gap-3 text-sm text-[#00C1B3]">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Analysis complete. Review the findings below.</span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white transition-colors"
              >
                New Scan
              </button>
            </div>
            <AnalysisReport report={analyzeMutation.data} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
