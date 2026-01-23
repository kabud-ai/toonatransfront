import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import EmptyBox from '@/components/illustrations/EmptyBox';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className,
  showIllustration = false
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center",
      className
    )}>
      {showIllustration ? (
        <div className="w-48 h-48 mb-6 opacity-60">
          <EmptyBox />
        </div>
      ) : Icon ? (
        <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-slate-400" />
        </div>
      ) : null}
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action} className="bg-sky-500 hover:bg-sky-600">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}