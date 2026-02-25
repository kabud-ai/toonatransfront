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
import { Truck, Plus, Pencil, Trash2, Send, CheckCircle, Clock, DollarSign, PlusCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Subcontracting() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ components_sent: [] });
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['subcontractingOrders'],
    queryFn: () => base44.entities.SubcontractingOrder.list('-created_date', 100)
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
    mutationFn: (data) => base44.entities.SubcontractingOrder.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subcontractingOrders'] }); setDialogOpen(false); toast.success('Ordre créé'); }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SubcontractingOrder.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subcontractingOrders'] }); setDialogOpen(false); setDetailsOpen(false); toast.success('Ordre mis à jour'); }
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SubcontractingOrder.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['subcontractingOrders'] }); toast.success('Ordre supprimé'); }
  });

  const generateNumber = () => `SC-${new Date().getFullYear()}-${String(orders.length + 1).padStart(4, '0')}`;

  const openCreate = () => { setSelected(null); setFormData({ order_number: generateNumber(), components_sent: [] }); setDialogOpen(true); };
  const openEdit = (row) => { setSelected(row); setFormData({ ...row, components_sent: row.components_sent || [] }); setDialogOpen(true); };

  const addComponent = () => {
    setFormData(prev => ({ ...prev, components_sent: [...(prev.components_sent || []), { product_id: '', quantity: 0 }] }));
  };
  const updateComponent = (idx, field, value) => {
    setFormData(prev => {
      const comps = [...prev.components_sent];
      comps[idx] = { ...comps[idx], [field]: value };
      if (field === 'product_id') {
        const p = products.find(pr => pr.id === value);
        comps[idx].product_name = p?.name || '';
        comps[idx].unit = p?.unity || '';
      }
      return { ...prev, components_sent: comps };
    });
  };
  const removeComponent = (idx) => {
    setFormData(prev => ({ ...prev, components_sent: prev.components_sent.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const supplier = suppliers.find(s => s.id === formData.supplier_id);
    const product = products.find(p => p.id === formData.product_id);
    const qty = parseFloat(formData.quantity || 0);
    const unitCost = parseFloat(formData.unit_cost || 0);
    const data = { ...formData, supplier_name: supplier?.name, product_name: product?.name, quantity: qty, unit_cost: unitCost, total_cost: qty * unitCost };
    if (selected) updateMutation.mutate({ id: selected.id, data });
    else createMutation.mutate(data);
  };

  const updateStatus = (order, status) => {
    updateMutation.mutate({ id: order.id, data: { status } });
  };

  const pending = orders.filter(o => ['draft', 'sent'].includes(o.status)).length;
  const inProgress = orders.filter(o => o.status === 'in_progress').length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const totalCost = orders.reduce((sum, o) => sum + (o.total_cost || 0), 0);

  const columns = [
    { key: 'order_number', label: 'N° Ordre', sortable: true, render: (v) => <span className="font-mono text-sky-600 font-medium">{v}</span> },
    { key: 'product_name', label: 'Produit', sortable: true },
    { key: 'supplier_name', label: 'Sous-Traitant', sortable: true },
    { key: 'quantity', label: 'Qté', sortable: true, render: (v, row) => <span>{v} {row.unit}</span> },
    { key: 'total_cost', label: 'Coût', sortable: true, render: (v) => <span className="font-medium">{(v || 0).toFixed(2)} €</span> },
    { key: 'planned_end', label: 'Livraison', sortable: true, render: (v) => v ? format(new Date(v), 'dd/MM/yyyy') : '—' },
    { key: 'status', label: 'Statut', render: (v) => <StatusBadge status={v} /> },
  ];

  const actions = [
    { label: 'Voir Détail', icon: CheckCircle, onClick: (row) => { setSelected(row); setDetailsOpen(true); } },
    { label: 'Envoyer', icon: Send, onClick: (row) => updateStatus(row, 'sent'), disabled: (row) => row.status !== 'draft' },
    { label: 'En cours', icon: Truck, onClick: (row) => updateStatus(row, 'in_progress'), disabled: (row) => row.status !== 'sent' },
    { label: 'Terminer', icon: CheckCircle, onClick: (row) => updateStatus(row, 'completed'), disabled: (row) => row.status !== 'in_progress' },
    { label: 'Modifier', icon: Pencil, onClick: openEdit },
    { label: 'Supprimer', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sous-Traitance"
        description="Gestion des ordres de sous-traitance externe"
        icon={Truck}
        breadcrumbs={['Production', 'Sous-Traitance']}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />Nouvel Ordre
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="En Attente/Envoyé" value={pending} icon={Clock} color="amber" />
        <StatCard title="En Cours" value={inProgress} icon={Truck} color="sky" />
        <StatCard title="Terminés" value={completed} icon={CheckCircle} color="green" />
        <StatCard title="Coût Total" value={`${totalCost.toFixed(0)} €`} icon={DollarSign} color="indigo" />
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={isLoading}
        actions={actions}
        emptyMessage="Aucun ordre de sous-traitance"
        emptyIcon={Truck}
        exportFileName="sous_traitance"
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['subcontractingOrders'] })}
        filterOptions={{
          status: [
            { label: 'Brouillon', value: 'draft' },
            { label: 'Envoyé', value: 'sent' },
            { label: 'En cours', value: 'in_progress' },
            { label: 'Terminé', value: 'completed' },
            { label: 'Annulé', value: 'cancelled' },
          ]
        }}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected ? 'Modifier l\'Ordre' : 'Nouvel Ordre de Sous-Traitance'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sous-Traitant *</Label>
                <Select value={formData.supplier_id || ''} onValueChange={v => setFormData({...formData, supplier_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Produit *</Label>
                <Select value={formData.product_id || ''} onValueChange={v => setFormData({...formData, product_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantité *</Label>
                <Input type="number" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: e.target.value})} required min="1" />
              </div>
              <div className="space-y-2">
                <Label>Unité</Label>
                <Input value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="pcs, kg..." />
              </div>
              <div className="space-y-2">
                <Label>Coût Unitaire (€)</Label>
                <Input type="number" value={formData.unit_cost || ''} onChange={e => setFormData({...formData, unit_cost: e.target.value})} min="0" step="0.01" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Début Planifié</Label>
                <Input type="date" value={formData.planned_start || ''} onChange={e => setFormData({...formData, planned_start: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Fin Planifiée</Label>
                <Input type="date" value={formData.planned_end || ''} onChange={e => setFormData({...formData, planned_end: e.target.value})} />
              </div>
            </div>

            {/* Components */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Composants Envoyés au Sous-Traitant</Label>
                <Button type="button" variant="outline" size="sm" onClick={addComponent}>
                  <PlusCircle className="h-4 w-4 mr-1" />Ajouter
                </Button>
              </div>
              {(formData.components_sent || []).map((comp, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                  <Select value={comp.product_id || ''} onValueChange={v => updateComponent(idx, 'product_id', v)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Produit/MP" /></SelectTrigger>
                    <SelectContent>
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input className="w-24" type="number" placeholder="Qté" value={comp.quantity || ''} onChange={e => updateComponent(idx, 'quantity', e.target.value)} min="0" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeComponent(idx)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
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

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />{selected?.order_number}
              <StatusBadge status={selected?.status} />
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Sous-Traitant', value: selected.supplier_name },
                  { label: 'Produit', value: selected.product_name },
                  { label: 'Quantité', value: `${selected.quantity} ${selected.unit}` },
                  { label: 'Coût Total', value: `${(selected.total_cost || 0).toFixed(2)} €` },
                  { label: 'Livraison Prévue', value: selected.planned_end ? format(new Date(selected.planned_end), 'dd/MM/yyyy') : '—' },
                  { label: 'Livraison Réelle', value: selected.actual_delivery ? format(new Date(selected.actual_delivery), 'dd/MM/yyyy') : '—' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                    <p className="font-medium text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
              {(selected.components_sent || []).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Composants Envoyés :</p>
                  <div className="space-y-1">
                    {selected.components_sent.map((comp, idx) => (
                      <div key={idx} className="flex justify-between text-sm bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                        <span>{comp.product_name}</span>
                        <Badge variant="outline">{comp.quantity} {comp.unit}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {selected.status === 'draft' && <Button size="sm" onClick={() => updateStatus(selected, 'sent')}><Send className="h-4 w-4 mr-1" />Envoyer</Button>}
                {selected.status === 'sent' && <Button size="sm" onClick={() => updateStatus(selected, 'in_progress')}><Truck className="h-4 w-4 mr-1" />Marquer En Cours</Button>}
                {selected.status === 'in_progress' && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(selected, 'completed')}><CheckCircle className="h-4 w-4 mr-1" />Terminer</Button>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}