import { useState, useMemo } from 'react';
import { AnalyzedResource, ActionType, RiskLevel } from '@/lib/types';
import { ResourceCard } from './ResourceCard';
import { Input } from '@/components/ui/input';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourceListProps {
  resources: AnalyzedResource[];
}

type FilterAction = ActionType | 'all';
type FilterRisk = RiskLevel | 'all';

export function ResourceList({ resources }: ResourceListProps) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<FilterAction>('all');
  const [riskFilter, setRiskFilter] = useState<FilterRisk>('all');

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesAddress = resource.address.toLowerCase().includes(searchLower);
        const matchesType = resource.type.toLowerCase().includes(searchLower);
        if (!matchesAddress && !matchesType) return false;
      }

      // Action filter
      if (actionFilter !== 'all' && resource.action !== actionFilter) {
        return false;
      }

      // Risk filter
      if (riskFilter !== 'all' && resource.riskLevel !== riskFilter) {
        return false;
      }

      return true;
    });
  }, [resources, search, actionFilter, riskFilter]);

  const actionOptions: { value: FilterAction; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: resources.length },
    { value: 'create', label: 'Create', count: resources.filter((r) => r.action === 'create').length },
    { value: 'update', label: 'Update', count: resources.filter((r) => r.action === 'update').length },
    { value: 'delete', label: 'Delete', count: resources.filter((r) => r.action === 'delete').length },
    { value: 'replace', label: 'Replace', count: resources.filter((r) => r.action === 'replace').length },
  ];

  const riskOptions: { value: FilterRisk; label: string; count: number; color: string }[] = [
    { value: 'all', label: 'All', count: resources.length, color: 'bg-muted' },
    { value: 'critical', label: 'Critical', count: resources.filter((r) => r.riskLevel === 'critical').length, color: 'bg-risk-critical' },
    { value: 'high', label: 'High', count: resources.filter((r) => r.riskLevel === 'high').length, color: 'bg-risk-high' },
    { value: 'medium', label: 'Medium', count: resources.filter((r) => r.riskLevel === 'medium').length, color: 'bg-risk-medium' },
    { value: 'low', label: 'Low', count: resources.filter((r) => r.riskLevel === 'low').length, color: 'bg-risk-low' },
    { value: 'safe', label: 'Safe', count: resources.filter((r) => r.riskLevel === 'safe').length, color: 'bg-risk-safe' },
  ];

  const hasFilters = actionFilter !== 'all' || riskFilter !== 'all' || search !== '';

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass-card p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources by address or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background/50 border-border/50 font-mono text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      {/* Filter buttons */}
      <div className="flex flex-col gap-3">
        {/* Action filters */}
        <div className="flex items-start sm:items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground uppercase">Action:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {actionOptions.filter(o => o.count > 0 || o.value === 'all').map((option) => (
              <button
                key={option.value}
                onClick={() => setActionFilter(option.value)}
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap',
                  actionFilter === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {option.label}
                <span className="ml-1 opacity-70">({option.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Risk filters */}
        <div className="flex items-start sm:items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground uppercase shrink-0">Risk:</span>
          <div className="flex flex-wrap gap-1">
            {riskOptions.filter(o => o.count > 0 || o.value === 'all').map((option) => (
              <button
                key={option.value}
                onClick={() => setRiskFilter(option.value)}
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 whitespace-nowrap',
                  riskFilter === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {option.value !== 'all' && (
                  <span className={cn('w-2 h-2 rounded-full', option.color)} />
                )}
                {option.label}
                <span className="opacity-70">({option.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => {
              setSearch('');
              setActionFilter('all');
              setRiskFilter('all');
            }}
            className="text-xs text-primary hover:underline self-start"
          >
            Clear filters
          </button>
        )}
      </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredResources.length} of {resources.length} resources
        </span>
        {hasFilters && filteredResources.length !== resources.length && (
          <span className="text-xs">Filtered</span>
        )}
      </div>

      {/* Resource list */}
      <div className="space-y-3">
        {filteredResources.map((resource) => (
          <ResourceCard key={resource.address} resource={resource} />
        ))}
        {filteredResources.length === 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No resources match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
