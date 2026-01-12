import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfigs = {
  // Manufacturing statuses
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  planned: { label: 'Planned', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  quality_check: { label: 'Quality Check', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  
  // Quality statuses
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  passed: { label: 'Passed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  conditional: { label: 'Conditional', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  
  // Purchase statuses
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  partial: { label: 'Partial', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  received: { label: 'Received', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  
  // Maintenance statuses
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  waiting_parts: { label: 'Waiting Parts', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  
  // Equipment statuses
  operational: { label: 'Operational', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  maintenance: { label: 'Maintenance', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  repair: { label: 'Repair', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  offline: { label: 'Offline', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  retired: { label: 'Retired', color: 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500' },
  
  // BOM statuses
  active: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  obsolete: { label: 'Obsolete', color: 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500' },
  
  // Priority
  low: { label: 'Low', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function StatusBadge({ status, customLabel, className }) {
  const config = statusConfigs[status] || { 
    label: status?.replace(/_/g, ' ') || 'Unknown', 
    color: 'bg-slate-100 text-slate-700' 
  };

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "font-medium capitalize border-0",
        config.color,
        className
      )}
    >
      {customLabel || config.label}
    </Badge>
  );
}