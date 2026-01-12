import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Calendar,
  Factory,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Package
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

export default function ProductionPlanning() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const { data: orders = [] } = useQuery({
    queryKey: ['manufacturingOrders'],
    queryFn: () => base44.entities.ManufacturingOrder.list('-planned_start_date', 100)
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: boms = [] } = useQuery({
    queryKey: ['boms'],
    queryFn: () => base44.entities.BillOfMaterials.list()
  });

  // Calculate capacity and statistics
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  
  const ordersThisWeek = orders.filter(o => {
    if (!o.planned_start_date) return false;
    const orderDate = new Date(o.planned_start_date);
    return orderDate >= weekStart && orderDate <= weekEnd;
  });

  const plannedOrders = orders.filter(o => o.status === 'planned').length;
  const inProgressOrders = orders.filter(o => o.status === 'in_progress').length;
  const totalCapacity = ordersThisWeek.reduce((sum, o) => sum + (o.quantity || 0), 0);
  const completedCapacity = ordersThisWeek
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.quantity || 0), 0);

  // Group orders by day
  const ordersByDay = {};
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const dayKey = format(day, 'yyyy-MM-dd');
    ordersByDay[dayKey] = ordersThisWeek.filter(o => 
      o.planned_start_date && format(new Date(o.planned_start_date), 'yyyy-MM-dd') === dayKey
    );
  }

  // Calculate material requirements
  const getMaterialRequirements = () => {
    const requirements = {};
    ordersThisWeek.forEach(order => {
      const bom = boms.find(b => b.product_id === order.product_id);
      if (bom?.components) {
        bom.components.forEach(comp => {
          const key = comp.product_id;
          if (!requirements[key]) {
            requirements[key] = {
              product_name: comp.product_name,
              required: 0,
              unit: comp.unit
            };
          }
          requirements[key].required += comp.quantity * order.quantity;
        });
      }
    });
    return Object.values(requirements);
  };

  const materialRequirements = getMaterialRequirements();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Planning"
        description="Plan and optimize production schedules"
        icon={BarChart3}
        breadcrumbs={['Production', 'Planning']}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}>
              ← Previous Week
            </Button>
            <Button variant="outline" onClick={() => setSelectedWeek(new Date())}>
              This Week
            </Button>
            <Button variant="outline" onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}>
              Next Week →
            </Button>
          </div>
        }
      />

      {/* Week Display */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Planning Week</p>
              <p className="text-2xl font-bold mt-1">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </p>
            </div>
            <Calendar className="h-12 w-12 opacity-80" />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Orders This Week"
          value={ordersThisWeek.length}
          icon={Factory}
          color="indigo"
        />
        <StatCard
          title="Planned"
          value={plannedOrders}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={inProgressOrders}
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Capacity Used"
          value={`${Math.round((completedCapacity / (totalCapacity || 1)) * 100)}%`}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Production Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(ordersByDay).map(([dayKey, dayOrders]) => {
              const day = new Date(dayKey);
              const isToday = format(new Date(), 'yyyy-MM-dd') === dayKey;
              
              return (
                <div 
                  key={dayKey}
                  className={`border rounded-lg p-4 ${isToday ? 'border-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{format(day, 'EEEE')}</p>
                      <p className="text-sm text-slate-500">{format(day, 'MMM d, yyyy')}</p>
                    </div>
                    <Badge variant="outline" className="font-medium">
                      {dayOrders.length} orders
                    </Badge>
                  </div>
                  
                  {dayOrders.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No orders scheduled</p>
                  ) : (
                    <div className="space-y-2">
                      {dayOrders.map((order) => (
                        <div 
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                              <Factory className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{order.order_number}</p>
                              <p className="text-xs text-slate-500">{order.product_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{order.quantity} units</span>
                            <StatusBadge status={order.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Material Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Material Requirements (This Week)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {materialRequirements.length === 0 ? (
            <p className="text-sm text-slate-500">No material requirements for scheduled orders</p>
          ) : (
            <div className="space-y-3">
              {materialRequirements.slice(0, 10).map((req, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="font-medium text-sm">{req.product_name}</span>
                  </div>
                  <Badge variant="outline" className="font-medium">
                    {req.required.toFixed(2)} {req.unit}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capacity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Capacity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(ordersByDay).map(([dayKey, dayOrders]) => {
              const day = new Date(dayKey);
              const dayCapacity = dayOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
              const maxCapacity = 1000; // Example max capacity per day
              const percentage = (dayCapacity / maxCapacity) * 100;
              
              return (
                <div key={dayKey}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{format(day, 'EEE, MMM d')}</span>
                    <span className="text-sm text-slate-500">{dayCapacity} / {maxCapacity} units</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}