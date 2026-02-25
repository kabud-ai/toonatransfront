import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { GitBranch, Plus, Pencil, Trash2, CheckCircle, Clock, PlusCircle, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Routings() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ operations: [] });
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: routings = [], isLoading } = useQuery({
    queryKey: ['routings'],
    queryFn: () => base44.entities.Routing.list()
  });
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });
  const { data: workstations = [] } = useQuery({
    queryKey: ['workstations'],
    queryFn: () => base44.entities.Workstation.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Routing.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['routings'] }); setDialogOpen(false); toast.success('Gamme créée'); }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Routing.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['routings'] }); setDialogOpen(false); toast.success('Gamme mise à jour'); }
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Routing.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['routings'] }); toast.success('Gamme supprimée'); }
  });

  const openCreate = () => {
    setSelected(null);
    setFormData({ operations: [], status: 'draft' });
    setDialogOpen(true);
  };
  const openEdit = (row) => {
    setSelected(row);
    setFormData({ ...row, operations: row.operations || [] });
    setDialogOpen(true);
  };

  const addOperation = () => {
    setFormData(prev => ({
      ...prev,
      operations: [...(prev.operations || []), { sequence: (prev.operations?.length || 0) + 1, operation_name: '', planned_hours: 0 }]
    }));
  };

  const updateOperation = (idx, field, value) => {
    setFormData(prev => {
      const ops = [...prev.operations];
      ops[idx] = { ...ops[idx], [field]: value };
      if (field === 'workstation_id') {
        const ws = workstations.find(w => w.id === value);
        ops[idx].workstation_name = ws?.name || '';
        ops[idx].cost_per_hour = ws?.cost_per_hour || 0;
      }
      return { ...prev, operations: ops };
    });
  };

  const removeOperation = (idx) => {
    setFormData(prev => ({ ...prev, operations: prev.operations.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const product = products.find(p => p.id === formData.product_id);
    const totalHours = (formData.operations || []).reduce((sum, op) => sum + (parseFloat(op.planned_hours) || 0), 0);
    const data = { ...formData, product_name: product?.name, total_planned_hours: totalHours };
    if (selected) updateMutation.mutate({ id: selected.id, data });
    else createMutation.mutate(data);
  };

  const active = routings.filter(r => r.status === 'active').length;
  const draft = routings.filter(r => r.status === 'draft').length;

  const columns = [
    { key: 'code', label: 'Code', sortable: true, render: (v) => <span className="font-mono text-sky-600 font-medium">{v}</span> },
    { key: 'name', label: 'Gamme de Fabrication', sortable: true, render: (v, row) => (
      <div><p className="font-medium">{v}</p><p className="text-xs text-slate-500">{row.product_name}</p></div>
    )},
    { key: 'operations', label: 'Opérations', render: (v) => <Badge variant="outline">{(v || []).length} opération(s)</Badge> },
    { key: 'total_planned_hours', label: 'Durée Totale', sortable: true, render: (v) => <span>{(v || 0).toFixed(1)}h</span> },
    { key: 'status', label: 'Statut', render: (v) => <StatusBadge status={v} /> },
  ];

  const actions = [
    { label: 'Voir le Détail', icon: CheckCircle, onClick: (row) => { setSelected(row); setDetailsOpen(true); } },
    { label: 'Modifier', icon: Pencil, onClick: openEdit },
    { label: 'Supprimer', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gammes de Fabrication (Routings)"
        description="Définissez les séquences d'opérations par produit"
        icon={GitBranch}
        breadcrumbs={['Production', 'Gammes']}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />Nouvelle Gamme
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Gammes Actives" value={active} icon={CheckCircle} color="green" />
        <StatCard title="Brouillons" value={draft} icon={Clock} color="amber" />
        <StatCard title="Total Gammes" value={routings.length} icon={GitBranch} color="sky" />
      </div>

      <DataTable
        columns={columns}
        data={routings}
        loading={isLoading}
        actions={actions}
        emptyMessage="Aucune gamme de fabrication"
        emptyIcon={GitBranch}
        exportFileName="gammes"
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['routings'] })}
        filterOptions={{
          status: [
            { label: 'Active', value: 'active' },
            { label: 'Brouillon', value: 'draft' },
            { label: 'Obsolète', value: 'obsolete' },
          ]
        }}
      />

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? 'Modifier la Gamme' : 'Nouvelle Gamme de Fabrication'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} required placeholder="RTG-001" />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Produit</Label>
                <Select value={formData.product_id || ''} onValueChange={v => setFormData({...formData, product_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={formData.status || 'draft'} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="obsolete">Obsolète</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Operations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Séquence d'Opérations</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOperation}>
                  <PlusCircle className="h-4 w-4 mr-1" />Ajouter
                </Button>
              </div>
              {(formData.operations || []).length === 0 && (
                <div className="text-center py-4 text-slate-400 border-2 border-dashed rounded-lg text-sm">
                  Aucune opération. Cliquez sur "Ajouter" pour commencer.
                </div>
              )}
              {(formData.operations || []).map((op, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Opération {op.sequence}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeOperation(idx)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Nom de l'opération" value={op.operation_name || ''} onChange={e => updateOperation(idx, 'operation_name', e.target.value)} />
                    <Select value={op.workstation_id || ''} onValueChange={v => updateOperation(idx, 'workstation_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Poste de travail" /></SelectTrigger>
                      <SelectContent>
                        {workstations.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" placeholder="Heures prévues" value={op.planned_hours || ''} onChange={e => updateOperation(idx, 'planned_hours', e.target.value)} min="0" step="0.5" />
                    <Input placeholder="Description" value={op.description || ''} onChange={e => updateOperation(idx, 'description', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit">{selected ? 'Mettre à jour' : 'Créer'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              {selected?.name} — {selected?.code}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Produit</p>
                  <p className="font-medium text-sm">{selected.product_name || '—'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Durée Totale</p>
                  <p className="font-medium">{(selected.total_planned_hours || 0).toFixed(1)}h</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">Statut</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-sm text-slate-700 dark:text-slate-300">Séquence d'Opérations :</p>
                {(selected.operations || []).map((op, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <div className="h-7 w-7 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-700 dark:text-sky-400 font-bold text-sm flex-shrink-0">
                      {op.sequence}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{op.operation_name}</p>
                      <p className="text-xs text-slate-500">{op.workstation_name} — {op.planned_hours}h prévues</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}