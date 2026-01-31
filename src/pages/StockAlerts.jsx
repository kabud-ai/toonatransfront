import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatCard from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  Settings, 
  Package,
  TrendingDown,
  TrendingUp,
  Edit
} from 'lucide-react';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function StockAlerts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const { data: stockLevels = [], isLoading } = useQuery({
    queryKey: ['stockLevels'],
    queryFn: () => base44.entities.StockLevel.list('-updated_date', 200)
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const updateStockLevel = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StockLevel.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      setDialogOpen(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      min_stock_alert: parseFloat(formData.get('min_stock_alert')),
      max_stock_alert: parseFloat(formData.get('max_stock_alert')) || null,
      reorder_point: parseFloat(formData.get('reorder_point')) || null,
      reorder_quantity: parseFloat(formData.get('reorder_quantity')) || null
    };

    updateStockLevel.mutate({ id: selectedLevel.id, data });
  };

  // Calculate alerts
  const lowStockItems = stockLevels.filter(s => 
    s.quantity < (s.min_stock_alert || 10)
  ).length;

  const criticalItems = stockLevels.filter(s => 
    s.quantity <= (s.min_stock_alert || 10) * 0.5
  ).length;

  const reorderItems = stockLevels.filter(s => 
    s.reorder_point && s.quantity <= s.reorder_point
  ).length;

  const overStockItems = stockLevels.filter(s => 
    s.max_stock_alert && s.quantity > s.max_stock_alert
  ).length;

  const alertsData = stockLevels.map(level => {
    const minAlert = level.min_stock_alert || 10;
    const isCritical = level.quantity <= minAlert * 0.5;
    const isLow = level.quantity < minAlert && !isCritical;
    const needsReorder = level.reorder_point && level.quantity <= level.reorder_point;
    const isOverStock = level.max_stock_alert && level.quantity > level.max_stock_alert;

    return {
      ...level,
      alertType: isCritical ? 'critical' : isLow ? 'low' : needsReorder ? 'reorder' : isOverStock ? 'overstock' : null,
      alertLevel: isCritical ? 3 : isLow ? 2 : needsReorder ? 2 : isOverStock ? 1 : 0
    };
  }).filter(item => item.alertType).sort((a, b) => b.alertLevel - a.alertLevel);

  const columns = [
    {
      key: 'product_sku',
      label: 'SKU',
      render: (value) => (
        <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'product_name',
      label: t('common.product'),
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-slate-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'warehouse_name',
      label: t('common.warehouse'),
      render: (value) => value || '-'
    },
    {
      key: 'quantity',
      label: t('common.quantity'),
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className={row.alertType === 'critical' ? 'text-red-600 font-bold' : 
                          row.alertType === 'low' ? 'text-amber-600 font-medium' : ''}>
            {value?.toLocaleString()}
          </span>
        </div>
      )
    },
    {
      key: 'min_stock_alert',
      label: t('stockAlerts.minStock') || 'Seuil Min',
      render: (value) => value || 10
    },
    {
      key: 'reorder_point',
      label: t('stockAlerts.reorderPoint') || 'Point de réappro',
      render: (value) => value || '-'
    },
    {
      key: 'alertType',
      label: t('stockAlerts.alert') || 'Alerte',
      render: (value) => {
        const configs = {
          critical: { label: 'Critique', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
          low: { label: 'Bas', color: 'bg-amber-100 text-amber-700', icon: TrendingDown },
          reorder: { label: 'Réappro', color: 'bg-blue-100 text-blue-700', icon: TrendingDown },
          overstock: { label: 'Surstock', color: 'bg-purple-100 text-purple-700', icon: TrendingUp }
        };
        const config = configs[value];
        if (!config) return null;
        const Icon = config.icon;
        return (
          <Badge className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        );
      }
    }
  ];

  const actions = [
    { 
      label: t('stockAlerts.configureAlerts') || 'Configurer', 
      icon: Settings, 
      onClick: (row) => { setSelectedLevel(row); setDialogOpen(true); } 
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('stockAlerts.title') || 'Alertes de Stock'}
        description={t('stockAlerts.description') || 'Gérer les seuils d\'alerte de stock'}
        icon={AlertTriangle}
        breadcrumbs={[t('nav.inventory'), t('stockAlerts.title') || 'Alertes']}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('stockAlerts.criticalItems') || 'Critique'}
          value={criticalItems}
          icon={AlertTriangle}
          color={criticalItems > 0 ? 'red' : 'green'}
        />
        <StatCard
          title={t('stockAlerts.lowStockItems') || 'Stock Bas'}
          value={lowStockItems}
          icon={TrendingDown}
          color={lowStockItems > 0 ? 'amber' : 'green'}
        />
        <StatCard
          title={t('stockAlerts.reorderItems') || 'À réapprovisionner'}
          value={reorderItems}
          icon={Package}
          color={reorderItems > 0 ? 'blue' : 'green'}
        />
        <StatCard
          title={t('stockAlerts.overStockItems') || 'Surstock'}
          value={overStockItems}
          icon={TrendingUp}
          color={overStockItems > 0 ? 'purple' : 'green'}
        />
      </div>

      <DataTable
        columns={columns}
        data={alertsData}
        loading={isLoading}
        actions={actions}
        emptyMessage={t('stockAlerts.noAlerts') || 'Aucune alerte'}
        emptyIcon={Package}
      />

      {/* Configure Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('stockAlerts.configureAlerts') || 'Configurer les alertes'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLevel && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium">{selectedLevel.product_name}</p>
                <p className="text-xs text-slate-500">{selectedLevel.warehouse_name}</p>
                <p className="text-lg font-bold mt-2">
                  {t('stockAlerts.currentStock') || 'Stock actuel'}: {selectedLevel.quantity}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t('stockAlerts.minStock') || 'Seuil minimum'} *</Label>
                <Input 
                  name="min_stock_alert" 
                  type="number"
                  defaultValue={selectedLevel.min_stock_alert || 10}
                  required
                  min="0"
                />
                <p className="text-xs text-slate-500">
                  {t('stockAlerts.minStockDesc') || 'Alerte quand le stock passe sous ce seuil'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t('stockAlerts.maxStock') || 'Seuil maximum'}</Label>
                <Input 
                  name="max_stock_alert" 
                  type="number"
                  defaultValue={selectedLevel.max_stock_alert || ''}
                  min="0"
                />
                <p className="text-xs text-slate-500">
                  {t('stockAlerts.maxStockDesc') || 'Alerte en cas de surstock'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t('stockAlerts.reorderPoint') || 'Point de réapprovisionnement'}</Label>
                <Input 
                  name="reorder_point" 
                  type="number"
                  defaultValue={selectedLevel.reorder_point || ''}
                  min="0"
                />
                <p className="text-xs text-slate-500">
                  {t('stockAlerts.reorderPointDesc') || 'Déclenche une commande automatique'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t('stockAlerts.reorderQuantity') || 'Quantité de réapprovisionnement'}</Label>
                <Input 
                  name="reorder_quantity" 
                  type="number"
                  defaultValue={selectedLevel.reorder_quantity || ''}
                  min="0"
                />
                <p className="text-xs text-slate-500">
                  {t('stockAlerts.reorderQuantityDesc') || 'Quantité suggérée à commander'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  {t('common.save')}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}