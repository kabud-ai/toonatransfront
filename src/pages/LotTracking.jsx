import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatCard from '@/components/common/StatCard';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layers, 
  Plus, 
  Eye, 
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  History,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function LotTracking() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('lots');
  const [searchLot, setSearchLot] = useState('');

  const { data: lots = [], isLoading: lotsLoading } = useQuery({
    queryKey: ['productLots'],
    queryFn: () => base44.entities.ProductLot.list('-created_date', 200)
  });

  const { data: movements = [], isLoading: movementsLoading } = useQuery({
    queryKey: ['lotMovements'],
    queryFn: () => base44.entities.LotMovement.list('-created_date', 200)
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => base44.entities.Warehouse.list()
  });

  const createLot = useMutation({
    mutationFn: (data) => base44.entities.ProductLot.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productLots'] });
      setDialogOpen(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = products.find(p => p.id === formData.get('product_id'));
    const warehouse = warehouses.find(w => w.id === formData.get('warehouse_id'));
    
    const data = {
      lot_number: formData.get('lot_number'),
      product_id: formData.get('product_id'),
      product_name: product?.name,
      warehouse_id: formData.get('warehouse_id'),
      warehouse_name: warehouse?.name,
      initial_quantity: parseFloat(formData.get('initial_quantity')),
      current_quantity: parseFloat(formData.get('initial_quantity')),
      unit_cost: parseFloat(formData.get('unit_cost')),
      manufacturing_date: formData.get('manufacturing_date'),
      expiry_date: formData.get('expiry_date'),
      received_date: formData.get('received_date') || new Date().toISOString().split('T')[0],
      status: 'available',
      quality_status: 'pending',
      notes: formData.get('notes')
    };

    createLot.mutate(data);
  };

  // Stats
  const totalLots = lots.length;
  const activeLots = lots.filter(l => l.status === 'available' && l.current_quantity > 0).length;
  const expiringLots = lots.filter(l => {
    if (!l.expiry_date) return false;
    const daysUntilExpiry = Math.floor((new Date(l.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  }).length;
  const expiredLots = lots.filter(l => l.status === 'expired' || (l.expiry_date && new Date(l.expiry_date) < new Date())).length;

  const filteredLots = searchLot 
    ? lots.filter(l => l.lot_number?.toLowerCase().includes(searchLot.toLowerCase()) || 
                       l.product_name?.toLowerCase().includes(searchLot.toLowerCase()))
    : lots;

  const lotColumns = [
    {
      key: 'lot_number',
      label: t('lotTracking.lotNumber') || 'Numéro de lot',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">
          {value}
        </span>
      )
    },
    {
      key: 'product_name',
      label: t('common.product'),
      sortable: true,
      render: (value, row) => (
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
      key: 'current_quantity',
      label: t('common.quantity'),
      sortable: true,
      render: (value, row) => (
        <div>
          <span className="font-medium">{value?.toLocaleString() || 0}</span>
          <span className="text-xs text-slate-500 ml-1">/ {row.initial_quantity}</span>
        </div>
      )
    },
    {
      key: 'manufacturing_date',
      label: t('lotTracking.manufacturingDate') || 'Date fabrication',
      render: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : '-'
    },
    {
      key: 'expiry_date',
      label: t('lotTracking.expiryDate') || 'Date expiration',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        const isExpired = date < new Date();
        const daysUntilExpiry = Math.floor((date - new Date()) / (1000 * 60 * 60 * 24));
        const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        
        return (
          <div className={isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : ''}>
            {format(date, 'dd/MM/yyyy')}
            {isExpiringSoon && !isExpired && (
              <span className="text-xs ml-1">({daysUntilExpiry}j)</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'quality_status',
      label: t('lotTracking.qualityStatus') || 'Statut qualité',
      render: (value) => value ? <StatusBadge status={value} /> : '-'
    }
  ];

  const movementColumns = [
    {
      key: 'created_date',
      label: t('common.date'),
      sortable: true,
      render: (value) => format(new Date(value), 'dd/MM/yyyy HH:mm')
    },
    {
      key: 'lot_number',
      label: t('lotTracking.lotNumber') || 'Lot',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'product_name',
      label: t('common.product')
    },
    {
      key: 'movement_type',
      label: t('common.type'),
      render: (value) => {
        const colors = {
          in: 'bg-green-100 text-green-700',
          out: 'bg-red-100 text-red-700',
          transfer: 'bg-blue-100 text-blue-700',
          production: 'bg-purple-100 text-purple-700',
          consumption: 'bg-orange-100 text-orange-700',
          quarantine: 'bg-yellow-100 text-yellow-700',
          release: 'bg-cyan-100 text-cyan-700'
        };
        return (
          <Badge className={colors[value] || 'bg-slate-100 text-slate-700'}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'quantity',
      label: t('common.quantity'),
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'reference_type',
      label: t('lotTracking.reference') || 'Référence',
      render: (value, row) => (
        <span className="text-sm text-slate-500">
          {value ? `${value} - ${row.reference_id?.slice(0, 8)}` : '-'}
        </span>
      )
    },
    {
      key: 'performed_by',
      label: t('lotTracking.performedBy') || 'Par',
      render: (value) => value || '-'
    }
  ];

  const actions = [
    { 
      label: t('common.viewDetails') || 'Voir détails', 
      icon: Eye, 
      onClick: (row) => { setSelectedLot(row); setDetailsOpen(true); } 
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('lotTracking.title') || 'Traçabilité des Lots'}
        description={t('lotTracking.description') || 'Gérer et tracer les lots de produits'}
        icon={Layers}
        breadcrumbs={[t('nav.inventory'), t('lotTracking.title') || 'Lots']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedLot(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('lotTracking.createLot') || 'Créer un lot'}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('lotTracking.totalLots') || 'Total Lots'}
          value={totalLots}
          icon={Package}
          color="indigo"
        />
        <StatCard
          title={t('lotTracking.activeLots') || 'Lots Actifs'}
          value={activeLots}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title={t('lotTracking.expiringLots') || 'Lots à expirer (30j)'}
          value={expiringLots}
          icon={Clock}
          color={expiringLots > 0 ? 'amber' : 'green'}
        />
        <StatCard
          title={t('lotTracking.expiredLots') || 'Lots Expirés'}
          value={expiredLots}
          icon={AlertTriangle}
          color={expiredLots > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="lots">
            <Package className="h-4 w-4 mr-2" />
            {t('lotTracking.lots') || 'Lots'}
          </TabsTrigger>
          <TabsTrigger value="movements">
            <History className="h-4 w-4 mr-2" />
            {t('lotTracking.movements') || 'Mouvements'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="lots" className="mt-4 space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t('lotTracking.searchLot') || 'Rechercher par lot ou produit...'}
                value={searchLot}
                onChange={(e) => setSearchLot(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <DataTable
            columns={lotColumns}
            data={filteredLots}
            loading={lotsLoading}
            selectable
            actions={actions}
            onRowClick={(row) => { setSelectedLot(row); setDetailsOpen(true); }}
            emptyMessage={t('lotTracking.noLots') || 'Aucun lot trouvé'}
            emptyIcon={Package}
          />
        </TabsContent>
        
        <TabsContent value="movements" className="mt-4">
          <DataTable
            columns={movementColumns}
            data={movements}
            loading={movementsLoading}
            emptyMessage={t('lotTracking.noMovements') || 'Aucun mouvement enregistré'}
            emptyIcon={History}
          />
        </TabsContent>
      </Tabs>

      {/* Create Lot Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('lotTracking.createLot') || 'Créer un nouveau lot'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('lotTracking.lotNumber') || 'Numéro de lot'} *</Label>
                <Input 
                  name="lot_number" 
                  required 
                  placeholder="LOT-2026-001"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('common.product')} *</Label>
                <Select name="product_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectProduct')} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('common.warehouse')} *</Label>
                <Select name="warehouse_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectWarehouse')} />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.quantity')} *</Label>
                <Input 
                  name="initial_quantity" 
                  type="number" 
                  required 
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('lotTracking.unitCost') || 'Coût unitaire'}</Label>
                <Input 
                  name="unit_cost" 
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('lotTracking.receivedDate') || 'Date de réception'}</Label>
                <Input 
                  name="received_date" 
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('lotTracking.manufacturingDate') || 'Date de fabrication'}</Label>
                <Input name="manufacturing_date" type="date" />
              </div>
              <div className="space-y-2">
                <Label>{t('lotTracking.expiryDate') || 'Date d\'expiration'}</Label>
                <Input name="expiry_date" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('common.notes')}</Label>
              <Textarea 
                name="notes"
                rows={2}
                placeholder={t('lotTracking.notesPlaceholder') || 'Notes sur le lot...'}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {t('common.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedLot?.lot_number}</span>
              <StatusBadge status={selectedLot?.status} />
              {selectedLot?.quality_status && (
                <StatusBadge status={selectedLot?.quality_status} />
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLot && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500 mb-1">{t('common.product')}</p>
                    <p className="font-medium">{selectedLot.product_name}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500 mb-1">{t('common.warehouse')}</p>
                    <p className="font-medium">{selectedLot.warehouse_name}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500 mb-1">{t('common.quantity')}</p>
                    <p className="font-medium text-lg">
                      {selectedLot.current_quantity} / {selectedLot.initial_quantity}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500 mb-1">{t('lotTracking.unitCost') || 'Coût'}</p>
                    <p className="font-medium">${selectedLot.unit_cost?.toFixed(2) || '0.00'}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {selectedLot.manufacturing_date && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">{t('lotTracking.manufacturingDate')}</p>
                    <p className="font-medium">{format(new Date(selectedLot.manufacturing_date), 'dd/MM/yyyy')}</p>
                  </div>
                )}
                {selectedLot.expiry_date && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">{t('lotTracking.expiryDate')}</p>
                    <p className="font-medium">{format(new Date(selectedLot.expiry_date), 'dd/MM/yyyy')}</p>
                  </div>
                )}
                {selectedLot.received_date && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">{t('lotTracking.receivedDate')}</p>
                    <p className="font-medium">{format(new Date(selectedLot.received_date), 'dd/MM/yyyy')}</p>
                  </div>
                )}
              </div>

              {selectedLot.notes && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('common.notes')}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedLot.notes}</p>
                </div>
              )}

              {/* Lot Movements */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  {t('lotTracking.lotHistory') || 'Historique du lot'}
                </h3>
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {movements.filter(m => m.lot_number === selectedLot.lot_number)
                    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
                    .map((movement, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <Badge className={
                          movement.movement_type === 'in' || movement.movement_type === 'production' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }>
                          {movement.movement_type}
                        </Badge>
                        <span className="text-slate-600">
                          {movement.quantity} unités
                        </span>
                        {movement.reference_type && (
                          <span className="text-xs text-slate-400">
                            {movement.reference_type}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {format(new Date(movement.created_date), 'dd/MM HH:mm')}
                      </span>
                    </div>
                  ))}
                  {movements.filter(m => m.lot_number === selectedLot.lot_number).length === 0 && (
                    <div className="p-8 text-center text-sm text-slate-400">
                      {t('lotTracking.noMovements') || 'Aucun mouvement'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}