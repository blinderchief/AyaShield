"use client";

interface RiskGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

export default function RiskGauge({ score, size = 120, label }: RiskGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (clampedScore / 100) * circumference;

  const color =
    clampedScore >= 70
      ? "#EF4444"
      : clampedScore >= 40
      ? "#F59E0B"
      : "#10B981";

  const levelLabel =
    clampedScore >= 70
      ? "High"
      : clampedScore >= 40
      ? "Medium"
      : "Low";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth={8}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {clampedScore}
          </span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            {levelLabel}
          </span>
        </div>
      </div>
      {label && (
        <p className="text-xs text-text-secondary font-medium">{label}</p>
      )}
    </div>
  );
}
