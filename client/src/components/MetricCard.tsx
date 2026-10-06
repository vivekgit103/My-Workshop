import type { LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  status?: 'optimal' | 'warning' | 'danger' | 'neutral';
  description?: string;
}

export function MetricCard({ title, value, unit, icon: Icon, status = 'neutral', description }: MetricCardProps) {
  const statusStyles = {
    optimal: 'bg-green-50 text-green-700 ring-green-600/20',
    warning: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    danger: 'bg-red-50 text-red-700 ring-red-600/10',
    neutral: 'bg-slate-50 text-slate-700 ring-slate-500/10',
  };

  const iconStyles = {
    optimal: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500',
    neutral: 'text-slate-400',
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-slate-200 sm:p-6 transition-all hover:shadow-md">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={cn("h-8 w-8", iconStyles[status])} aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dt className="truncate text-sm font-medium text-slate-500">{title}</dt>
          <dd className="mt-1 flex items-baseline">
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            {unit && <span className="ml-1 text-sm font-medium text-slate-500">{unit}</span>}
          </dd>
        </div>
      </div>
      
      {(status !== 'neutral' || description) && (
        <div className="mt-4">
          <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset", statusStyles[status])}>
            {description || status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      )}
    </div>
  );
}
