import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Factory, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/components/i18n/LanguageContext';
import StatusBadge from '@/components/common/StatusBadge';

// Widget: Manufacturing Orders In Progress
export function ManufacturingOrdersWidget() {
  const { t } = useTranslation();
  const [data, setData] = useState({ inProgress: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const orders = await base44.entities.ManufacturingOrder.list();
      const inProgress = orders.filter(o => o.status === 'in_progress').length;
      setData({ inProgress, total: orders.length });
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t('dashboard.widgets.manufacturing_orders')}</CardTitle>
        <Factory className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '...' : data.inProgress}</div>
        <p className="text-xs text-muted-foreground">{t('dashboard.widgets.in_progress')} / {data.total} {t('common.total')}</p>
      </CardContent>
    </Card>
  );
}

// Widget: Low Stock Alerts
export function LowStockWidget() {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const stockLevels = await base44.entities.StockLevel.list();
      const lowStock = stockLevels.filter(s => s.quantity <= s.min_stock_alert).length;
      setCount(lowStock);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t('dashboard.widgets.low_stock')}</CardTitle>
        <AlertTriangle className="h-4 w-4 text-orange-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-600">{loading ? '...' : count}</div>
        <p className="text-xs text-muted-foreground">{t('dashboard.widgets.products_below_min')}</p>
      </CardContent>
    </Card>
  );
}

// Widget: Pending Purchase Orders
export function PendingPurchaseOrdersWidget() {
  const { t } = useTranslation();
  const [data, setData] = useState({ pending: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const orders = await base44.entities.PurchaseOrder.list();
      const pending = orders.filter(o => o.status === 'pending').length;
      setData({ pending, total: orders.length });
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t('dashboard.widgets.pending_po')}</CardTitle>
        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '...' : data.pending}</div>
        <p className="text-xs text-muted-foreground">{t('dashboard.widgets.awaiting_approval')} / {data.total} {t('common.total')}</p>
      </CardContent>
    </Card>
  );
}

// Widget: Recent Manufacturing Orders List
export function RecentManufacturingOrdersWidget() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await base44.entities.ManufacturingOrder.list('-created_date', 5);
      setOrders(data);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t('dashboard.widgets.recent_manufacturing')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('common.no_data')}</p>
        ) : (
          <div className="space-y-2">
            {orders.map(order => (
              <div key={order.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium text-sm">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">{order.product_name}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Widget: Production Lead Time
export function ProductionLeadTimeWidget() {
  const { t } = useTranslation();
  const [avgDays, setAvgDays] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const orders = await base44.entities.ManufacturingOrder.filter({ status: 'completed' });
      if (orders.length > 0) {
        const totalDays = orders.reduce((sum, order) => {
          if (order.started_at && order.completed_at) {
            const start = new Date(order.started_at);
            const end = new Date(order.completed_at);
            const days = (end - start) / (1000 * 60 * 60 * 24);
            return sum + days;
          }
          return sum;
        }, 0);
        setAvgDays(Math.round(totalDays / orders.length * 10) / 10);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t('dashboard.widgets.avg_lead_time')}</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '...' : avgDays}</div>
        <p className="text-xs text-muted-foreground">{t('dashboard.widgets.days_average')}</p>
      </CardContent>
    </Card>
  );
}

// Widget: Quality Inspections Summary
export function QualityInspectionsWidget() {
  const { t } = useTranslation();
  const [data, setData] = useState({ passed: 0, failed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const inspections = await base44.entities.QualityInspection.list();
      const passed = inspections.filter(i => i.status === 'passed').length;
      const failed = inspections.filter(i => i.status === 'failed').length;
      const pending = inspections.filter(i => i.status === 'pending').length;
      setData({ passed, failed, pending });
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t('dashboard.widgets.quality_inspections')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm">{t('common.loading')}...</p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {t('dashboard.widgets.passed')}
              </span>
              <span className="font-bold">{data.passed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                {t('dashboard.widgets.failed')}
              </span>
              <span className="font-bold">{data.failed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                {t('dashboard.widgets.pending')}
              </span>
              <span className="font-bold">{data.pending}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Widget: Inventory Value
export function InventoryValueWidget() {
  const { t } = useTranslation();
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const stockLevels = await base44.entities.StockLevel.list();
      const total = stockLevels.reduce((sum, stock) => sum + (stock.total_value || 0), 0);
      setValue(total);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t('dashboard.widgets.inventory_value')}</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '...' : `$${value.toLocaleString()}`}</div>
        <p className="text-xs text-muted-foreground">{t('dashboard.widgets.total_stock_value')}</p>
      </CardContent>
    </Card>
  );
}

// Widget: Replenishment Suggestions
export function ReplenishmentWidget() {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const suggestions = await base44.entities.ReplenishmentSuggestion.filter({ status: 'pending' });
      setCount(suggestions.length);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t('dashboard.widgets.replenishment')}</CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '...' : count}</div>
        <p className="text-xs text-muted-foreground">{t('dashboard.widgets.pending_suggestions')}</p>
      </CardContent>
    </Card>
  );
}

// Widget Catalog - Available widgets with metadata
export const WIDGET_CATALOG = [
  {
    id: 'manufacturing_orders',
    component: ManufacturingOrdersWidget,
    title: 'dashboard.widgets.manufacturing_orders',
    description: 'dashboard.widgets.manufacturing_orders_desc',
    roles: ['production_manager', 'director'],
    defaultSize: 'small'
  },
  {
    id: 'low_stock',
    component: LowStockWidget,
    title: 'dashboard.widgets.low_stock',
    description: 'dashboard.widgets.low_stock_desc',
    roles: ['inventory_manager', 'buyer', 'director'],
    defaultSize: 'small'
  },
  {
    id: 'pending_po',
    component: PendingPurchaseOrdersWidget,
    title: 'dashboard.widgets.pending_po',
    description: 'dashboard.widgets.pending_po_desc',
    roles: ['buyer', 'director'],
    defaultSize: 'small'
  },
  {
    id: 'recent_manufacturing',
    component: RecentManufacturingOrdersWidget,
    title: 'dashboard.widgets.recent_manufacturing',
    description: 'dashboard.widgets.recent_manufacturing_desc',
    roles: ['production_manager', 'director'],
    defaultSize: 'large'
  },
  {
    id: 'lead_time',
    component: ProductionLeadTimeWidget,
    title: 'dashboard.widgets.avg_lead_time',
    description: 'dashboard.widgets.lead_time_desc',
    roles: ['production_manager', 'director'],
    defaultSize: 'small'
  },
  {
    id: 'quality',
    component: QualityInspectionsWidget,
    title: 'dashboard.widgets.quality_inspections',
    description: 'dashboard.widgets.quality_desc',
    roles: ['quality_manager', 'director'],
    defaultSize: 'medium'
  },
  {
    id: 'inventory_value',
    component: InventoryValueWidget,
    title: 'dashboard.widgets.inventory_value',
    description: 'dashboard.widgets.inventory_value_desc',
    roles: ['inventory_manager', 'director'],
    defaultSize: 'small'
  },
  {
    id: 'replenishment',
    component: ReplenishmentWidget,
    title: 'dashboard.widgets.replenishment',
    description: 'dashboard.widgets.replenishment_desc',
    roles: ['buyer', 'inventory_manager', 'director'],
    defaultSize: 'small'
  }
];