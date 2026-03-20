import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface RiskGaugeProps {
  score: number;
}

export function RiskGauge({ score }: RiskGaugeProps) {
  // Clamp score between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Data for the gauge: [Filled portion, Empty portion]
  const data = [
    { value: normalizedScore },
    { value: 100 - normalizedScore }
  ];

  let color = "#00C1B3"; // Green
  let label = "Low Risk";
  let filterId = "glowGreen";
  
  if (normalizedScore >= 40 && normalizedScore < 70) {
    color = "#F59E0B"; // Yellow
    label = "Medium Risk";
    filterId = "glowYellow";
  } else if (normalizedScore >= 70) {
    color = "#FF4D6A"; // Red
    label = "High Risk";
    filterId = "glowRed";
  }

  return (
    <div className="relative w-full h-56 flex flex-col items-center justify-end overflow-hidden pt-4">
      <div className="absolute inset-0 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glowYellow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="90%"
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              <Cell fill={color} filter={`url(#${filterId})`} />
              <Cell fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="absolute bottom-4 flex flex-col items-center">
        <div className="flex items-baseline gap-1">
          <span 
            className="text-7xl font-sans font-bold tracking-tighter"
            style={{ 
              background: `linear-gradient(180deg, #ffffff 0%, ${color} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 0 30px ${color}40`
            }}
          >
            {normalizedScore}
          </span>
        </div>
        <div className="mt-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border" style={{ backgroundColor: `${color}15`, color, borderColor: `${color}40` }}>
          {label}
        </div>
      </div>

      {/* Min/Max Labels */}
      <div className="absolute bottom-2 left-0 w-full flex justify-between px-6 text-xs font-mono text-[#706F78] font-medium">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}
