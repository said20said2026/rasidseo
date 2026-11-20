import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 'md',
  label = 'النتيجة الإجمالية'
}) => {
  const radius = size === 'lg' ? 44 : size === 'md' ? 36 : 24;
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 5;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  let colorClass = 'text-emerald-500 dark:text-emerald-400';
  let bgClass = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  let tierText = 'ممتاز ومطابق';

  if (score < 50) {
    colorClass = 'text-rose-500 dark:text-rose-400';
    bgClass = 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
    tierText = 'أخطاء حرجة متراكمة';
  } else if (score < 75) {
    colorClass = 'text-amber-500 dark:text-amber-400';
    bgClass = 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
    tierText = 'يحتاج إلى تحسينات';
  } else if (score < 90) {
    colorClass = 'text-blue-500 dark:text-blue-400';
    bgClass = 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
    tierText = 'جيد مع فرص نمو';
  }

  const dimensions = size === 'lg' ? 120 : size === 'md' ? 96 : 64;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimensions}
          height={dimensions}
          className="-rotate-90 transform"
        >
          {/* Background circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className={`font-mono font-bold tabular-nums tracking-tight ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-base'} text-slate-900 dark:text-white`}>
            {score}
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono -mt-1">/ 100</span>
          )}
        </div>
      </div>

      {label && size !== 'sm' && (
        <div className="mt-2.5">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</p>
          <p className={`mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded border inline-block ${bgClass}`}>
            {tierText}
          </p>
        </div>
      )}
    </div>
  );
};
