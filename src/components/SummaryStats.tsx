import { PlanAnalysis } from '@/lib/types';
import { MetricCard } from './MetricCard';
import { Plus, Pencil, Trash2, RefreshCw, Layers, AlertOctagon } from 'lucide-react';

interface SummaryStatsProps {
  analysis: PlanAnalysis;
}

export function SummaryStats({ analysis }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <MetricCard
        label="Total"
        value={analysis.totalResources}
        icon={Layers}
        variant="info"
      />
      <MetricCard
        label="Create"
        value={analysis.creates}
        icon={Plus}
        variant={analysis.creates > 0 ? 'success' : 'default'}
      />
      <MetricCard
        label="Update"
        value={analysis.updates}
        icon={Pencil}
        variant={analysis.updates > 0 ? 'warning' : 'default'}
      />
      <MetricCard
        label="Delete"
        value={analysis.deletes}
        icon={Trash2}
        variant={analysis.deletes > 0 ? 'danger' : 'default'}
      />
      <MetricCard
        label="Replace"
        value={analysis.replaces}
        icon={RefreshCw}
        variant={analysis.replaces > 0 ? 'danger' : 'default'}
      />
      <MetricCard
        label="High Risk"
        value={analysis.highRiskResources.length}
        icon={AlertOctagon}
        variant={analysis.highRiskResources.length > 0 ? 'danger' : 'success'}
      />
    </div>
  );
}
