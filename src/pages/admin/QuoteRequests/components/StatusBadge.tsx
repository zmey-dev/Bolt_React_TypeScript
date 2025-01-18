import React from 'react';
import { Clock, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20'
} as const;

const STATUS_ICONS = {
  pending: Clock,
  in_progress: MoreHorizontal,
  completed: CheckCircle,
  rejected: XCircle
} as const;

interface StatusBadgeProps {
  status: keyof typeof STATUS_COLORS;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const Icon = STATUS_ICONS[status];
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${STATUS_COLORS[status]}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
    </div>
  );
}