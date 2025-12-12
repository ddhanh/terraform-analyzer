import { AlertOctagon, AlertTriangle } from 'lucide-react';

interface WarningsListProps {
  criticalIssues: string[];
  warnings: string[];
}

export function WarningsList({ criticalIssues, warnings }: WarningsListProps) {
  if (criticalIssues.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {criticalIssues.length > 0 && (
        <div className="glass-card border-l-4 border-l-risk-critical p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-5 h-5 text-risk-critical" />
            <h3 className="font-semibold text-risk-critical">Critical Issues</h3>
            <span className="ml-auto text-xs font-mono bg-risk-critical/20 text-risk-critical px-2 py-0.5 rounded">
              {criticalIssues.length}
            </span>
          </div>
          <ul className="space-y-2">
            {criticalIssues.map((issue, i) => (
              <li key={i} className="text-sm font-mono text-foreground/90 flex items-start gap-2">
                <span className="text-risk-critical mt-0.5">▸</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="glass-card border-l-4 border-l-risk-high p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-risk-high" />
            <h3 className="font-semibold text-risk-high">Warnings</h3>
            <span className="ml-auto text-xs font-mono bg-risk-high/20 text-risk-high px-2 py-0.5 rounded">
              {warnings.length}
            </span>
          </div>
          <ul className="space-y-2">
            {warnings.map((warning, i) => (
              <li key={i} className="text-sm font-mono text-foreground/90 flex items-start gap-2">
                <span className="text-risk-high mt-0.5">▸</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
