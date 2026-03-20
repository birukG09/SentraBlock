import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, AlertTriangle, Activity, Clock, Code2, Cpu } from "lucide-react";
import { ContractAnalysisResult, Vulnerability } from "@workspace/api-client-react";
import { RiskGauge } from "@/components/risk-gauge";
import { formatDate } from "@/lib/utils";

export function AnalysisReport({ report }: { report: ContractAnalysisResult }) {
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const getRiskColor = (level: string, format: 'hex' | 'border' = 'hex') => {
    switch (level.toLowerCase()) {
      case 'low': return format === 'hex' ? '#00C1B3' : 'border-l-[#00C1B3]';
      case 'medium': return format === 'hex' ? '#F59E0B' : 'border-l-[#F59E0B]';
      case 'high': return format === 'hex' ? '#FF4D6A' : 'border-l-[#FF4D6A]';
      default: return format === 'hex' ? '#706F78' : 'border-l-[#706F78]';
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'critical': 
        return <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4D6A] bg-[#FF4D6A]/10 px-3 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-[#FF4D6A] shadow-[0_0_8px_#FF4D6A]"></span> Critical</div>;
      case 'high': 
        return <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> High</div>;
      case 'medium': 
        return <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded-full">Medium</div>;
      case 'low': 
        return <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00C1B3] bg-[#00C1B3]/10 px-3 py-1 rounded-full">Low</div>;
      default: 
        return <div className="text-xs font-bold uppercase tracking-wider text-[#706F78] bg-white/5 px-3 py-1 rounded-full">{sev}</div>;
    }
  };

  const getVulnBorderColor = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'critical': return 'border-l-[#FF4D6A]';
      case 'high': return 'border-l-[#F59E0B]';
      case 'medium': return 'border-l-[#F59E0B]';
      case 'low': return 'border-l-[#00C1B3]';
      default: return 'border-l-white/10';
    }
  };

  const BooleanPill = ({ label, value, isPositive = true }: { label: string, value?: boolean, isPositive?: boolean }) => {
    if (value === undefined) return null;
    const isGood = value === isPositive;
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-[#111111] border border-white/[0.05]">
        <span className="text-sm font-medium text-[#706F78]">{label}</span>
        <span className={`text-sm font-bold ${isGood ? 'text-[#00C1B3]' : 'text-[#FF4D6A]'}`}>
          {value ? 'YES' : 'NO'}
        </span>
      </div>
    );
  };

  const MetricItem = ({ label, value, colorClass = "text-white" }: { label: string, value: React.ReactNode, colorClass?: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
      <span className="text-sm font-medium text-[#706F78]">{label}</span>
      <span className={`text-sm font-bold ${colorClass}`}>{value}</span>
    </div>
  );

  return (
    <motion.div 
      variants={containerVars} 
      initial="hidden" 
      animate="show"
      className="space-y-6"
    >
      {/* Header Bar */}
      <motion.div variants={itemVars} className={`flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-[#111111] border-y border-r border-white/[0.08] shadow-lg p-5 rounded-xl border-l-4 ${getRiskColor(report.riskLevel, 'border')}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-mono font-bold tracking-tight text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {report.address}
              </h2>
              <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white">
                {report.chain}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#706F78] font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Analyzed on {formatDate(report.analyzedAt)}</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 flex items-center border-t border-white/5 md:border-0 pt-4 md:pt-0 w-full md:w-auto justify-end">
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-[#706F78] uppercase tracking-widest mb-1">Risk Level</span>
            <div className={`flex items-center gap-2 text-lg font-bold uppercase tracking-wide`} style={{ color: getRiskColor(report.riskLevel, 'hex') }}>
              {report.riskLevel === 'Low' ? <ShieldCheck className="w-5 h-5" /> : report.riskLevel === 'High' ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              {report.riskLevel}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-1">
          <motion.div variants={itemVars}>
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00C1B3] to-[#9273FF] opacity-50"></div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#706F78] mb-6">Security Score</h3>
              <RiskGauge score={report.riskScore} />
            </div>
          </motion.div>

          <motion.div variants={itemVars}>
            <div className="bg-[#111111] border border-[#00C1B3]/20 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#00C1B3] opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#00C1B3]/10 rounded-lg">
                  <Activity className="w-5 h-5 text-[#00C1B3]" />
                </div>
                <h3 className="text-base font-bold text-white">AI Analysis</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#706F78] mb-2">Overview</h4>
                  <p className="text-sm text-white/90 leading-relaxed">{report.aiExplanation.overview}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#706F78] mb-2">Risk Reasoning</h4>
                  <p className="text-sm text-white/70 leading-relaxed">{report.aiExplanation.riskReasoning}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border-l-2 border-[#00C1B3]">
                  <p className="text-sm italic text-white/80 font-serif leading-relaxed">"{report.aiExplanation.userFriendlySummary}"</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Vulnerabilities */}
          <motion.div variants={itemVars}>
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#9273FF]" />
                  Identified Vulnerabilities
                </h3>
                <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white">
                  {report.vulnerabilities.length} Found
                </div>
              </div>
              
              <div className="p-6 flex-1 bg-[#0A0A0A]/50">
                {report.vulnerabilities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#00C1B3]/10 flex items-center justify-center mb-4">
                      <ShieldCheck className="w-8 h-8 text-[#00C1B3]" />
                    </div>
                    <p className="text-[#00C1B3] font-bold text-lg">No Critical Issues Found</p>
                    <p className="text-[#706F78] text-sm mt-1">The static analyzer did not detect known vulnerability patterns.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {report.vulnerabilities.map((vuln: Vulnerability, idx) => (
                      <div key={idx} className={`bg-[#111111] rounded-xl p-5 border border-white/[0.05] border-l-4 ${getVulnBorderColor(vuln.severity)} shadow-sm`}>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-white text-base">{vuln.type}</h4>
                          {getSeverityBadge(vuln.severity)}
                        </div>
                        <p className="text-sm text-[#706F78] mb-4 leading-relaxed">{vuln.description}</p>
                        {vuln.recommendation && (
                          <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm border border-white/5">
                            <span className="font-bold text-white mr-2">Recommendation:</span>
                            <span className="text-white/80">{vuln.recommendation}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Behavior */}
            <motion.div variants={itemVars}>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-6">Contract Behavior</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#111111] border border-white/[0.05]">
                    <span className="text-sm font-medium text-[#706F78]">Ownership</span>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-white/10 rounded text-white">{report.behavior.ownershipType}</span>
                  </div>
                  <BooleanPill label="Can Mint Tokens" value={report.behavior.canMint} isPositive={false} />
                  <BooleanPill label="Is Upgradeable" value={report.behavior.upgradeable} isPositive={false} />
                  <BooleanPill label="Has Pause Function" value={report.behavior.hasPauseFunction} isPositive={true} />
                  <BooleanPill label="Has Blacklist" value={report.behavior.hasBlacklist} isPositive={false} />
                  <BooleanPill label="Uses Proxy" value={report.behavior.hasProxy} isPositive={true} />
                </div>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div variants={itemVars}>
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-6">Trust Indicators</h3>
                <div className="space-y-1">
                  <MetricItem 
                    label="Audited" 
                    value={report.trustIndicators.isAudited ? "YES" : "NO"} 
                    colorClass={report.trustIndicators.isAudited ? "text-[#00C1B3]" : "text-[#FF4D6A]"} 
                  />
                  <MetricItem 
                    label="Liquidity Locked" 
                    value={report.trustIndicators.liquidityLocked ? "YES" : "NO"} 
                    colorClass={report.trustIndicators.liquidityLocked ? "text-[#00C1B3]" : "text-[#FF4D6A]"} 
                  />
                  <MetricItem 
                    label="Verified Source" 
                    value={report.trustIndicators.verifiedSource ? "YES" : "NO"} 
                    colorClass={report.trustIndicators.verifiedSource ? "text-[#00C1B3]" : "text-[#FF4D6A]"} 
                  />
                  <MetricItem 
                    label="Contract Age" 
                    value={<span className="font-mono">{report.trustIndicators.contractAgedays} days</span>} 
                  />
                  <MetricItem 
                    label="Transactions" 
                    value={<span className="font-mono">{report.trustIndicators.transactionCount.toLocaleString()}</span>} 
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
