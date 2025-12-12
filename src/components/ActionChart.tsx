import { PlanAnalysis } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ActionChartProps {
  analysis: PlanAnalysis;
}

const COLORS = {
  create: 'hsl(160, 60%, 45%)',
  update: 'hsl(45, 65%, 55%)',
  delete: 'hsl(0, 60%, 50%)',
  replace: 'hsl(30, 65%, 50%)',
  'no-op': 'hsl(180, 15%, 35%)',
  read: 'hsl(175, 50%, 45%)',
};

export function ActionChart({ analysis }: ActionChartProps) {
  const data = [
    { name: 'Create', value: analysis.creates, color: COLORS.create },
    { name: 'Update', value: analysis.updates, color: COLORS.update },
    { name: 'Delete', value: analysis.deletes, color: COLORS.delete },
    { name: 'Replace', value: analysis.replaces, color: COLORS.replace },
    { name: 'No-op', value: analysis.noops, color: COLORS['no-op'] },
    { name: 'Read', value: analysis.reads, color: COLORS.read },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-48">
        <p className="text-muted-foreground text-sm">No resource changes</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 flex flex-col h-full">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Actions Distribution
      </h3>
      <div className="flex-1 flex items-center justify-center min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                      <p className="text-sm font-medium" style={{ color: data.color }}>
                        {data.name}: {data.value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">
              {entry.name} ({entry.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
