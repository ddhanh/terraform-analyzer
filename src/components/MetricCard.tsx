import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  subtext?: string;
  className?: string;
}

const variantStyles = {
  default: 'text-foreground',
  success: 'text-risk-safe',
  warning: 'text-risk-medium',
  danger: 'text-risk-critical',
  info: 'text-primary',
};

export function MetricCard({ label, value, icon: Icon, variant = 'default', subtext, className }: MetricCardProps) {
  return (
    <div className={cn('glass-card p-4 flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <Icon className={cn('w-4 h-4', variantStyles[variant])} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn('text-2xl font-bold font-mono', variantStyles[variant])}>
          {value}
        </span>
        {subtext && (
          <span className="text-xs text-muted-foreground">{subtext}</span>
        )}
      </div>
    </div>
  );
}
