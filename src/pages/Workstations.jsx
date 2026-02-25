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
import { Factory, Plus, Pencil, Trash2, CheckCircle, AlertTriangle, WrenchIcon, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function Workstations() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({});

  const { data: workstations = [], isLoading } = useQuery({
    queryKey: ['workstations'],
    queryFn: () => base44.entities.Workstation.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Workstation.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workstations'] }); setDialogOpen(false); toast.success('Poste créé'); }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Workstation.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workstations'] }); setDialogOpen(false); toast.success('Poste mis à jour'); }
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Workstation.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workstations'] }); toast.success('Poste supprimé'); }
  });

  const openCreate = () => { setSelected(null); setFormData({}); setDialogOpen(true); };
  const openEdit = (row) => { setSelected(row); setFormData(row); setDialogOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected) updateMutation.mutate({ id: selected.id, data: formData });
    else createMutation.mutate(formData);
  };

  const active = workstations.filter(w => w.status === 'active').length;
  const maintenance = workstations.filter(w => w.status === 'maintenance').length;
  const machines = workstations.filter(w => w.type === 'machine').length;
  const human = workstations.filter(w => w.type === 'human').length;

  const columns = [
    { key: 'code', label: 'Code', sortable: true, render: (v) => <span className="font-mono text-sky-600 font-medium">{v}</span> },
    { key: 'name', label: 'Poste de Travail', sortable: true, render: (v, row) => (
      <div><p className="font-medium">{v}</p><p className="text-xs text-slate-500">{row.department}</p></div>
    )},
    { key: 'type', label: 'Type', render: (v) => (
      <Badge variant="outline" className="capitalize">{v === 'machine' ? '⚙️ Machine' : v === 'human' ? '👤 Humain' : '🔀 Hybride'}</Badge>
    )},
    { key: 'capacity_per_hour', label: 'Capacité/h', sortable: true, render: (v) => <span>{v} u/h</span> },
    { key: 'cost_per_hour', label: 'Coût/h', sortable: true, render: (v) => <span>{v} €/h</span> },
    { key: 'working_hours_start', label: 'Horaires', render: (v, row) => <span className="text-sm">{row.working_hours_start} - {row.working_hours_end}</span> },
    { key: 'status', label: 'Statut', render: (v) => <StatusBadge status={v} /> },
  ];

  const actions = [
    { label: 'Modifier', icon: Pencil, onClick: openEdit },
    { label: 'Supprimer', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Postes de Travail"
        description="Gérez vos ateliers, machines et postes de fabrication"
        icon={Factory}
        breadcrumbs={['Production', 'Postes de Travail']}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />Nouveau Poste
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Actifs" value={active} icon={CheckCircle} color="green" />
        <StatCard title="En Maintenance" value={maintenance} icon={WrenchIcon} color="amber" />
        <StatCard title="Machines" value={machines} icon={Factory} color="sky" />
        <StatCard title="Postes Humains" value={human} icon={Users} color="indigo" />
      </div>

      <DataTable
        columns={columns}
        data={workstations}
        loading={isLoading}
        actions={actions}
        emptyMessage="Aucun poste de travail"
        emptyIcon={Factory}
        exportFileName="postes_travail"
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['workstations'] })}
        filterOptions={{
          status: [
            { label: 'Actif', value: 'active' },
            { label: 'Maintenance', value: 'maintenance' },
            { label: 'Inactif', value: 'inactive' },
          ],
          type: [
            { label: 'Machine', value: 'machine' },
            { label: 'Humain', value: 'human' },
            { label: 'Hybride', value: 'hybrid' },
          ]
        }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selected ? 'Modifier le poste' : 'Nouveau Poste de Travail'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} required placeholder="WS-001" />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ligne d'assemblage 1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type || 'machine'} onValueChange={v => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="machine">Machine</SelectItem>
                    <SelectItem value="human">Humain</SelectItem>
                    <SelectItem value="hybrid">Hybride</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={formData.status || 'active'} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Département</Label>
                <Input value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} placeholder="Atelier A" />
              </div>
              <div className="space-y-2">
                <Label>Opérateur Principal</Label>
                <Input value={formData.operator || ''} onChange={e => setFormData({...formData, operator: e.target.value})} placeholder="Nom de l'opérateur" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Capacité/heure</Label>
                <Input type="number" value={formData.capacity_per_hour || 1} onChange={e => setFormData({...formData, capacity_per_hour: parseFloat(e.target.value)})} min="0" />
              </div>
              <div className="space-y-2">
                <Label>Coût/heure (€)</Label>
                <Input type="number" value={formData.cost_per_hour || 0} onChange={e => setFormData({...formData, cost_per_hour: parseFloat(e.target.value)})} min="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure Début</Label>
                <Input type="time" value={formData.working_hours_start || '08:00'} onChange={e => setFormData({...formData, working_hours_start: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Heure Fin</Label>
                <Input type="time" value={formData.working_hours_end || '17:00'} onChange={e => setFormData({...formData, working_hours_end: e.target.value})} />
              </div>
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