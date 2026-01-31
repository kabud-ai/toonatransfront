import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import EntitySummary from '@/components/common/EntitySummary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2,
  MapPin,
  Boxes,
  TrendingUp,
  DollarSign,
  CheckCircle,
  PieChart
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function Warehouses() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => base44.entities.Warehouse.list('-created_date', 100)
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list()
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stockLevels'],
    queryFn: () => base44.entities.StockLevel.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Warehouse.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Warehouse.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setDialogOpen(false);
      setDetailsOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Warehouse.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      name: formData.get('name'),
      code: formData.get('code'),
      site_id: formData.get('site_id'),
      type: formData.get('type'),
      is_active: true
    };

    if (selectedWarehouse) {
      updateMutation.mutate({ id: selectedWarehouse.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getWarehouseStats = (warehouseId) => {
    const warehouseStock = stockLevels.filter(s => s.warehouse_id === warehouseId);
    const totalItems = warehouseStock.length;
    const totalValue = warehouseStock.reduce((sum, s) => sum + (s.total_value || 0), 0);
    return { totalItems, totalValue };
  };

  const typeColors = {
    raw_materials: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    finished_goods: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    wip: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    quarantine: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    spare_parts: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Warehouse Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-slate-500">{sites.find(s => s.id === row.site_id)?.name || 'No site'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <Badge className={typeColors[value] || 'bg-slate-100 text-slate-700'}>
          {value?.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      key: 'id',
      label: 'Stock Items',
      render: (value) => {
        const stats = getWarehouseStats(value);
        return <span className="font-medium">{stats.totalItems}</span>;
      }
    },
    {
      key: 'id',
      label: 'Stock Value',
      render: (value) => {
        const stats = getWarehouseStats(value);
        return <span className="font-medium">${stats.totalValue.toLocaleString()}</span>;
      }
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <StatusBadge status={value ? 'active' : 'offline'} customLabel={value ? 'Active' : 'Inactive'} />
      )
    }
  ];

  const actions = [
    { label: 'View', icon: Eye, onClick: (row) => { setSelectedWarehouse(row); setDetailsOpen(true); } },
    { label: 'Edit', icon: Pencil, onClick: (row) => { setSelectedWarehouse(row); setDialogOpen(true); } },
    { label: 'Delete', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true }
  ];

  // Summary stats
  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter(w => w.is_active).length;
  const totalItems = stockLevels.length;
  const totalValue = stockLevels.reduce((sum, s) => sum + (s.total_value || 0), 0);

  const summaryStats = [
    { label: 'Total Entrepôts', value: totalWarehouses, icon: Building2, color: 'sky' },
    { label: 'Actifs', value: activeWarehouses, icon: CheckCircle, color: 'green' },
    { label: 'Articles en Stock', value: totalItems, icon: Boxes, color: 'purple' },
    { label: 'Valeur Totale', value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: 'green' },
  ];

  // Chart data by warehouse type
  const warehouseTypeData = [
    { name: 'Matières Premières', value: warehouses.filter(w => w.type === 'raw_materials').length, color: '#f59e0b' },
    { name: 'Produits Finis', value: warehouses.filter(w => w.type === 'finished_goods').length, color: '#10b981' },
    { name: 'En Cours', value: warehouses.filter(w => w.type === 'wip').length, color: '#3b82f6' },
    { name: 'Quarantine', value: warehouses.filter(w => w.type === 'quarantine').length, color: '#ef4444' },
    { name: 'Pièces Détachées', value: warehouses.filter(w => w.type === 'spare_parts').length, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('warehouses.title') || t('nav.warehouses')}
        description={t('warehouses.description')}
        icon={Building2}
        breadcrumbs={[t('nav.inventory'), t('nav.warehouses')]}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedWarehouse(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('warehouses.addWarehouse')}
          </Button>
        }
      />

      <EntitySummary stats={summaryStats} />

      {/* Chart */}
      {warehouseTypeData.length > 0 && (
        <Card className="bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <PieChart className="h-5 w-5 text-sky-600" />
              Répartition par Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={warehouseTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={(entry) => entry.name}
                  >
                    {warehouseTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={warehouses}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={(row) => { setSelectedWarehouse(row); setDetailsOpen(true); }}
        emptyMessage="No warehouses configured"
        emptyIcon={Building2}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedWarehouse ? 'Edit Warehouse' : 'New Warehouse'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Warehouse Name *</Label>
                <Input 
                  name="name" 
                  defaultValue={selectedWarehouse?.name}
                  required 
                  placeholder="e.g., Main Warehouse"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input 
                  name="code" 
                  defaultValue={selectedWarehouse?.code}
                  required 
                  placeholder="e.g., WH-001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Site</Label>
              <Select name="site_id" defaultValue={selectedWarehouse?.site_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select name="type" defaultValue={selectedWarehouse?.type || 'raw_materials'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raw_materials">Raw Materials</SelectItem>
                  <SelectItem value="finished_goods">Finished Goods</SelectItem>
                  <SelectItem value="wip">Work in Progress</SelectItem>
                  <SelectItem value="quarantine">Quarantine</SelectItem>
                  <SelectItem value="spare_parts">Spare Parts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedWarehouse ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedWarehouse?.name}</span>
              <StatusBadge status={selectedWarehouse?.is_active ? 'active' : 'offline'} />
            </DialogTitle>
          </DialogHeader>
          
          {selectedWarehouse && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <Boxes className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Stock Items</p>
                        <p className="text-lg font-medium">{getWarehouseStats(selectedWarehouse.id).totalItems}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total Value</p>
                        <p className="text-lg font-medium">
                          ${getWarehouseStats(selectedWarehouse.id).totalValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Site</p>
                        <p className="text-sm font-medium">
                          {sites.find(s => s.id === selectedWarehouse.site_id)?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Code</p>
                  <p className="font-mono text-lg">{selectedWarehouse.code}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</p>
                  <Badge className={typeColors[selectedWarehouse.type]}>
                    {selectedWarehouse.type?.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setDetailsOpen(false);
                  setDialogOpen(true);
                }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}