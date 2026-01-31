import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BookMarked, 
  Plus, 
  Pencil, 
  Trash2,
  Star,
  DollarSign,
  Clock,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function SupplierCatalog() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: catalogItems = [], isLoading } = useQuery({
    queryKey: ['supplierCatalog'],
    queryFn: () => base44.entities.SupplierCatalog.list('-created_date', 200)
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SupplierCatalog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierCatalog'] });
      setDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupplierCatalog.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierCatalog'] });
      setDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SupplierCatalog.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supplierCatalog'] })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const supplier = suppliers.find(s => s.id === formData.get('supplier_id'));
    const product = products.find(p => p.id === formData.get('product_id'));
    
    const data = {
      supplier_id: formData.get('supplier_id'),
      supplier_name: supplier?.name,
      product_id: formData.get('product_id'),
      product_name: product?.name,
      supplier_sku: formData.get('supplier_sku'),
      unit_price: parseFloat(formData.get('unit_price')),
      currency: formData.get('currency') || 'USD',
      min_order_quantity: parseFloat(formData.get('min_order_quantity')) || 1,
      lead_time_days: parseInt(formData.get('lead_time_days')) || 7,
      is_preferred: formData.get('is_preferred') === 'on',
      is_active: true,
      last_price_update: new Date().toISOString().split('T')[0],
      notes: formData.get('notes')
    };

    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    {
      key: 'supplier_name',
      label: t('common.supplier') || 'Fournisseur',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          {row.is_preferred && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
        </div>
      )
    },
    {
      key: 'product_name',
      label: t('common.product'),
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          {row.supplier_sku && (
            <p className="text-xs text-slate-500 font-mono">{row.supplier_sku}</p>
          )}
        </div>
      )
    },
    {
      key: 'unit_price',
      label: t('supplierCatalog.unitPrice') || 'Prix unitaire',
      sortable: true,
      render: (value, row) => (
        <span className="font-medium">
          {value?.toFixed(2)} {row.currency || 'USD'}
        </span>
      )
    },
    {
      key: 'min_order_quantity',
      label: t('supplierCatalog.minOrderQty') || 'Qté min',
      render: (value) => value || 1
    },
    {
      key: 'lead_time_days',
      label: t('supplierCatalog.leadTime') || 'Délai',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-slate-400" />
          <span>{value || 7} j</span>
        </div>
      )
    },
    {
      key: 'last_price_update',
      label: t('supplierCatalog.lastUpdate') || 'MAJ Prix',
      render: (value) => value ? format(new Date(value), 'dd/MM/yyyy') : '-'
    },
    {
      key: 'is_active',
      label: t('common.status'),
      render: (value) => (
        <Badge className={value ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
          {value ? 'Actif' : 'Inactif'}
        </Badge>
      )
    }
  ];

  const actions = [
    { 
      label: t('common.edit'), 
      icon: Pencil, 
      onClick: (row) => { setSelectedItem(row); setDialogOpen(true); } 
    },
    { 
      label: t('common.delete'), 
      icon: Trash2, 
      onClick: (row) => deleteMutation.mutate(row.id), 
      destructive: true 
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('supplierCatalog.title') || 'Catalogue Fournisseurs'}
        description={t('supplierCatalog.description') || 'Gérer les prix et références fournisseurs'}
        icon={BookMarked}
        breadcrumbs={[t('nav.purchasing'), t('supplierCatalog.title') || 'Catalogue']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedItem(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('supplierCatalog.addItem') || 'Ajouter'}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={catalogItems}
        loading={isLoading}
        selectable
        actions={actions}
        emptyMessage={t('supplierCatalog.noCatalog') || 'Aucun catalogue'}
        emptyIcon={BookMarked}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? t('common.edit') : t('supplierCatalog.addItem') || 'Ajouter au catalogue'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('common.supplier')} *</Label>
                <Select name="supplier_id" defaultValue={selectedItem?.supplier_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectSupplier')} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.filter(s => s.is_active).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('common.product')} *</Label>
                <Select name="product_id" defaultValue={selectedItem?.product_id} required>
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
                <Label>{t('supplierCatalog.supplierSku') || 'Réf. fournisseur'}</Label>
                <Input 
                  name="supplier_sku" 
                  defaultValue={selectedItem?.supplier_sku}
                  placeholder="SUP-SKU-001"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('supplierCatalog.unitPrice') || 'Prix unitaire'} *</Label>
                <Input 
                  name="unit_price" 
                  type="number"
                  step="0.01"
                  defaultValue={selectedItem?.unit_price}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('supplierCatalog.minOrderQty') || 'Qté min'}</Label>
                <Input 
                  name="min_order_quantity" 
                  type="number"
                  defaultValue={selectedItem?.min_order_quantity || 1}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('supplierCatalog.leadTime') || 'Délai (jours)'}</Label>
                <Input 
                  name="lead_time_days" 
                  type="number"
                  defaultValue={selectedItem?.lead_time_days || 7}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('common.currency') || 'Devise'}</Label>
                <Select name="currency" defaultValue={selectedItem?.currency || 'USD'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch 
                name="is_preferred" 
                defaultChecked={selectedItem?.is_preferred}
              />
              <Label>{t('supplierCatalog.preferredSupplier') || 'Fournisseur préféré'}</Label>
            </div>

            <div className="space-y-2">
              <Label>{t('common.notes')}</Label>
              <Textarea 
                name="notes"
                defaultValue={selectedItem?.notes}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedItem ? t('common.update') : t('common.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}