import { RiskLevel } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
}

export function RiskGauge({ score, level }: RiskGaugeProps) {
  // Convert score (0-100) to rotation angle (-90 to 90 degrees)
  const rotation = -90 + (score / 100) * 180;

  const levelLabels: Record<RiskLevel, string> = {
    safe: 'SAFE',
    low: 'LOW',
    medium: 'MEDIUM',
    high: 'HIGH',
    critical: 'CRITICAL',
  };

  const levelColors: Record<RiskLevel, string> = {
    safe: 'text-risk-safe',
    low: 'text-risk-low',
    medium: 'text-risk-medium',
    high: 'text-risk-high',
    critical: 'text-risk-critical',
  };

  return (
    <div className="flex flex-col items-center justify-between h-full">
      {/* Gauge container */}
      <div className="relative w-40 h-24">
        {/* Gauge background arc */}
        <svg
          className="w-full h-full"
          viewBox="0 0 200 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            stroke="hsl(var(--muted))"
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
          />
          {/* Gradient track */}
          <defs>
            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--risk-safe))" />
              <stop offset="25%" stopColor="hsl(var(--risk-low))" />
              <stop offset="50%" stopColor="hsl(var(--risk-medium))" />
              <stop offset="75%" stopColor="hsl(var(--risk-high))" />
              <stop offset="100%" stopColor="hsl(var(--risk-critical))" />
            </linearGradient>
          </defs>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            stroke="url(#riskGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
            className="opacity-80"
          />
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = -180 + (tick / 100) * 180;
            const rad = (angle * Math.PI) / 180;
            const x1 = 100 + 70 * Math.cos(rad);
            const y1 = 100 + 70 * Math.sin(rad);
            const x2 = 100 + 80 * Math.cos(rad);
            const y2 = 100 + 80 * Math.sin(rad);
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        {/* Needle */}
        <div
          className="absolute bottom-1.5 left-1/2 origin-bottom transition-transform duration-1000 ease-out"
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg)`,
          }}
        >
          <div className="w-0.5 h-12 bg-foreground rounded-full shadow-lg" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rounded-full" />
        </div>
      </div>
      
      {/* Score display */}
      <div className="text-center mt-2">
        <span className={cn('text-3xl font-bold font-mono', levelColors[level])}>
          {Math.round(score)}
        </span>
      </div>
      
      {/* Risk level label */}
      <div className={cn(
        'px-3 py-1 rounded-full text-xs font-semibold tracking-wider mt-2',
        'border',
        level === 'safe' && 'bg-risk-safe/20 border-risk-safe text-risk-safe',
        level === 'low' && 'bg-risk-low/20 border-risk-low text-risk-low',
        level === 'medium' && 'bg-risk-medium/20 border-risk-medium text-risk-medium',
        level === 'high' && 'bg-risk-high/20 border-risk-high text-risk-high',
        level === 'critical' && 'bg-risk-critical/20 border-risk-critical text-risk-critical animate-pulse',
      )}>
        {levelLabels[level]} RISK
      </div>
    </div>
  );
}
