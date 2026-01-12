import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Plus, Eye, Pencil, Trash2, Barcode } from 'lucide-react';

export default function Products() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDialogOpen(false);
      setSelectedProduct(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDialogOpen(false);
      setSelectedProduct(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      sku: formData.get('sku'),
      type: formData.get('type'),
      category: formData.get('category'),
      unit_of_measure: formData.get('unit_of_measure'),
      cost_price: parseFloat(formData.get('cost_price')) || 0,
      sale_price: parseFloat(formData.get('sale_price')) || 0,
      min_stock: parseFloat(formData.get('min_stock')) || 0,
      lead_time_days: parseInt(formData.get('lead_time_days')) || 0,
      barcode: formData.get('barcode'),
      description: formData.get('description'),
      is_active: true
    };

    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {row.image_url ? (
              <img src={row.image_url} alt={value} className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <Package className="h-5 w-5 text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-slate-500">{row.category}</p>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value?.replace(/_/g, ' ')}
        </Badge>
      )
    },
    {
      key: 'unit_of_measure',
      label: 'Unit',
      render: (value) => value || '-'
    },
    {
      key: 'cost_price',
      label: 'Cost',
      sortable: true,
      render: (value) => `$${(value || 0).toFixed(2)}`
    },
    {
      key: 'sale_price',
      label: 'Sale Price',
      sortable: true,
      render: (value) => `$${(value || 0).toFixed(2)}`
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
    { label: 'View', icon: Eye, onClick: (row) => { setSelectedProduct(row); setDialogOpen(true); } },
    { label: 'Edit', icon: Pencil, onClick: (row) => { setSelectedProduct(row); setDialogOpen(true); } },
    { label: 'Delete', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog and inventory items"
        icon={Package}
        breadcrumbs={['Inventory', 'Products']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedProduct(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={products}
        loading={isLoading}
        selectable
        actions={actions}
        emptyMessage="No products found"
        emptyIcon={Package}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={selectedProduct?.name}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input 
                  id="sku" 
                  name="sku" 
                  defaultValue={selectedProduct?.sku}
                  required 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={selectedProduct?.type || 'raw_material'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw_material">Raw Material</SelectItem>
                    <SelectItem value="semi_finished">Semi-Finished</SelectItem>
                    <SelectItem value="finished_product">Finished Product</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                    <SelectItem value="spare_part">Spare Part</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category" 
                  name="category" 
                  defaultValue={selectedProduct?.category}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_of_measure">Unit of Measure</Label>
                <Select name="unit_of_measure" defaultValue={selectedProduct?.unit_of_measure || 'unit'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit">Unit</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="meter">Meter</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price</Label>
                <Input 
                  id="cost_price" 
                  name="cost_price" 
                  type="number" 
                  step="0.01"
                  defaultValue={selectedProduct?.cost_price}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_price">Sale Price</Label>
                <Input 
                  id="sale_price" 
                  name="sale_price" 
                  type="number" 
                  step="0.01"
                  defaultValue={selectedProduct?.sale_price}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_stock">Min Stock</Label>
                <Input 
                  id="min_stock" 
                  name="min_stock" 
                  type="number"
                  defaultValue={selectedProduct?.min_stock}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead_time_days">Lead Time (days)</Label>
                <Input 
                  id="lead_time_days" 
                  name="lead_time_days" 
                  type="number"
                  defaultValue={selectedProduct?.lead_time_days}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input 
                  id="barcode" 
                  name="barcode"
                  defaultValue={selectedProduct?.barcode}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description"
                defaultValue={selectedProduct?.description}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedProduct ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}