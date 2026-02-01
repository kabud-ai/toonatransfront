import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatCard from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  RefreshCw, 
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function AutoReplenishment() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['replenishmentSuggestions'],
    queryFn: () => base44.entities.ReplenishmentSuggestion.list('-created_date', 200)
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels'],
    queryFn: () => base44.entities.StockLevel.list()
  });

  const { data: catalogItems = [] } = useQuery({
    queryKey: ['supplierCatalog'],
    queryFn: () => base44.entities.SupplierCatalog.list()
  });

  const updateSuggestion = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ReplenishmentSuggestion.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replenishmentSuggestions'] });
    }
  });

  const createPurchaseOrder = useMutation({
    mutationFn: (data) => base44.entities.PurchaseOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      toast.success(t('autoReplenishment.orderCreated') || 'Bon de commande créé');
    }
  });

  const generateSuggestions = async () => {
    setGenerating(true);
    try {
      // Find all stock levels that need replenishment
      const needsReplenishment = stockLevels.filter(level => {
        const minStock = level.min_stock_alert || 10;
        const reorderPoint = level.reorder_point || minStock;
        return level.quantity <= reorderPoint;
      });

      // Create suggestions
      for (const level of needsReplenishment) {
        // Find preferred supplier for this product
        const preferredCatalog = catalogItems.find(c => 
          c.product_id === level.product_id && c.is_preferred && c.is_active
        );
        
        const anyCatalog = catalogItems.find(c => 
          c.product_id === level.product_id && c.is_active
        );

        const catalog = preferredCatalog || anyCatalog;
        
        if (!catalog) continue;

        const minStock = level.min_stock_alert || 10;
        const reorderQty = level.reorder_quantity || minStock * 2;
        const suggestedQty = Math.max(reorderQty, catalog.min_order_quantity);

        const priority = level.quantity <= minStock * 0.5 ? 'critical' :
                        level.quantity <= minStock * 0.75 ? 'high' : 'medium';

        await base44.entities.ReplenishmentSuggestion.create({
          product_id: level.product_id,
          product_name: level.product_name,
          warehouse_id: level.warehouse_id,
          warehouse_name: level.warehouse_name,
          current_stock: level.quantity,
          min_stock: minStock,
          reorder_point: level.reorder_point || minStock,
          suggested_quantity: suggestedQty,
          suggested_supplier_id: catalog.supplier_id,
          suggested_supplier_name: catalog.supplier_name,
          estimated_cost: suggestedQty * catalog.unit_price,
          priority,
          status: 'pending',
          generated_at: new Date().toISOString()
        });
      }

      queryClient.invalidateQueries({ queryKey: ['replenishmentSuggestions'] });
      toast.success(t('autoReplenishment.suggestionsGenerated') || 'Suggestions générées');
    } catch (error) {
      toast.error(t('common.error') || 'Erreur');
    } finally {
      setGenerating(false);
    }
  };

  const approveSuggestion = async (suggestion) => {
    // Create purchase order
    const year = new Date().getFullYear();
    const orderNumber = `PO-${year}-AUTO-${Date.now().toString().slice(-4)}`;

    const poData = {
      order_number: orderNumber,
      supplier_id: suggestion.suggested_supplier_id,
      supplier_name: suggestion.suggested_supplier_name,
      warehouse_id: suggestion.warehouse_id,
      status: 'draft',
      order_date: new Date().toISOString().split('T')[0],
      lines: [{
        product_id: suggestion.product_id,
        product_name: suggestion.product_name,
        quantity: suggestion.suggested_quantity,
        quantity_received: 0,
        unit_price: suggestion.estimated_cost / suggestion.suggested_quantity,
        total: suggestion.estimated_cost
      }],
      subtotal: suggestion.estimated_cost,
      tax: suggestion.estimated_cost * 0.1,
      total: suggestion.estimated_cost * 1.1,
      notes: `Auto-generated from replenishment suggestion`
    };

    const po = await createPurchaseOrder.mutateAsync(poData);
    
    // Update suggestion
    updateSuggestion.mutate({
      id: suggestion.id,
      data: { 
        status: 'ordered',
        purchase_order_id: po.id
      }
    });
  };

  const rejectSuggestion = (suggestion) => {
    updateSuggestion.mutate({
      id: suggestion.id,
      data: { status: 'rejected' }
    });
  };

  // Stats
  const pendingSuggestions = suggestions.filter(s => s.status === 'pending').length;
  const criticalSuggestions = suggestions.filter(s => s.priority === 'critical' && s.status === 'pending').length;
  const approvedSuggestions = suggestions.filter(s => s.status === 'approved' || s.status === 'ordered').length;
  const totalEstimatedCost = suggestions.filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + (s.estimated_cost || 0), 0);

  const columns = [
    {
      key: 'product_name',
      label: t('common.product'),
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-slate-400" />
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-slate-500">{row.warehouse_name}</p>
          </div>
        </div>
      )
    },
    {
      key: 'current_stock',
      label: t('autoReplenishment.currentStock') || 'Stock actuel',
      sortable: true,
      render: (value, row) => (
        <div>
          <span className={value <= (row.min_stock || 10) * 0.5 ? 'text-red-600 font-bold' : 'text-amber-600'}>
            {value}
          </span>
          <span className="text-xs text-slate-500 ml-1">/ {row.min_stock}</span>
        </div>
      )
    },
    {
      key: 'suggested_quantity',
      label: t('autoReplenishment.suggestedQty') || 'Qté suggérée',
      render: (value) => <span className="font-medium text-green-600">{value}</span>
    },
    {
      key: 'suggested_supplier_name',
      label: t('common.supplier'),
      render: (value) => value || '-'
    },
    {
      key: 'estimated_cost',
      label: t('autoReplenishment.estimatedCost') || 'Coût estimé',
      sortable: true,
      render: (value) => (
        <span className="font-medium">${value?.toFixed(2)}</span>
      )
    },
    {
      key: 'priority',
      label: t('common.priority'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'generated_at',
      label: t('autoReplenishment.generatedAt') || 'Généré le',
      render: (value) => value ? format(new Date(value), 'dd/MM HH:mm') : '-'
    }
  ];

  const actions = [
    { 
      label: t('autoReplenishment.approve') || 'Approuver', 
      icon: CheckCircle,
      onClick: (row) => approveSuggestion(row),
      disabled: (row) => row.status !== 'pending'
    },
    { 
      label: t('common.reject'), 
      icon: XCircle,
      onClick: (row) => rejectSuggestion(row),
      destructive: true,
      disabled: (row) => row.status !== 'pending'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('autoReplenishment.title') || 'Réapprovisionnement Automatique'}
        description={t('autoReplenishment.description') || 'Suggestions de commande basées sur les stocks'}
        icon={RefreshCw}
        breadcrumbs={[t('nav.purchasing'), t('autoReplenishment.title') || 'Auto-Réappro']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={generateSuggestions}
            disabled={generating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            {generating ? t('autoReplenishment.generating') || 'Génération...' : t('autoReplenishment.generate') || 'Générer'}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('autoReplenishment.pending') || 'En attente'}
          value={pendingSuggestions}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title={t('autoReplenishment.critical') || 'Critique'}
          value={criticalSuggestions}
          icon={AlertTriangle}
          color={criticalSuggestions > 0 ? 'red' : 'green'}
        />
        <StatCard
          title={t('autoReplenishment.approved') || 'Approuvé'}
          value={approvedSuggestions}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title={t('autoReplenishment.estimatedCost') || 'Coût estimé'}
          value={`$${totalEstimatedCost.toLocaleString()}`}
          icon={ShoppingCart}
          color="indigo"
        />
      </div>

      <DataTable
        columns={columns}
        data={suggestions}
        loading={isLoading}
        selectable
        actions={actions}
        emptyMessage={t('autoReplenishment.noSuggestions') || 'Aucune suggestion'}
        emptyIcon={RefreshCw}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['replenishmentSuggestions'] })}
        exportFileName="replenishment_suggestions"
        filterOptions={{
          status: [
            { label: 'En attente', value: 'pending' },
            { label: 'Approuvé', value: 'approved' },
            { label: 'Commandé', value: 'ordered' },
            { label: 'Rejeté', value: 'rejected' }
          ],
          priority: [
            { label: 'Critique', value: 'critical' },
            { label: 'Élevée', value: 'high' },
            { label: 'Moyenne', value: 'medium' },
            { label: 'Basse', value: 'low' }
          ]
        }}
      />
    </div>
  );
}