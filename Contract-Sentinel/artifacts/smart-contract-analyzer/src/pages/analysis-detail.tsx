import { useRoute, Link } from "wouter";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { useGetAnalysisById } from "@workspace/api-client-react";
import { AnalysisReport } from "@/components/analysis-report";

export default function AnalysisDetail() {
  const [, params] = useRoute("/history/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;

  const { data, isLoading, error } = useGetAnalysisById(id, {
    query: {
      enabled: !!id
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#706F78]">
        <Loader2 className="w-12 h-12 animate-spin mb-6 text-[#00C1B3]" />
        <p className="font-mono text-sm tracking-widest uppercase glow-green-text text-[#00C1B3]">Retrieving Report...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-[#FF4D6A]/10 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-[#FF4D6A]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Report Not Found</h2>
        <p className="text-[#706F78] mb-8">This analysis report could not be loaded or doesn't exist.</p>
        <Link href="/history">
          <button className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
            Return to History
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/history">
          <button className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 hover:bg-[#00C1B3] hover:text-black hover:border-transparent text-white transition-all bg-[#111111]">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="font-mono text-sm font-medium text-[#706F78] bg-[#111111] px-4 py-2 rounded-xl border border-white/[0.05]">
          Report ID: <span className="text-white">#{data.id}</span>
        </div>
      </div>
      
      <AnalysisReport report={data} />
    </div>
  );
}
