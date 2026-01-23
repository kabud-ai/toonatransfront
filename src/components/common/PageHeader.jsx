import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PageHeader({ 
  title, 
  description, 
  actions,
  breadcrumbs,
  icon: Icon,
  className 
}) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumbs && (
        <nav className="text-sm text-slate-500 mb-2">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx}>
              {idx > 0 && <span className="mx-2">/</span>}
              <span className={idx === breadcrumbs.length - 1 ? "text-slate-900 dark:text-slate-100" : "hover:text-slate-700 cursor-pointer"}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <Icon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}