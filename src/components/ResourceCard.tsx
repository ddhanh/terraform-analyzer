import { useState } from 'react';
import { AnalyzedResource } from '@/lib/types';
import { ActionBadge } from './ActionBadge';
import { RiskBadge } from './RiskBadge';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, AlertTriangle, Database, DollarSign, Tag } from 'lucide-react';

interface ResourceCardProps {
  resource: AnalyzedResource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCost = (cost: number) => {
    if (cost === 0) return '$0';
    if (cost < 1) return `$${cost.toFixed(3)}`;
    return `$${cost.toFixed(2)}`;
  };

  const renderValue = (value: unknown, depth = 0): React.ReactNode => {
    if (value === null) return <span className="text-muted-foreground">null</span>;
    if (value === undefined) return <span className="text-muted-foreground">undefined</span>;
    if (typeof value === 'boolean') {
      return <span className={value ? 'text-risk-safe' : 'text-risk-high'}>{String(value)}</span>;
    }
    if (typeof value === 'number') {
      return <span className="text-primary">{value}</span>;
    }
    if (typeof value === 'string') {
      if (value.length > 100) {
        return <span className="text-foreground">"{value.substring(0, 100)}..."</span>;
      }
      return <span className="text-foreground">"{value}"</span>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground">[]</span>;
      return (
        <div className={cn('pl-4', depth > 0 && 'border-l border-border')}>
          {value.map((item, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-muted-foreground">[{i}]:</span>
              {renderValue(item, depth + 1)}
            </div>
          ))}
        </div>
      );
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) return <span className="text-muted-foreground">{'{}'}</span>;
      return (
        <div className={cn('pl-4', depth > 0 && 'border-l border-border')}>
          {entries.map(([k, v]) => (
            <div key={k} className="flex gap-2 flex-wrap">
              <span className="text-muted-foreground">{k}:</span>
              {renderValue(v, depth + 1)}
            </div>
          ))}
        </div>
      );
    }
    return <span>{String(value)}</span>;
  };

  return (
    <div
      className={cn(
        'glass-card overflow-hidden transition-all duration-200',
        'border-l-4',
        resource.riskLevel === 'critical' && 'border-l-risk-critical',
        resource.riskLevel === 'high' && 'border-l-risk-high',
        resource.riskLevel === 'medium' && 'border-l-risk-medium',
        resource.riskLevel === 'low' && 'border-l-risk-low',
        resource.riskLevel === 'safe' && 'border-l-risk-safe',
        isExpanded && 'ring-1 ring-primary/30'
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-accent/30 transition-colors"
      >
        <div className="flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-sm font-mono font-medium text-foreground truncate">
              {resource.address}
            </code>
            {resource.isProduction && (
              <span className="px-1.5 py-0.5 bg-risk-critical/20 text-risk-critical text-xs font-semibold rounded">
                PROD
              </span>
            )}
            {resource.isStateful && (
              <span title="Stateful resource">
                <Database className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{resource.type}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <ActionBadge action={resource.action} />
          <RiskBadge level={resource.riskLevel} score={resource.riskScore} />
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border animate-slide-up">
          {/* Risk reasons */}
          {resource.riskReasons.length > 0 && (
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-risk-high" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Risk Factors
                </span>
              </div>
              <ul className="space-y-1">
                {resource.riskReasons.map((reason, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-risk-high">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cost info */}
          {(resource.costBefore > 0 || resource.costAfter > 0) && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Cost Impact
                </span>
              </div>
              <div className="flex gap-6 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">Before: </span>
                  <span>{formatCost(resource.costBefore)}/mo</span>
                </div>
                <div>
                  <span className="text-muted-foreground">After: </span>
                  <span
                    className={cn(
                      resource.costDelta > 0 && 'text-cost-increase',
                      resource.costDelta < 0 && 'text-cost-decrease'
                    )}
                  >
                    {formatCost(resource.costAfter)}/mo
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Delta: </span>
                  <span
                    className={cn(
                      resource.costDelta > 0 && 'text-cost-increase',
                      resource.costDelta < 0 && 'text-cost-decrease'
                    )}
                  >
                    {resource.costDelta >= 0 ? '+' : ''}
                    {formatCost(resource.costDelta)}/mo
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Changed attributes */}
          {resource.changedAttributes.length > 0 && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-action-update" />
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Changed Attributes
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {resource.changedAttributes.map((attr) => (
                  <code
                    key={attr}
                    className="px-2 py-1 bg-action-update/10 text-action-update text-xs font-mono rounded"
                  >
                    {attr}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Before/After comparison */}
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Before */}
            <div className="p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                Before
              </h4>
              <div className="text-xs font-mono overflow-x-auto scrollbar-thin max-h-60">
                {resource.before ? (
                  renderValue(resource.before)
                ) : (
                  <span className="text-muted-foreground italic">No previous state</span>
                )}
              </div>
            </div>

            {/* After */}
            <div className="p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                After
              </h4>
              <div className="text-xs font-mono overflow-x-auto scrollbar-thin max-h-60">
                {resource.after ? (
                  renderValue(resource.after)
                ) : (
                  <span className="text-muted-foreground italic">Will be destroyed</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
