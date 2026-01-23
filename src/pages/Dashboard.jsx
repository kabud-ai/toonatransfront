
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  LayoutDashboard,
  Factory,
  Package,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ArrowRight,
  Wrench,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  Timer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import KPIDashboard from '@/components/kpis/KPIDashboard';
import GanttChart from '@/components/planning/GanttChart';
import ProductionFlow from '@/components/illustrations/ProductionFlow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Dashboard() {
  const { data: manufacturingOrders = [] } = useQuery({
    queryKey: ['manufacturingOrders'],
    queryFn: () => base44.entities.ManufacturingOrder.list('-created_date', 50)
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels'],
    queryFn: () => base44.entities.StockLevel.list('-updated_date', 100)
  });

  const { data: qualityInspections = [] } = useQuery({
    queryKey: ['qualityInspections'],
    queryFn: () => base44.entities.QualityInspection.list('-created_date', 20)
  });

  const { data: maintenanceOrders = [] } = useQuery({
    queryKey: ['maintenanceOrders'],
    queryFn: () => base44.entities.MaintenanceOrder.list('-created_date', 20)
  });

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: () => base44.entities.PurchaseOrder.list('-created_date', 20)
  });

  // Calculate stats
  const activeOrders = manufacturingOrders.filter(o => ['in_progress', 'planned', 'confirmed'].includes(o.status)).length;
  const completedToday = manufacturingOrders.filter(o => 
    o.status === 'completed' && 
    o.actual_end_date && 
    new Date(o.actual_end_date).toDateString() === new Date().toDateString()
  ).length;
  
  const lowStockItems = stockLevels.filter(s => s.quantity < 10).length;
  const totalStockValue = stockLevels.reduce((sum, s) => sum + (s.total_value || 0), 0);
  
  const pendingInspections = qualityInspections.filter(q => q.status === 'pending').length;
  const passRate = qualityInspections.length > 0 
    ? Math.round((qualityInspections.filter(q => q.status === 'passed').length / qualityInspections.length) * 100)
    : 0;

  const scheduledMaintenance = maintenanceOrders.filter(m => m.status === 'scheduled').length;
  const pendingPurchases = purchaseOrders.filter(p => ['draft', 'sent'].includes(p.status)).length;

  // Chart data
  const productionData = [
    { name: 'Mon', planned: 45, actual: 42 },
    { name: 'Tue', planned: 52, actual: 48 },
    { name: 'Wed', planned: 48, actual: 51 },
    { name: 'Thu', planned: 61, actual: 58 },
    { name: 'Fri', planned: 55, actual: 52 },
    { name: 'Sat', planned: 30, actual: 28 },
    { name: 'Sun', planned: 20, actual: 22 },
  ];

  const orderStatusData = [
    { name: 'Completed', value: manufacturingOrders.filter(o => o.status === 'completed').length, color: '#22c55e' },
    { name: 'In Progress', value: manufacturingOrders.filter(o => o.status === 'in_progress').length, color: '#f59e0b' },
    { name: 'Planned', value: manufacturingOrders.filter(o => o.status === 'planned').length, color: '#8b5cf6' },
    { name: 'Draft', value: manufacturingOrders.filter(o => o.status === 'draft').length, color: '#94a3b8' },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Background illustration */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-5 dark:opacity-[0.03] pointer-events-none">
        <ProductionFlow />
      </div>

      <PageHeader
        title="Dashboard"
        description="Overview of your production operations"
        icon={LayoutDashboard}
        actions={
          <Button className="bg-sky-500 hover:bg-sky-600">
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(), 'MMM d, yyyy')}
          </Button>
        }
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kpis">KPIs & Analytics</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Orders"
              value={activeOrders}
              subtitle={`${completedToday} completed today`}
              icon={Factory}
              trend="up"
              trendValue="+12%"
              trendLabel="vs last week"
              color="sky"
            />
            <StatCard
              title="Stock Value"
              value={`$${totalStockValue.toLocaleString()}`}
              subtitle={`${lowStockItems} items low`}
              icon={Package}
              trend={lowStockItems > 5 ? 'down' : 'up'}
              trendValue={lowStockItems > 5 ? `${lowStockItems} alerts` : 'Healthy'}
              color={lowStockItems > 5 ? 'amber' : 'green'}
            />
            <StatCard
              title="Quality Rate"
              value={`${passRate}%`}
              subtitle={`${pendingInspections} pending`}
              icon={ClipboardCheck}
              trend={passRate >= 95 ? 'up' : passRate >= 85 ? undefined : 'down'}
              trendValue={passRate >= 95 ? 'Excellent' : passRate >= 85 ? 'Good' : 'Needs attention'}
              color={passRate >= 95 ? 'green' : passRate >= 85 ? 'amber' : 'red'}
            />
            <StatCard
              title="Maintenance"
              value={scheduledMaintenance}
              subtitle="Scheduled this week"
              icon={Wrench}
              color="purple"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Production Chart */}
            <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Production Overview</CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-sky-500" />
                      <span className="text-slate-500">Planned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="text-slate-500">Actual</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productionData}>
                      <defs>
                        <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                      <Area type="monotone" dataKey="planned" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorPlanned)" />
                      <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} fill="url(#colorActual)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Order Status Pie */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {orderStatusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                      <span className="text-sm font-medium ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Recent Manufacturing Orders</CardTitle>
                  <Link to={createPageUrl('ManufacturingOrders')}>
                    <Button variant="ghost" size="sm" className="text-sky-600 hover:text-sky-700">
                      View all <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {manufacturingOrders.slice(0, 5).map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                        <Factory className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{order.order_number}</p>
                        <p className="text-sm text-slate-500">{order.product_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{order.quantity} units</p>
                        <p className="text-xs text-slate-500">
                          {order.planned_start_date && format(new Date(order.planned_start_date), 'MMM d')}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
                {manufacturingOrders.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No manufacturing orders yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alerts & Actions */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Alerts & Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lowStockItems > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50">
                    <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-amber-900 dark:text-amber-300">Low Stock Alert</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400">{lowStockItems} items below minimum level</p>
                    </div>
                    <Link to={createPageUrl('Inventory')}>
                      <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                        Review
                      </Button>
                    </Link>
                  </div>
                )}

                {pendingInspections > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-900/50">
                    <div className="h-10 w-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                      <ClipboardCheck className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-cyan-900 dark:text-cyan-300">Pending Inspections</p>
                      <p className="text-sm text-cyan-700 dark:text-cyan-400">{pendingInspections} quality checks waiting</p>
                    </div>
                    <Link to={createPageUrl('QualityInspections')}>
                      <Button size="sm" variant="outline" className="border-cyan-300 text-cyan-700 hover:bg-cyan-100">
                        Inspect
                      </Button>
                    </Link>
                  </div>
                )}

                {scheduledMaintenance > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/50">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-purple-900 dark:text-purple-300">Scheduled Maintenance</p>
                      <p className="text-sm text-purple-700 dark:text-purple-400">{scheduledMaintenance} equipment due</p>
                    </div>
                    <Link to={createPageUrl('MaintenanceOrders')}>
                      <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                        View
                      </Button>
                    </Link>
                  </div>
                )}

                {pendingPurchases > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 dark:text-blue-300">Pending Purchases</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">{pendingPurchases} orders awaiting</p>
                    </div>
                    <Link to={createPageUrl('PurchaseOrders')}>
                      <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                        Review
                      </Button>
                    </Link>
                  </div>
                )}

                {lowStockItems === 0 && pendingInspections === 0 && scheduledMaintenance === 0 && pendingPurchases === 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50">
                    <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-300">All Clear</p>
                      <p className="text-sm text-green-700 dark:text-green-400">No pending alerts or actions</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <KPIDashboard />
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <GanttChart 
            data={manufacturingOrders.filter(o => o.status !== 'cancelled')}
            dateField="planned_start_date"
            endDateField="planned_end_date"
            labelField="order_number"
            statusField="status"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
