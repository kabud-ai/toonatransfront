import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek } from 'date-fns';
import StatusBadge from '@/components/common/StatusBadge';

export default function GanttChart({ 
  data = [], 
  dateField = 'planned_start_date',
  endDateField = 'planned_end_date',
  labelField = 'order_number',
  statusField = 'status',
  onTaskClick
}) {
  const timeline = useMemo(() => {
    if (data.length === 0) return { start: new Date(), end: addDays(new Date(), 30), days: 30 };

    const dates = data
      .map(item => [new Date(item[dateField]), new Date(item[endDateField] || item[dateField])])
      .flat()
      .filter(d => !isNaN(d));

    const start = startOfWeek(new Date(Math.min(...dates)));
    const end = endOfWeek(new Date(Math.max(...dates)));
    const days = differenceInDays(end, start) + 1;

    return { start, end, days };
  }, [data, dateField, endDateField]);

  const getTaskPosition = (task) => {
    const taskStart = new Date(task[dateField]);
    const taskEnd = new Date(task[endDateField] || task[dateField]);
    
    const startOffset = differenceInDays(taskStart, timeline.start);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    const leftPercent = (startOffset / timeline.days) * 100;
    const widthPercent = (duration / timeline.days) * 100;

    return { left: `${leftPercent}%`, width: `${Math.max(widthPercent, 2)}%` };
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-slate-400',
      confirmed: 'bg-blue-500',
      planned: 'bg-purple-500',
      in_progress: 'bg-amber-500',
      quality_check: 'bg-cyan-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-slate-400';
  };

  // Generate timeline dates
  const timelineDates = [];
  for (let i = 0; i < timeline.days; i++) {
    timelineDates.push(addDays(timeline.start, i));
  }

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Timeline header */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
            <div className="w-48 flex-shrink-0 pr-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Task</span>
            </div>
            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${timeline.days}, 1fr)` }}>
              {timelineDates.map((date, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "text-center border-l border-slate-100 dark:border-slate-800 px-1",
                    idx === 0 && "border-l-0"
                  )}
                >
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {format(date, 'MMM d')}
                  </div>
                  <div className="text-xs text-slate-400">
                    {format(date, 'EEE')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            {data.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No tasks to display
              </div>
            ) : (
              data.map((task, idx) => {
                const position = getTaskPosition(task);
                return (
                  <div key={task.id || idx} className="flex items-center group">
                    <div className="w-48 flex-shrink-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {task[labelField]}
                        </span>
                        {task[statusField] && (
                          <StatusBadge status={task[statusField]} size="sm" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {task.product_name || task.equipment_name || ''}
                      </span>
                    </div>
                    
                    <div className="flex-1 relative h-10" style={{ gridTemplateColumns: `repeat(${timeline.days}, 1fr)` }}>
                      {/* Grid lines */}
                      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${timeline.days}, 1fr)` }}>
                        {timelineDates.map((_, idx) => (
                          <div 
                            key={idx}
                            className="border-l border-slate-100 dark:border-slate-800"
                          />
                        ))}
                      </div>
                      
                      {/* Task bar */}
                      <div
                        className={cn(
                          "absolute h-6 rounded-md flex items-center px-2 cursor-pointer transition-all",
                          "hover:shadow-md hover:scale-105 top-2",
                          getStatusColor(task[statusField])
                        )}
                        style={position}
                        onClick={() => onTaskClick?.(task)}
                      >
                        <span className="text-xs font-medium text-white truncate">
                          {task.quantity && `${task.quantity} units`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Status:</span>
            {['planned', 'in_progress', 'completed'].map(status => (
              <div key={status} className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded", getStatusColor(status))} />
                <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                  {status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}