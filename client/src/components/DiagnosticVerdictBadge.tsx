import { cn } from '../utils/cn';
import { AlertCircle, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface DiagnosticVerdictBadgeProps {
  severity: 'low' | 'moderate' | 'high' | 'critical';
  className?: string;
}

export function DiagnosticVerdictBadge({ severity, className }: DiagnosticVerdictBadgeProps) {
  const config = {
    low: {
      color: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      icon: CheckCircle2,
      label: 'Low Severity',
    },
    moderate: {
      color: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
      icon: AlertCircle,
      label: 'Moderate Severity',
    },
    high: {
      color: 'bg-orange-50 text-orange-700 ring-orange-600/20',
      icon: AlertTriangle,
      label: 'High Severity',
    },
    critical: {
      color: 'bg-red-50 text-red-700 ring-red-600/20',
      icon: ShieldAlert,
      label: 'Critical Severity',
    },
  };

  const current = config[severity];
  const Icon = current.icon;

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium ring-1 ring-inset", current.color, className)}>
      <Icon className="h-4 w-4" />
      {current.label}
    </span>
  );
}
