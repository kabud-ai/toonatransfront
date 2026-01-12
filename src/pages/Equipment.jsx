import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
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
  Wrench, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2,
  AlertTriangle,
  Calendar,
  Clock
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function Equipment() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Equipment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Equipment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Equipment.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['equipment'] })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      name: formData.get('name'),
      code: formData.get('code'),
      type: formData.get('type'),
      work_center: formData.get('work_center'),
      manufacturer: formData.get('manufacturer'),
      model: formData.get('model'),
      serial_number: formData.get('serial_number'),
      purchase_date: formData.get('purchase_date'),
      warranty_end_date: formData.get('warranty_end_date'),
      status: formData.get('status') || 'operational',
      maintenance_frequency_days: parseInt(formData.get('maintenance_frequency_days')) || 30,
      notes: formData.get('notes')
    };

    if (selectedEquipment) {
      updateMutation.mutate({ id: selectedEquipment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getMaintenanceStatus = (equip) => {
    if (!equip.next_maintenance_date) return null;
    const daysUntil = differenceInDays(new Date(equip.next_maintenance_date), new Date());
    if (daysUntil < 0) return { label: 'Overdue', color: 'text-red-600 bg-red-50' };
    if (daysUntil <= 7) return { label: `${daysUntil}d`, color: 'text-amber-600 bg-amber-50' };
    return { label: `${daysUntil}d`, color: 'text-green-600 bg-green-50' };
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (value) => (
        <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Equipment',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-slate-500">{row.manufacturer} {row.model}</p>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      )
    },
    {
      key: 'work_center',
      label: 'Work Center',
      render: (value) => value || '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'operating_hours',
      label: 'Operating Hours',
      sortable: true,
      render: (value) => `${(value || 0).toLocaleString()} hrs`
    },
    {
      key: 'next_maintenance_date',
      label: 'Next Maintenance',
      render: (value, row) => {
        const status = getMaintenanceStatus(row);
        if (!value) return '-';
        return (
          <div className="flex items-center gap-2">
            <span>{format(new Date(value), 'MMM d')}</span>
            {status && (
              <Badge className={status.color}>
                {status.label}
              </Badge>
            )}
          </div>
        );
      }
    }
  ];

  const actions = [
    { label: 'View', icon: Eye, onClick: (row) => { setSelectedEquipment(row); setDetailsOpen(true); } },
    { label: 'Edit', icon: Pencil, onClick: (row) => { setSelectedEquipment(row); setDialogOpen(true); } },
    { label: 'Delete', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipment"
        description="Manage machines and maintenance schedules"
        icon={Wrench}
        breadcrumbs={['Maintenance', 'Equipment']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedEquipment(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={equipment}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={(row) => { setSelectedEquipment(row); setDetailsOpen(true); }}
        emptyMessage="No equipment registered"
        emptyIcon={Wrench}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEquipment ? 'Edit Equipment' : 'New Equipment'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input 
                  name="name" 
                  defaultValue={selectedEquipment?.name}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input 
                  name="code" 
                  defaultValue={selectedEquipment?.code}
                  required 
                  placeholder="e.g., EQ-001"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select name="type" defaultValue={selectedEquipment?.type || 'machine'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="machine">Machine</SelectItem>
                    <SelectItem value="tool">Tool</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="measuring">Measuring</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Center</Label>
                <Input 
                  name="work_center" 
                  defaultValue={selectedEquipment?.work_center}
                  placeholder="e.g., Assembly Line 1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Manufacturer</Label>
                <Input 
                  name="manufacturer" 
                  defaultValue={selectedEquipment?.manufacturer}
                />
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Input 
                  name="model" 
                  defaultValue={selectedEquipment?.model}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Serial Number</Label>
                <Input 
                  name="serial_number" 
                  defaultValue={selectedEquipment?.serial_number}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={selectedEquipment?.status || 'operational'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input 
                  name="purchase_date" 
                  type="date"
                  defaultValue={selectedEquipment?.purchase_date}
                />
              </div>
              <div className="space-y-2">
                <Label>Warranty End</Label>
                <Input 
                  name="warranty_end_date" 
                  type="date"
                  defaultValue={selectedEquipment?.warranty_end_date}
                />
              </div>
              <div className="space-y-2">
                <Label>Maintenance Frequency (days)</Label>
                <Input 
                  name="maintenance_frequency_days" 
                  type="number"
                  defaultValue={selectedEquipment?.maintenance_frequency_days || 30}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                name="notes"
                defaultValue={selectedEquipment?.notes}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedEquipment ? 'Update' : 'Create'}
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
              <span>{selectedEquipment?.name}</span>
              <StatusBadge status={selectedEquipment?.status} />
            </DialogTitle>
          </DialogHeader>
          
          {selectedEquipment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Code</p>
                  <p className="font-mono font-medium">{selectedEquipment.code}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Type</p>
                  <p className="font-medium capitalize">{selectedEquipment.type}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Work Center</p>
                  <p className="font-medium">{selectedEquipment.work_center || '-'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Manufacturer</p>
                  <p className="font-medium">{selectedEquipment.manufacturer || '-'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Model</p>
                  <p className="font-medium">{selectedEquipment.model || '-'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Operating Hours</p>
                  <p className="font-medium">{(selectedEquipment.operating_hours || 0).toLocaleString()} hrs</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium">Last Maintenance</span>
                  </div>
                  <p className="text-lg font-medium">
                    {selectedEquipment.last_maintenance_date 
                      ? format(new Date(selectedEquipment.last_maintenance_date), 'MMM d, yyyy')
                      : 'Never'
                    }
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium">Next Maintenance</span>
                  </div>
                  <p className="text-lg font-medium">
                    {selectedEquipment.next_maintenance_date 
                      ? format(new Date(selectedEquipment.next_maintenance_date), 'MMM d, yyyy')
                      : 'Not scheduled'
                    }
                  </p>
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