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
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ClipboardList, Plus, Pencil, Trash2, Play, CheckCircle, Clock, PauseCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function JobCards() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({});

  const { data: jobCards = [], isLoading } = useQuery({
    queryKey: ['jobCards'],
    queryFn: () => base44.entities.JobCard.list('-created_date', 100)
  });
  const { data: orders = [] } = useQuery({
    queryKey: ['manufacturingOrders'],
    queryFn: () => base44.entities.ManufacturingOrder.list()
  });
  const { data: workstations = [] } = useQuery({
    queryKey: ['workstations'],
    queryFn: () => base44.entities.Workstation.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.JobCard.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobCards'] }); setDialogOpen(false); toast.success('Fiche créée'); }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JobCard.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobCards'] }); setDialogOpen(false); toast.success('Fiche mise à jour'); }
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.JobCard.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobCards'] }); toast.success('Fiche supprimée'); }
  });

  const generateCardNumber = () => {
    const count = jobCards.length + 1;
    return `JC-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
  };

  const openCreate = () => { setSelected(null); setFormData({ card_number: generateCardNumber() }); setDialogOpen(true); };
  const openEdit = (row) => { setSelected(row); setFormData(row); setDialogOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const order = orders.find(o => o.id === formData.manufacturing_order_id);
    const ws = workstations.find(w => w.id === formData.workstation_id);
    const data = {
      ...formData,
      manufacturing_order_number: order?.order_number,
      product_name: order?.product_name,
      workstation_name: ws?.name,
    };
    if (selected) updateMutation.mutate({ id: selected.id, data });
    else createMutation.mutate(data);
  };

  const updateStatus = (card, status) => {
    const updates = { status };
    if (status === 'in_progress' && !card.actual_start) updates.actual_start = new Date().toISOString();
    if (status === 'completed') updates.actual_end = new Date().toISOString();
    updateMutation.mutate({ id: card.id, data: updates });
  };

  const open = jobCards.filter(j => j.status === 'open').length;
  const inProgress = jobCards.filter(j => j.status === 'in_progress').length;
  const completed = jobCards.filter(j => j.status === 'completed').length;
  const onHold = jobCards.filter(j => j.status === 'on_hold').length;

  const columns = [
    { key: 'card_number', label: 'Fiche #', sortable: true, render: (v) => <span className="font-mono text-sky-600 font-medium">{v}</span> },
    { key: 'manufacturing_order_number', label: 'OdF', sortable: true, render: (v) => <span className="font-mono text-indigo-600">{v}</span> },
    { key: 'operation', label: 'Opération', sortable: true, render: (v, row) => (
      <div><p className="font-medium">{v}</p><p className="text-xs text-slate-500">Seq. {row.sequence}</p></div>
    )},
    { key: 'workstation_name', label: 'Poste', sortable: true },
    { key: 'assigned_to', label: 'Opérateur' },
    { key: 'quantity_to_produce', label: 'Qté', render: (v, row) => (
      <div>
        <p className="font-medium">{row.quantity_produced || 0} / {v}</p>
        <Progress value={v ? ((row.quantity_produced || 0) / v) * 100 : 0} className="h-1.5 mt-1 w-20" />
      </div>
    )},
    { key: 'planned_hours', label: 'Heures', render: (v, row) => (
      <span>{row.actual_hours || 0}h / {v || 0}h</span>
    )},
    { key: 'status', label: 'Statut', render: (v) => <StatusBadge status={v} /> },
  ];

  const actions = [
    { label: 'Démarrer', icon: Play, onClick: (row) => updateStatus(row, 'in_progress'), disabled: (row) => row.status !== 'open' },
    { label: 'Mettre en pause', icon: PauseCircle, onClick: (row) => updateStatus(row, 'on_hold'), disabled: (row) => row.status !== 'in_progress' },
    { label: 'Terminer', icon: CheckCircle, onClick: (row) => updateStatus(row, 'completed'), disabled: (row) => !['in_progress', 'on_hold'].includes(row.status) },
    { label: 'Modifier', icon: Pencil, onClick: openEdit },
    { label: 'Supprimer', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fiches de Travail (Job Cards)"
        description="Suivi des opérations par poste de travail"
        icon={ClipboardList}
        breadcrumbs={['Production', 'Fiches de Travail']}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />Nouvelle Fiche
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ouvertes" value={open} icon={Clock} color="slate" />
        <StatCard title="En Cours" value={inProgress} icon={Play} color="sky" />
        <StatCard title="En Pause" value={onHold} icon={PauseCircle} color="amber" />
        <StatCard title="Terminées" value={completed} icon={CheckCircle} color="green" />
      </div>

      <DataTable
        columns={columns}
        data={jobCards}
        loading={isLoading}
        actions={actions}
        emptyMessage="Aucune fiche de travail"
        emptyIcon={ClipboardList}
        exportFileName="job_cards"
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['jobCards'] })}
        filterOptions={{
          status: [
            { label: 'Ouverte', value: 'open' },
            { label: 'En cours', value: 'in_progress' },
            { label: 'En pause', value: 'on_hold' },
            { label: 'Terminée', value: 'completed' },
          ]
        }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selected ? 'Modifier la Fiche' : 'Nouvelle Fiche de Travail'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>OdF *</Label>
                <Select value={formData.manufacturing_order_id || ''} onValueChange={v => setFormData({...formData, manufacturing_order_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Ordre de fabrication" /></SelectTrigger>
                  <SelectContent>
                    {orders.map(o => <SelectItem key={o.id} value={o.id}>{o.order_number} — {o.product_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Poste de Travail *</Label>
                <Select value={formData.workstation_id || ''} onValueChange={v => setFormData({...formData, workstation_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {workstations.filter(w => w.status === 'active').map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Opération *</Label>
                <Input value={formData.operation || ''} onChange={e => setFormData({...formData, operation: e.target.value})} required placeholder="ex: Découpe, Assemblage" />
              </div>
              <div className="space-y-2">
                <Label>Séquence</Label>
                <Input type="number" value={formData.sequence || 1} onChange={e => setFormData({...formData, sequence: parseInt(e.target.value)})} min="1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantité à produire</Label>
                <Input type="number" value={formData.quantity_to_produce || ''} onChange={e => setFormData({...formData, quantity_to_produce: parseFloat(e.target.value)})} min="0" />
              </div>
              <div className="space-y-2">
                <Label>Heures prévues</Label>
                <Input type="number" value={formData.planned_hours || ''} onChange={e => setFormData({...formData, planned_hours: parseFloat(e.target.value)})} min="0" step="0.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Opérateur Assigné</Label>
                <Input value={formData.assigned_to || ''} onChange={e => setFormData({...formData, assigned_to: e.target.value})} placeholder="Nom opérateur" />
              </div>
              <div className="space-y-2">
                <Label>Début Planifié</Label>
                <Input type="datetime-local" value={formData.planned_start?.slice(0, 16) || ''} onChange={e => setFormData({...formData, planned_start: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit">{selected ? 'Mettre à jour' : 'Créer'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}