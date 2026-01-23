import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/common/StatCard';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Clock,
  Zap,
  AlertCircle,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function KPIDashboard() {
  const { data: manufacturingOrders = [] } = useQuery({
    queryKey: ['manufacturingOrders'],
    queryFn: () => base44.entities.ManufacturingOrder.list()
  });

  const { data: qualityInspections = [] } = useQuery({
    queryKey: ['qualityInspections'],
    queryFn: () => base44.entities.QualityInspection.list()
  });

  // Calculate OEE (Overall Equipment Effectiveness)
  const calculateOEE = () => {
    const completed = manufacturingOrders.filter(o => o.status === 'completed');
    if (completed.length === 0) return 0;

    const totalPlanned = completed.reduce((sum, o) => sum + (o.quantity || 0), 0);
    const totalProduced = completed.reduce((sum, o) => sum + (o.quantity_produced || 0), 0);
    const availability = 0.92; // Simulated - would come from equipment data
    const performance = totalProduced / totalPlanned;
    const quality = qualityInspections.filter(q => q.status === 'passed').length / Math.max(qualityInspections.length, 1);

    return Math.round(availability * performance * quality * 100);
  };

  // Calculate throughput
  const calculateThroughput = () => {
    const last30Days = manufacturingOrders.filter(o => {
      const date = new Date(o.actual_end_date || o.created_date);
      const daysAgo = (new Date() - date) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30 && o.status === 'completed';
    });
    
    const totalUnits = last30Days.reduce((sum, o) => sum + (o.quantity_produced || 0), 0);
    return Math.round(totalUnits / 30); // Units per day
  };

  // Calculate on-time delivery rate
  const calculateOnTimeRate = () => {
    const completed = manufacturingOrders.filter(o => o.status === 'completed' && o.planned_end_date && o.actual_end_date);
    if (completed.length === 0) return 100;

    const onTime = completed.filter(o => 
      new Date(o.actual_end_date) <= new Date(o.planned_end_date)
    ).length;

    return Math.round((onTime / completed.length) * 100);
  };

  // Calculate cost variance
  const calculateCostVariance = () => {
    const orders = manufacturingOrders.filter(o => o.estimated_cost && o.actual_cost);
    if (orders.length === 0) return 0;

    const totalEstimated = orders.reduce((sum, o) => sum + o.estimated_cost, 0);
    const totalActual = orders.reduce((sum, o) => sum + o.actual_cost, 0);
    const variance = ((totalActual - totalEstimated) / totalEstimated) * 100;

    return Math.round(variance);
  };

  // Defect rate
  const defectRate = qualityInspections.length > 0 
    ? Math.round((qualityInspections.filter(q => q.status === 'failed').length / qualityInspections.length) * 100)
    : 0;

  const oee = calculateOEE();
  const throughput = calculateThroughput();
  const onTimeRate = calculateOnTimeRate();
  const costVariance = calculateCostVariance();

  // Productivity by week
  const productivityData = [
    { week: 'W1', efficiency: 85, target: 90 },
    { week: 'W2', efficiency: 88, target: 90 },
    { week: 'W3', efficiency: 92, target: 90 },
    { week: 'W4', efficiency: 89, target: 90 },
  ];

  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="OEE (Overall Equipment Effectiveness)"
          value={`${oee}%`}
          subtitle="Target: 85%"
          icon={Zap}
          trend={oee >= 85 ? 'up' : 'down'}
          trendValue={oee >= 85 ? 'Above target' : 'Below target'}
          color={oee >= 85 ? 'green' : 'amber'}
        />
        <StatCard
          title="Throughput"
          value={`${throughput}`}
          subtitle="Units per day (30d avg)"
          icon={Activity}
          trend="up"
          trendValue="+8%"
          trendLabel="vs last month"
          color="sky"
        />
        <StatCard
          title="On-Time Delivery"
          value={`${onTimeRate}%`}
          subtitle="Completed orders"
          icon={Target}
          trend={onTimeRate >= 95 ? 'up' : 'down'}
          trendValue={onTimeRate >= 95 ? 'Excellent' : 'Needs improvement'}
          color={onTimeRate >= 95 ? 'green' : 'amber'}
        />
        <StatCard
          title="Cost Variance"
          value={`${costVariance > 0 ? '+' : ''}${costVariance}%`}
          subtitle="Actual vs Estimated"
          icon={DollarSign}
          trend={costVariance <= 0 ? 'up' : 'down'}
          trendValue={costVariance <= 0 ? 'Under budget' : 'Over budget'}
          color={Math.abs(costVariance) <= 5 ? 'green' : 'amber'}
        />
      </div>

      {/* Quality & Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Metrics */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Quality Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pass Rate</span>
                <span className="text-sm font-semibold text-green-600">
                  {100 - defectRate}%
                </span>
              </div>
              <Progress value={100 - defectRate} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Defect Rate</span>
                <span className="text-sm font-semibold text-red-600">{defectRate}%</span>
              </div>
              <Progress value={defectRate} className="h-2 [&>div]:bg-red-500" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">First Pass Yield</span>
                <span className="text-sm font-semibold text-sky-600">94%</span>
              </div>
              <Progress value={94} className="h-2 [&>div]:bg-sky-500" />
            </div>
          </CardContent>
        </Card>

        {/* Productivity Chart */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-600" />
              Weekly Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="efficiency" fill="#0ea5e9" radius={[8, 8, 0, 0]}>
                    {productivityData.map((entry, index) => (
                      <Cell key={index} fill={entry.efficiency >= entry.target ? '#10b981' : '#f59e0b'} />
                    ))}
                  </Bar>
                  <Bar dataKey="target" fill="#e2e8f0" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Cycle Time</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">4.2 hrs</p>
              <p className="text-xs text-green-600 mt-1">-12% vs target</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Downtime</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">2.8%</p>
              <p className="text-xs text-green-600 mt-1">Target: &lt;5%</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Scrap Rate</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">1.4%</p>
              <p className="text-xs text-green-600 mt-1">Below target</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}