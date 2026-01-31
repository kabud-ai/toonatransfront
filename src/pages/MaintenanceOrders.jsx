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
  FileText, 
  Plus, 
  Eye,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  Wrench,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function MaintenanceOrders() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['maintenanceOrders'],
    queryFn: () => base44.entities.MaintenanceOrder.list('-created_date', 100)
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceOrders'] });
      setDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MaintenanceOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceOrders'] });
      setDialogOpen(false);
      setDetailsOpen(false);
    }
  });

  const generateOrderNumber = () => {
    const year = new Date().getFullYear();
    const count = orders.length + 1;
    return `WO-${year}-${String(count).padStart(4, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const equip = equipment.find(eq => eq.id === formData.get('equipment_id'));
    
    const data = {
      order_number: selectedOrder?.order_number || generateOrderNumber(),
      equipment_id: formData.get('equipment_id'),
      equipment_name: equip?.name,
      type: formData.get('type'),
      priority: formData.get('priority'),
      status: selectedOrder?.status || 'scheduled',
      description: formData.get('description'),
      scheduled_date: formData.get('scheduled_date'),
      assigned_to: formData.get('assigned_to')
    };

    if (selectedOrder) {
      updateMutation.mutate({ id: selectedOrder.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const updateStatus = (order, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'in_progress') {
      updates.started_at = new Date().toISOString();
    }
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    updateMutation.mutate({ id: order.id, data: updates });
  };

  // Stats
  const scheduledCount = orders.filter(o => o.status === 'scheduled').length;
  const inProgressCount = orders.filter(o => o.status === 'in_progress').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const preventiveCount = orders.filter(o => o.type === 'preventive').length;

  const columns = [
    {
      key: 'order_number',
      label: 'Work Order #',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">
          {value}
        </span>
      )
    },
    {
      key: 'equipment_name',
      label: 'Equipment',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-slate-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => {
        const colors = {
          preventive: 'bg-blue-100 text-blue-700',
          corrective: 'bg-amber-100 text-amber-700',
          predictive: 'bg-purple-100 text-purple-700',
          emergency: 'bg-red-100 text-red-700'
        };
        return (
          <Badge className={colors[value] || 'bg-slate-100 text-slate-700'}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'scheduled_date',
      label: 'Scheduled',
      sortable: true,
      render: (value) => value ? format(new Date(value), 'MMM d, yyyy') : '-'
    },
    {
      key: 'assigned_to',
      label: 'Assigned To',
      render: (value) => value || '-'
    }
  ];

  const actions = [
    { label: 'View', icon: Eye, onClick: (row) => { setSelectedOrder(row); setDetailsOpen(true); } }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('maintenance.title')}
        description={t('maintenance.description')}
        icon={FileText}
        breadcrumbs={[t('nav.maintenance'), t('maintenance.workOrder')]}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedOrder(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('maintenance.addOrder')}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Scheduled"
          value={scheduledCount}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={Play}
          color="amber"
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Preventive"
          value={preventiveCount}
          icon={Clock}
          color="purple"
        />
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={(row) => { setSelectedOrder(row); setDetailsOpen(true); }}
        emptyMessage="No maintenance orders"
        emptyIcon={FileText}
      />

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Maintenance Work Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Equipment *</Label>
              <Select name="equipment_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name} ({eq.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="predictive">Predictive</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select name="priority" defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Scheduled Date *</Label>
                <Input 
                  name="scheduled_date" 
                  type="date" 
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Input name="assigned_to" placeholder="Technician name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                name="description"
                rows={3}
                placeholder="Describe the maintenance task..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                Create Work Order
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
              <span>{selectedOrder?.order_number}</span>
              <StatusBadge status={selectedOrder?.status} />
              <StatusBadge status={selectedOrder?.priority} />
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Equipment</p>
                  <p className="font-medium">{selectedOrder.equipment_name}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Type</p>
                  <p className="font-medium capitalize">{selectedOrder.type}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Scheduled</p>
                  <p className="font-medium">
                    {selectedOrder.scheduled_date 
                      ? format(new Date(selectedOrder.scheduled_date), 'MMM d, yyyy')
                      : '-'
                    }
                  </p>
                </div>
              </div>

              {selectedOrder.description && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedOrder.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {selectedOrder.status === 'scheduled' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => updateStatus(selectedOrder, 'in_progress')}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Work
                  </Button>
                )}
                {selectedOrder.status === 'in_progress' && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => updateStatus(selectedOrder, 'waiting_parts')}
                    >
                      Waiting for Parts
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
                {selectedOrder.status === 'waiting_parts' && (
                  <Button onClick={() => updateStatus(selectedOrder, 'in_progress')}>
                    <Play className="h-4 w-4 mr-2" />
                    Resume Work
                  </Button>
                )}
              </div>

              {selectedOrder.completed_at && (
                <div className="text-sm text-slate-500">
                  Completed on {format(new Date(selectedOrder.completed_at), 'MMM d, yyyy h:mm a')}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}