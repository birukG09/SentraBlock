import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import blockchainCubesIcon from "@assets/blockchain_(1)_1774046195357.png";

export function ScanningAnimation() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Fetching source code",
    "Running static analysis",
    "Generating AI report"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-full max-w-md mx-auto p-10 glass-card rounded-2xl shadow-2xl flex flex-col items-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-[#00C1B3] opacity-10 rounded-full blur-[50px]" />

      <div className="relative mb-10 flex flex-col items-center justify-center">
        {/* Pulsing rings */}
        <div className="relative flex items-center justify-center w-28 h-28 mb-6">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#00C1B3]"
            animate={{ scale: [1, 1.6, 2], opacity: [0.7, 0.2, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-[#00C1B3] opacity-50"
            animate={{ scale: [1, 1.4, 1.7], opacity: [0.5, 0.1, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
          />
          {/* Rotating blockchain icon */}
          <motion.div
            className="w-20 h-20 z-10 relative"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 16px rgba(0,193,179,0.6))" }}
          >
            <img src={blockchainCubesIcon} alt="Scanning" className="w-full h-full object-contain" />
          </motion.div>
        </div>

        <h3 className="text-xl font-bold text-[#00C1B3] tracking-widest flex items-center glow-green-text">
          SCANNING CONTRACT
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="ml-1"
          >
            _
          </motion.span>
        </h3>
      </div>

      <div className="w-full space-y-6">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <motion.div
              key={index}
              className="flex items-center gap-4 relative"
              initial={{ opacity: 0.3, x: -10 }}
              animate={{ opacity: isActive || isCompleted ? 1 : 0.3, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex-shrink-0 relative z-10">
                {isCompleted ? (
                  <div className="w-6 h-6 rounded-full bg-[#00C1B3] flex items-center justify-center shadow-[0_0_10px_rgba(0,193,179,0.5)]">
                    <CheckCircle2 className="w-4 h-4 text-black" />
                  </div>
                ) : isActive ? (
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <div className="absolute w-3 h-3 rounded-full bg-[#1fffed] shadow-[0_0_15px_rgba(31,255,237,0.8)] z-10" />
                    <motion.div
                      className="absolute w-full h-full rounded-full border border-[#1fffed]"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-white/20 bg-[#111111]" />
                )}
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`absolute top-6 left-3 w-[2px] h-8 -translate-x-1/2 z-0 transition-colors duration-500 ${
                    isCompleted ? "bg-[#00C1B3]" : "bg-white/10"
                  }`}
                />
              )}

              <span className={`text-base font-medium ${isActive ? "text-white" : isCompleted ? "text-white/80" : "text-[#706F78]"}`}>
                {step}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
