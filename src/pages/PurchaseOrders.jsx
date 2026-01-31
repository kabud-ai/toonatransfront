import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ShoppingCart, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2,
  Send,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function PurchaseOrders() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [lines, setLines] = useState([]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: () => base44.entities.PurchaseOrder.list('-created_date', 100)
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
    mutationFn: (data) => base44.entities.PurchaseOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      setDialogOpen(false);
      setLines([]);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PurchaseOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      setDialogOpen(false);
      setDetailsOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PurchaseOrder.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
  });

  const generateOrderNumber = () => {
    const year = new Date().getFullYear();
    const count = orders.length + 1;
    return `PO-${year}-${String(count).padStart(4, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const supplier = suppliers.find(s => s.id === formData.get('supplier_id'));
    
    const subtotal = lines.reduce((sum, l) => sum + (l.total || 0), 0);
    const tax = subtotal * 0.1; // 10% tax

    const data = {
      order_number: selectedOrder?.order_number || generateOrderNumber(),
      supplier_id: formData.get('supplier_id'),
      supplier_name: supplier?.name,
      status: selectedOrder?.status || 'draft',
      order_date: formData.get('order_date'),
      expected_date: formData.get('expected_date'),
      warehouse_id: formData.get('warehouse_id'),
      lines: lines,
      subtotal: subtotal,
      tax: tax,
      total: subtotal + tax,
      notes: formData.get('notes')
    };

    if (selectedOrder) {
      updateMutation.mutate({ id: selectedOrder.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addLine = () => {
    setLines([...lines, {
      product_id: '',
      product_name: '',
      quantity: 1,
      quantity_received: 0,
      unit_price: 0,
      total: 0
    }]);
  };

  const updateLine = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        updated[index].product_name = product.name;
        updated[index].unit_price = product.cost_price || 0;
        updated[index].total = updated[index].quantity * (product.cost_price || 0);
      }
    }
    
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total = updated[index].quantity * updated[index].unit_price;
    }
    
    setLines(updated);
  };

  const removeLine = (index) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateStatus = (order, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'received') {
      updates.received_date = new Date().toISOString().split('T')[0];
    }
    updateMutation.mutate({ id: order.id, data: updates });
  };

  // Stats
  const draftOrders = orders.filter(o => o.status === 'draft').length;
  const pendingOrders = orders.filter(o => ['sent', 'confirmed'].includes(o.status)).length;
  const receivedOrders = orders.filter(o => o.status === 'received').length;
  const totalSpend = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const columns = [
    {
      key: 'order_number',
      label: 'PO #',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">
          {value}
        </span>
      )
    },
    {
      key: 'supplier_name',
      label: 'Supplier',
      sortable: true
    },
    {
      key: 'lines',
      label: 'Items',
      render: (value) => (
        <Badge variant="outline">
          {value?.length || 0} items
        </Badge>
      )
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (value) => `$${(value || 0).toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'order_date',
      label: 'Order Date',
      sortable: true,
      render: (value) => value ? format(new Date(value), 'MMM d, yyyy') : '-'
    },
    {
      key: 'expected_date',
      label: 'Expected',
      render: (value) => value ? format(new Date(value), 'MMM d, yyyy') : '-'
    }
  ];

  const actions = [
    { label: 'View', icon: Eye, onClick: (row) => { setSelectedOrder(row); setDetailsOpen(true); } },
    { label: 'Edit', icon: Pencil, onClick: (row) => { setSelectedOrder(row); setLines(row.lines || []); setDialogOpen(true); } },
    { label: 'Delete', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('purchasing.title')}
        description={t('purchasing.description')}
        icon={ShoppingCart}
        breadcrumbs={[t('nav.purchasing'), t('purchasing.title')]}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedOrder(null); setLines([]); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('purchasing.newOrder')}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Draft"
          value={draftOrders}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Pending"
          value={pendingOrders}
          icon={Send}
          color="blue"
        />
        <StatCard
          title="Received"
          value={receivedOrders}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Total Spend"
          value={`$${totalSpend.toLocaleString()}`}
          icon={DollarSign}
          color="indigo"
        />
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={(row) => { setSelectedOrder(row); setDetailsOpen(true); }}
        emptyMessage="No purchase orders"
        emptyIcon={ShoppingCart}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setLines([]); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder ? `Edit ${selectedOrder.order_number}` : 'New Purchase Order'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <Select name="supplier_id" defaultValue={selectedOrder?.supplier_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
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
                <Label>Warehouse</Label>
                <Select name="warehouse_id" defaultValue={selectedOrder?.warehouse_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Warehouse</SelectItem>
                    <SelectItem value="raw">Raw Materials</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Order Date *</Label>
                <Input 
                  name="order_date" 
                  type="date" 
                  defaultValue={selectedOrder?.order_date || new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Expected Delivery</Label>
                <Input 
                  name="expected_date" 
                  type="date"
                  defaultValue={selectedOrder?.expected_date}
                />
              </div>
            </div>

            {/* Order Lines */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Order Lines</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Line
                </Button>
              </div>
              
              {lines.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No items added</p>
                </div>
              ) : (
                <div className="border rounded-lg divide-y">
                  {lines.map((line, idx) => (
                    <div key={idx} className="p-3 flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <Select 
                          value={line.product_id}
                          onValueChange={(v) => updateLine(idx, 'product_id', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={line.quantity}
                          onChange={(e) => updateLine(idx, 'quantity', parseFloat(e.target.value))}
                          min="1"
                        />
                        <Input
                          type="number"
                          placeholder="Unit Price"
                          value={line.unit_price}
                          onChange={(e) => updateLine(idx, 'unit_price', parseFloat(e.target.value))}
                          step="0.01"
                        />
                        <div className="flex items-center">
                          <span className="font-medium">${(line.total || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeLine(idx)}
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  ))}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800">
                    <div className="flex justify-end gap-6 text-sm">
                      <div>
                        <span className="text-slate-500">Subtotal: </span>
                        <span className="font-medium">
                          ${lines.reduce((sum, l) => sum + (l.total || 0), 0).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Tax (10%): </span>
                        <span className="font-medium">
                          ${(lines.reduce((sum, l) => sum + (l.total || 0), 0) * 0.1).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Total: </span>
                        <span className="font-semibold">
                          ${(lines.reduce((sum, l) => sum + (l.total || 0), 0) * 1.1).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                name="notes"
                defaultValue={selectedOrder?.notes}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedOrder ? 'Update' : 'Create'} Order
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
              <span>{selectedOrder?.order_number}</span>
              <StatusBadge status={selectedOrder?.status} />
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Supplier</p>
                  <p className="font-medium">{selectedOrder.supplier_name}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Order Date</p>
                  <p className="font-medium">
                    {selectedOrder.order_date ? format(new Date(selectedOrder.order_date), 'MMM d, yyyy') : '-'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Total</p>
                  <p className="font-medium text-lg">${(selectedOrder.total || 0).toLocaleString()}</p>
                </div>
              </div>

              {selectedOrder.lines?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Order Lines</h3>
                  <div className="border rounded-lg divide-y">
                    {selectedOrder.lines.map((line, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{line.product_name}</p>
                          <p className="text-sm text-slate-500">
                            {line.quantity} × ${line.unit_price?.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">${(line.total || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {selectedOrder.status === 'draft' && (
                  <Button onClick={() => updateStatus(selectedOrder, 'sent')}>
                    <Send className="h-4 w-4 mr-2" />
                    Send to Supplier
                  </Button>
                )}
                {selectedOrder.status === 'sent' && (
                  <Button onClick={() => updateStatus(selectedOrder, 'confirmed')}>
                    Confirm Order
                  </Button>
                )}
                {['sent', 'confirmed', 'partial'].includes(selectedOrder.status) && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => updateStatus(selectedOrder, 'received')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Received
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}