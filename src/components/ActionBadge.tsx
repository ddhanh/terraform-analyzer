import { ActionType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2, RefreshCw, Eye, Minus } from 'lucide-react';

interface ActionBadgeProps {
  action: ActionType;
  className?: string;
}

const actionConfig: Record<ActionType, { label: string; icon: React.ReactNode; className: string }> = {
  create: {
    label: 'CREATE',
    icon: <Plus className="w-3 h-3" />,
    className: 'bg-action-create/20 text-action-create border-action-create/50',
  },
  update: {
    label: 'UPDATE',
    icon: <Pencil className="w-3 h-3" />,
    className: 'bg-action-update/20 text-action-update border-action-update/50',
  },
  delete: {
    label: 'DELETE',
    icon: <Trash2 className="w-3 h-3" />,
    className: 'bg-action-delete/20 text-action-delete border-action-delete/50',
  },
  replace: {
    label: 'REPLACE',
    icon: <RefreshCw className="w-3 h-3" />,
    className: 'bg-action-replace/20 text-action-replace border-action-replace/50',
  },
  read: {
    label: 'READ',
    icon: <Eye className="w-3 h-3" />,
    className: 'bg-action-read/20 text-action-read border-action-read/50',
  },
  'no-op': {
    label: 'NO-OP',
    icon: <Minus className="w-3 h-3" />,
    className: 'bg-action-noop/20 text-action-noop border-action-noop/50',
  },
};

export function ActionBadge({ action, className }: ActionBadgeProps) {
  const config = actionConfig[action];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold font-mono border',
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
