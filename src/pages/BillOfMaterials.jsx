import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
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
import { 
  Layers, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2,
  Copy,
  GitBranch,
  DollarSign,
  Package,
  X
} from 'lucide-react';

export default function BillOfMaterials() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBom, setSelectedBom] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [components, setComponents] = useState([]);

  const { data: boms = [], isLoading } = useQuery({
    queryKey: ['boms'],
    queryFn: () => base44.entities.BillOfMaterials.list('-created_date', 100)
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BillOfMaterials.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boms'] });
      setDialogOpen(false);
      setComponents([]);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BillOfMaterials.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boms'] });
      setDialogOpen(false);
      setDetailsOpen(false);
      setComponents([]);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BillOfMaterials.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boms'] })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const totalMaterialCost = components.reduce((sum, c) => sum + (c.cost * c.quantity), 0);
    
    const data = {
      product_id: formData.get('product_id'),
      name: formData.get('name'),
      version: formData.get('version') || '1.0',
      status: formData.get('status') || 'draft',
      quantity_produced: parseInt(formData.get('quantity_produced')) || 1,
      components: components,
      total_material_cost: totalMaterialCost,
      notes: formData.get('notes')
    };

    if (selectedBom) {
      updateMutation.mutate({ id: selectedBom.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addComponent = () => {
    setComponents([...components, {
      product_id: '',
      product_name: '',
      quantity: 1,
      unit: 'unit',
      cost: 0,
      is_optional: false
    }]);
  };

  const updateComponent = (index, field, value) => {
    const updated = [...components];
    updated[index][field] = value;
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        updated[index].product_name = product.name;
        updated[index].cost = product.cost_price || 0;
        updated[index].unit = product.unit_of_measure || 'unit';
      }
    }
    
    setComponents(updated);
  };

  const removeComponent = (index) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const openEdit = (bom) => {
    setSelectedBom(bom);
    setComponents(bom.components || []);
    setDialogOpen(true);
  };

  const openDetails = (bom) => {
    setSelectedBom(bom);
    setDetailsOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'BOM Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-slate-500">v{row.version}</p>
          </div>
        </div>
      )
    },
    {
      key: 'product_id',
      label: 'Product',
      render: (value) => {
        const product = products.find(p => p.id === value);
        return product?.name || '-';
      }
    },
    {
      key: 'components',
      label: 'Components',
      render: (value) => (
        <Badge variant="outline">
          {value?.length || 0} items
        </Badge>
      )
    },
    {
      key: 'quantity_produced',
      label: 'Output Qty',
      render: (value) => value || 1
    },
    {
      key: 'total_material_cost',
      label: 'Material Cost',
      sortable: true,
      render: (value) => `$${(value || 0).toFixed(2)}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    }
  ];

  const actions = [
    { label: 'View', icon: Eye, onClick: openDetails },
    { label: 'Edit', icon: Pencil, onClick: openEdit },
    { label: 'Duplicate', icon: Copy, onClick: (row) => {
      setSelectedBom(null);
      setComponents(row.components || []);
      setDialogOpen(true);
    }},
    { label: 'Delete', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill of Materials"
        description="Define product structures and component requirements"
        icon={Layers}
        breadcrumbs={['Production', 'Bill of Materials']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { 
              setSelectedBom(null); 
              setComponents([]); 
              setDialogOpen(true); 
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New BOM
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={boms}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={openDetails}
        emptyMessage="No bill of materials defined"
        emptyIcon={Layers}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setComponents([]); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBom ? `Edit ${selectedBom.name}` : 'New Bill of Materials'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>BOM Name *</Label>
                <Input 
                  name="name" 
                  defaultValue={selectedBom?.name}
                  required 
                  placeholder="e.g., Product A Assembly"
                />
              </div>
              <div className="space-y-2">
                <Label>Output Product *</Label>
                <Select name="product_id" defaultValue={selectedBom?.product_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.type !== 'raw_material').map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Version</Label>
                <Input 
                  name="version" 
                  defaultValue={selectedBom?.version || '1.0'}
                />
              </div>
              <div className="space-y-2">
                <Label>Output Quantity</Label>
                <Input 
                  name="quantity_produced" 
                  type="number"
                  defaultValue={selectedBom?.quantity_produced || 1}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={selectedBom?.status || 'draft'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="obsolete">Obsolete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Components Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Components</Label>
                <Button type="button" variant="outline" size="sm" onClick={addComponent}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Component
                </Button>
              </div>
              
              {components.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No components added</p>
                  <Button type="button" variant="ghost" size="sm" onClick={addComponent} className="mt-2">
                    Add your first component
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg divide-y">
                  {components.map((comp, idx) => (
                    <div key={idx} className="p-3 flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <Select 
                          value={comp.product_id}
                          onValueChange={(v) => updateComponent(idx, 'product_id', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.filter(p => p.type === 'raw_material' || p.type === 'semi_finished').map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={comp.quantity}
                          onChange={(e) => updateComponent(idx, 'quantity', parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                        <Input
                          placeholder="Unit"
                          value={comp.unit}
                          onChange={(e) => updateComponent(idx, 'unit', e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">
                            ${(comp.cost * comp.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeComponent(idx)}
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  ))}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 flex justify-end">
                    <div className="text-sm">
                      <span className="text-slate-500">Total Material Cost: </span>
                      <span className="font-semibold">
                        ${components.reduce((sum, c) => sum + (c.cost * c.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                name="notes"
                defaultValue={selectedBom?.notes}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedBom ? 'Update' : 'Create'} BOM
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedBom?.name}</span>
              <Badge variant="outline">v{selectedBom?.version}</Badge>
              <StatusBadge status={selectedBom?.status} />
            </DialogTitle>
          </DialogHeader>
          
          {selectedBom && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Output</p>
                        <p className="font-medium">{selectedBom.quantity_produced || 1} units</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Material Cost</p>
                        <p className="font-medium">${(selectedBom.total_material_cost || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Components</p>
                        <p className="font-medium">{selectedBom.components?.length || 0} items</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-medium mb-3">Components</h3>
                {selectedBom.components?.length > 0 ? (
                  <div className="border rounded-lg divide-y">
                    {selectedBom.components.map((comp, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium">{comp.product_name}</p>
                            <p className="text-xs text-slate-500">{comp.quantity} {comp.unit}</p>
                          </div>
                        </div>
                        <p className="font-medium">${(comp.cost * comp.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No components defined</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => openEdit(selectedBom)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => {
                  setSelectedBom(null);
                  setComponents(selectedBom.components || []);
                  setDetailsOpen(false);
                  setDialogOpen(true);
                }}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}