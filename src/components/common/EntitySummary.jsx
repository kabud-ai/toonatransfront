import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function EntitySummary({ stats = [] }) {
  const getColorClass = (color) => {
    const colors = {
      sky: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    };
    return colors[color] || colors.slate;
  };

  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={idx}
            className="p-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  getColorClass(stat.color)
                )}>
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {stat.label}
                </p>
                <p className={cn(
                  "text-lg font-semibold mt-0.5",
                  stat.highlight ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-slate-100"
                )}>
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}