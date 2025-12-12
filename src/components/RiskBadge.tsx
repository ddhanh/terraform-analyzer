import { RiskLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ShieldAlert, ShieldCheck, Shield, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  className?: string;
}

const riskConfig: Record<RiskLevel, { label: string; icon: React.ReactNode; className: string }> = {
  safe: {
    label: 'SAFE',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    className: 'bg-risk-safe/20 text-risk-safe border-risk-safe/50',
  },
  low: {
    label: 'LOW',
    icon: <Shield className="w-3.5 h-3.5" />,
    className: 'bg-risk-low/20 text-risk-low border-risk-low/50',
  },
  medium: {
    label: 'MEDIUM',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    className: 'bg-risk-medium/20 text-risk-medium border-risk-medium/50',
  },
  high: {
    label: 'HIGH',
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
    className: 'bg-risk-high/20 text-risk-high border-risk-high/50',
  },
  critical: {
    label: 'CRITICAL',
    icon: <AlertOctagon className="w-3.5 h-3.5" />,
    className: 'bg-risk-critical/20 text-risk-critical border-risk-critical/50',
  },
};

export function RiskBadge({ level, score, className }: RiskBadgeProps) {
  const config = riskConfig[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border',
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
      {score !== undefined && (
        <span className="font-mono opacity-80">({score})</span>
      )}
    </span>
  );
}
