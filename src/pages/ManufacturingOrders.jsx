import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatCard from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Factory, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function ManufacturingOrders() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['manufacturingOrders'],
    queryFn: () => base44.entities.ManufacturingOrder.list('-created_date', 100)
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: boms = [] } = useQuery({
    queryKey: ['boms'],
    queryFn: () => base44.entities.BillOfMaterials.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ManufacturingOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturingOrders'] });
      setDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ManufacturingOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturingOrders'] });
      setDialogOpen(false);
      setDetailsOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ManufacturingOrder.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['manufacturingOrders'] })
  });

  const generateOrderNumber = () => {
    const year = new Date().getFullYear();
    const count = orders.length + 1;
    return `MO-${year}-${String(count).padStart(4, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = products.find(p => p.id === formData.get('product_id'));
    
    const data = {
      order_number: selectedOrder?.order_number || generateOrderNumber(),
      product_id: formData.get('product_id'),
      product_name: product?.name,
      bom_id: formData.get('bom_id'),
      quantity: parseInt(formData.get('quantity')),
      status: selectedOrder?.status || 'draft',
      priority: formData.get('priority'),
      planned_start_date: formData.get('planned_start_date'),
      planned_end_date: formData.get('planned_end_date'),
      work_center: formData.get('work_center'),
      notes: formData.get('notes')
    };

    if (selectedOrder) {
      updateMutation.mutate({ id: selectedOrder.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const updateStatus = (order, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'in_progress' && !order.actual_start_date) {
      updates.actual_start_date = new Date().toISOString();
    }
    if (newStatus === 'completed') {
      updates.actual_end_date = new Date().toISOString();
      updates.quantity_produced = order.quantity;
    }
    updateMutation.mutate({ id: order.id, data: updates });
  };

  // Stats
  const activeOrders = orders.filter(o => ['in_progress', 'planned', 'confirmed'].includes(o.status)).length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const urgentOrders = orders.filter(o => o.priority === 'urgent' || o.priority === 'high').length;
  const draftOrders = orders.filter(o => o.status === 'draft').length;

  const columns = [
    {
      key: 'order_number',
      label: 'Order #',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">
          {value}
        </span>
      )
    },
    {
      key: 'product_name',
      label: 'Product',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-slate-500">{row.work_center}</p>
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium">{value?.toLocaleString()}</p>
          {row.quantity_produced > 0 && (
            <Progress 
              value={(row.quantity_produced / row.quantity) * 100} 
              className="h-1.5 mt-1 w-20"
            />
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'planned_start_date',
      label: 'Start Date',
      sortable: true,
      render: (value) => value ? format(new Date(value), 'MMM d, yyyy') : '-'
    },
    {
      key: 'planned_end_date',
      label: 'Due Date',
      sortable: true,
      render: (value) => value ? format(new Date(value), 'MMM d, yyyy') : '-'
    }
  ];

  const actions = [
    { 
      label: 'View Details', 
      icon: Eye, 
      onClick: (row) => { setSelectedOrder(row); setDetailsOpen(true); } 
    },
    { 
      label: 'Edit', 
      icon: Pencil, 
      onClick: (row) => { setSelectedOrder(row); setDialogOpen(true); } 
    },
    { 
      label: 'Delete', 
      icon: Trash2, 
      onClick: (row) => deleteMutation.mutate(row.id), 
      destructive: true 
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('manufacturing.title')}
        description={t('manufacturing.description')}
        icon={Factory}
        breadcrumbs={[t('manufacturing.production') || 'Production', t('manufacturing.title')]}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedOrder(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('manufacturing.addOrder')}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Orders"
          value={activeOrders}
          icon={Play}
          color="indigo"
        />
        <StatCard
          title="Completed"
          value={completedOrders}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Urgent"
          value={urgentOrders}
          icon={AlertCircle}
          color={urgentOrders > 0 ? 'red' : 'green'}
        />
        <StatCard
          title="Draft"
          value={draftOrders}
          icon={Clock}
          color="amber"
        />
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={(row) => { setSelectedOrder(row); setDetailsOpen(true); }}
        emptyMessage="No manufacturing orders"
        emptyIcon={Factory}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder ? `Edit Order ${selectedOrder.order_number}` : 'New Manufacturing Order'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product *</Label>
                <Select name="product_id" defaultValue={selectedOrder?.product_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.type === 'finished_product' || p.type === 'semi_finished').map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bill of Materials</Label>
                <Select name="bom_id" defaultValue={selectedOrder?.bom_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select BOM" />
                  </SelectTrigger>
                  <SelectContent>
                    {boms.filter(b => b.status === 'active').map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name} (v{b.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input 
                  name="quantity" 
                  type="number" 
                  defaultValue={selectedOrder?.quantity}
                  required 
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select name="priority" defaultValue={selectedOrder?.priority || 'normal'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Planned Start</Label>
                <Input 
                  name="planned_start_date" 
                  type="datetime-local"
                  defaultValue={selectedOrder?.planned_start_date?.slice(0, 16)}
                />
              </div>
              <div className="space-y-2">
                <Label>Planned End</Label>
                <Input 
                  name="planned_end_date" 
                  type="datetime-local"
                  defaultValue={selectedOrder?.planned_end_date?.slice(0, 16)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Work Center</Label>
              <Input 
                name="work_center"
                defaultValue={selectedOrder?.work_center}
                placeholder="e.g., Assembly Line 1"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                name="notes"
                defaultValue={selectedOrder?.notes}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedOrder ? 'Update' : 'Create'}
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
              <StatusBadge status={selectedOrder?.priority} />
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Product</p>
                  <p className="font-medium">{selectedOrder.product_name}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Quantity</p>
                  <p className="font-medium">{selectedOrder.quantity}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Produced</p>
                  <p className="font-medium">{selectedOrder.quantity_produced || 0}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Progress</p>
                  <p className="font-medium">
                    {Math.round(((selectedOrder.quantity_produced || 0) / selectedOrder.quantity) * 100)}%
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Progress</p>
                <Progress 
                  value={((selectedOrder.quantity_produced || 0) / selectedOrder.quantity) * 100}
                  className="h-3"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedOrder.status === 'draft' && (
                  <Button onClick={() => updateStatus(selectedOrder, 'confirmed')}>
                    Confirm Order
                  </Button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <Button onClick={() => updateStatus(selectedOrder, 'planned')}>
                    Plan Production
                  </Button>
                )}
                {selectedOrder.status === 'planned' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => updateStatus(selectedOrder, 'in_progress')}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Production
                  </Button>
                )}
                {selectedOrder.status === 'in_progress' && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => updateStatus(selectedOrder, 'quality_check')}
                    >
                      Send to QC
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateStatus(selectedOrder, 'completed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  </>
                )}
                {selectedOrder.status === 'quality_check' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => updateStatus(selectedOrder, 'completed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Complete
                  </Button>
                )}
              </div>

              {selectedOrder.notes && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}