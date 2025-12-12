import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, DollarSign, AlertCircle } from 'lucide-react';

interface CostCardProps {
  before: number;
  after: number;
  delta: number;
  percentChange: number;
  costAvailable: boolean;
}

export function CostCard({ before, after, delta, percentChange, costAvailable }: CostCardProps) {
  const isIncrease = delta > 0;
  const isDecrease = delta < 0;
  const isNeutral = delta === 0;

  const formatCost = (cost: number) => {
    if (cost >= 1000) {
      return `$${(cost / 1000).toFixed(1)}k`;
    }
    return `$${cost.toFixed(2)}`;
  };

  if (!costAvailable) {
    return (
      <div className="glass-card p-5 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Monthly Cost Impact
          </h3>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Not Available</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Cost estimation is only supported for AWS resources in the price table
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Monthly Cost Impact
        </h3>
        <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground ml-auto">
          AWS Only
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-3">
        {/* Before row */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground w-12">Before</span>
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-muted-foreground/50 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((before / Math.max(before, after)) * 100, 100)}%` }}
            />
          </div>
          <span className="text-sm font-mono font-semibold text-muted-foreground w-16 text-right">
            {formatCost(before)}
          </span>
        </div>

        {/* After row */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground w-12">After</span>
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isIncrease && 'bg-cost-increase',
                isDecrease && 'bg-cost-decrease',
                isNeutral && 'bg-muted-foreground/50'
              )}
              style={{ width: `${Math.min((after / Math.max(before, after)) * 100, 100)}%` }}
            />
          </div>
          <span
            className={cn(
              'text-sm font-mono font-semibold w-16 text-right',
              isIncrease && 'text-cost-increase',
              isDecrease && 'text-cost-decrease',
              isNeutral && 'text-foreground'
            )}
          >
            {formatCost(after)}
          </span>
        </div>

        {/* Delta summary */}
        <div className="flex items-center justify-center gap-2 mt-2 pt-3 border-t border-border/50">
          {isIncrease && <TrendingUp className="w-5 h-5 text-cost-increase" />}
          {isDecrease && <TrendingDown className="w-5 h-5 text-cost-decrease" />}
          {isNeutral && <Minus className="w-5 h-5 text-cost-neutral" />}
          <span
            className={cn(
              'text-2xl font-mono font-bold',
              isIncrease && 'text-cost-increase',
              isDecrease && 'text-cost-decrease',
              isNeutral && 'text-cost-neutral'
            )}
          >
            {isIncrease && '+'}
            {formatCost(Math.abs(delta))}
          </span>
          {!isNeutral && (
            <span
              className={cn(
                'text-sm font-mono',
                isIncrease && 'text-cost-increase',
                isDecrease && 'text-cost-decrease'
              )}
            >
              ({isIncrease ? '+' : ''}{percentChange.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
