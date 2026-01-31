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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ClipboardCheck, 
  Plus, 
  Eye, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function QualityInspections() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [checkpoints, setCheckpoints] = useState([]);

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['qualityInspections'],
    queryFn: () => base44.entities.QualityInspection.list('-created_date', 100)
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.QualityInspection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualityInspections'] });
      setDialogOpen(false);
      setCheckpoints([]);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.QualityInspection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualityInspections'] });
      setDialogOpen(false);
      setDetailsOpen(false);
    }
  });

  const generateInspectionNumber = () => {
    const year = new Date().getFullYear();
    const count = inspections.length + 1;
    return `QC-${year}-${String(count).padStart(4, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = products.find(p => p.id === formData.get('product_id'));
    
    const data = {
      inspection_number: selectedInspection?.inspection_number || generateInspectionNumber(),
      type: formData.get('type'),
      product_id: formData.get('product_id'),
      product_name: product?.name,
      lot_number: formData.get('lot_number'),
      quantity_inspected: parseInt(formData.get('quantity_inspected')),
      reference: formData.get('reference'),
      status: 'pending',
      checkpoints: checkpoints,
      notes: formData.get('notes')
    };

    if (selectedInspection) {
      updateMutation.mutate({ id: selectedInspection.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addCheckpoint = () => {
    setCheckpoints([...checkpoints, {
      name: '',
      specification: '',
      measured_value: '',
      passed: null,
      notes: ''
    }]);
  };

  const updateCheckpoint = (index, field, value) => {
    const updated = [...checkpoints];
    updated[index][field] = value;
    setCheckpoints(updated);
  };

  const submitInspectionResult = (inspection, result) => {
    const passedCount = inspection.checkpoints?.filter(c => c.passed === true).length || 0;
    const totalCount = inspection.checkpoints?.length || 0;
    
    updateMutation.mutate({
      id: inspection.id,
      data: {
        status: result,
        inspection_date: new Date().toISOString(),
        quantity_passed: result === 'passed' ? inspection.quantity_inspected : 
                         result === 'conditional' ? Math.floor(inspection.quantity_inspected * 0.8) : 0,
        quantity_failed: result === 'failed' ? inspection.quantity_inspected :
                         result === 'conditional' ? Math.floor(inspection.quantity_inspected * 0.2) : 0
      }
    });
  };

  // Stats
  const pendingCount = inspections.filter(i => i.status === 'pending').length;
  const passedCount = inspections.filter(i => i.status === 'passed').length;
  const failedCount = inspections.filter(i => i.status === 'failed').length;
  const passRate = inspections.length > 0 
    ? Math.round((passedCount / inspections.filter(i => i.status !== 'pending').length) * 100) || 0
    : 0;

  const columns = [
    {
      key: 'inspection_number',
      label: 'Inspection #',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">
          {value}
        </span>
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
      key: 'product_name',
      label: 'Product',
      sortable: true
    },
    {
      key: 'lot_number',
      label: 'Lot #',
      render: (value) => value || '-'
    },
    {
      key: 'quantity_inspected',
      label: 'Qty Inspected',
      render: (value) => value?.toLocaleString() || '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'inspection_date',
      label: 'Date',
      sortable: true,
      render: (value) => value ? format(new Date(value), 'MMM d, yyyy') : 'Pending'
    }
  ];

  const actions = [
    { label: 'View / Inspect', icon: Eye, onClick: (row) => { setSelectedInspection(row); setDetailsOpen(true); } }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('quality.title')}
        description={t('quality.description')}
        icon={ClipboardCheck}
        breadcrumbs={[t('nav.quality'), t('quality.inspections') || 'Inspections']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { 
              setSelectedInspection(null); 
              setCheckpoints([]);
              setDialogOpen(true); 
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('quality.addInspection')}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending"
          value={pendingCount}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Passed"
          value={passedCount}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Failed"
          value={failedCount}
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="Pass Rate"
          value={`${passRate}%`}
          icon={TrendingUp}
          color={passRate >= 95 ? 'green' : passRate >= 85 ? 'amber' : 'red'}
        />
      </div>

      <DataTable
        columns={columns}
        data={inspections}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={(row) => { setSelectedInspection(row); setDetailsOpen(true); }}
        emptyMessage="No inspections found"
        emptyIcon={ClipboardCheck}
      />

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Quality Inspection</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inspection Type *</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incoming">Incoming</SelectItem>
                    <SelectItem value="in_process">In Process</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="periodic">Periodic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Product *</Label>
                <Select name="product_id" required>
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
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lot Number</Label>
                <Input name="lot_number" placeholder="e.g., LOT-2024-001" />
              </div>
              <div className="space-y-2">
                <Label>Quantity to Inspect *</Label>
                <Input name="quantity_inspected" type="number" required min="1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reference (MO/PO)</Label>
              <Input name="reference" placeholder="e.g., MO-2024-0001" />
            </div>

            {/* Checkpoints */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Quality Checkpoints</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCheckpoint}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Checkpoint
                </Button>
              </div>
              {checkpoints.map((cp, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <Input
                    placeholder="Check name"
                    value={cp.name}
                    onChange={(e) => updateCheckpoint(idx, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Specification"
                    value={cp.specification}
                    onChange={(e) => updateCheckpoint(idx, 'specification', e.target.value)}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCheckpoints(checkpoints.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea name="notes" rows={2} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                Create Inspection
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details/Inspect Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedInspection?.inspection_number}</span>
              <StatusBadge status={selectedInspection?.status} />
            </DialogTitle>
          </DialogHeader>
          
          {selectedInspection && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Product</p>
                  <p className="font-medium">{selectedInspection.product_name}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Lot #</p>
                  <p className="font-medium">{selectedInspection.lot_number || '-'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Qty Inspected</p>
                  <p className="font-medium">{selectedInspection.quantity_inspected}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Type</p>
                  <p className="font-medium capitalize">{selectedInspection.type?.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {selectedInspection.checkpoints?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Checkpoints</h3>
                  <div className="border rounded-lg divide-y">
                    {selectedInspection.checkpoints.map((cp, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{cp.name}</p>
                          <p className="text-sm text-slate-500">Spec: {cp.specification}</p>
                        </div>
                        {cp.passed !== null ? (
                          cp.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedInspection.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 flex-1"
                    onClick={() => submitInspectionResult(selectedInspection, 'passed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Pass
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => submitInspectionResult(selectedInspection, 'conditional')}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Conditional
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={() => submitInspectionResult(selectedInspection, 'failed')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Fail
                  </Button>
                </div>
              )}

              {selectedInspection.status !== 'pending' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Passed</p>
                    <p className="text-2xl font-semibold text-green-700 dark:text-green-300">
                      {selectedInspection.quantity_passed || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">Failed</p>
                    <p className="text-2xl font-semibold text-red-700 dark:text-red-300">
                      {selectedInspection.quantity_failed || 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}