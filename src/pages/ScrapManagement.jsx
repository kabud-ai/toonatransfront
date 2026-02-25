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
import { Trash2, Plus, AlertTriangle, DollarSign, BarChart3, PackageX } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const REASONS = [
  { value: 'defect', label: '🔴 Défaut qualité' },
  { value: 'breakage', label: '💥 Casse' },
  { value: 'overflow', label: '📦 Surplus' },
  { value: 'quality_reject', label: '❌ Rejet qualité' },
  { value: 'other', label: '❓ Autre' },
];

export default function ScrapManagement() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({});

  const { data: scraps = [], isLoading } = useQuery({
    queryKey: ['scraps'],
    queryFn: () => base44.entities.ScrapEntry.list('-created_date', 100)
  });
  const { data: orders = [] } = useQuery({
    queryKey: ['manufacturingOrders'],
    queryFn: () => base44.entities.ManufacturingOrder.list()
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
    mutationFn: (data) => base44.entities.ScrapEntry.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['scraps'] }); setDialogOpen(false); toast.success('Rebut enregistré'); }
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ScrapEntry.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['scraps'] }); toast.success('Entrée supprimée'); }
  });

  const generateNumber = () => `SCR-${new Date().getFullYear()}-${String(scraps.length + 1).padStart(4, '0')}`;

  const openCreate = () => {
    setSelected(null);
    setFormData({ entry_number: generateNumber(), entry_date: new Date().toISOString().split('T')[0] });
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const product = products.find(p => p.id === formData.product_id);
    const ws = workstations.find(w => w.id === formData.workstation_id);
    const order = orders.find(o => o.id === formData.manufacturing_order_id);
    const qty = parseFloat(formData.quantity || 0);
    const cost = parseFloat(formData.unit_cost || 0);
    const data = {
      ...formData,
      product_name: product?.name,
      workstation_name: ws?.name,
      manufacturing_order_number: order?.order_number,
      quantity: qty,
      unit_cost: cost,
      total_cost: qty * cost,
    };
    createMutation.mutate(data);
  };

  const totalQty = scraps.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const totalCost = scraps.reduce((sum, s) => sum + (s.total_cost || 0), 0);
  const defects = scraps.filter(s => s.reason === 'defect').length;
  const rejections = scraps.filter(s => s.reason === 'quality_reject').length;

  const columns = [
    { key: 'entry_number', label: 'N° Rebut', sortable: true, render: (v) => <span className="font-mono text-red-600 font-medium">{v}</span> },
    { key: 'product_name', label: 'Produit', sortable: true },
    { key: 'manufacturing_order_number', label: 'OdF', render: (v) => <span className="font-mono text-indigo-600">{v || '-'}</span> },
    { key: 'workstation_name', label: 'Poste' },
    { key: 'quantity', label: 'Quantité', sortable: true, render: (v, row) => <span className="font-medium text-red-600">-{v} {row.unit}</span> },
    { key: 'reason', label: 'Motif', render: (v) => {
      const r = REASONS.find(r => r.value === v);
      return <Badge variant="outline">{r?.label || v}</Badge>;
    }},
    { key: 'total_cost', label: 'Coût Total', sortable: true, render: (v) => <span className="font-medium">{(v || 0).toFixed(2)} €</span> },
    { key: 'entry_date', label: 'Date', sortable: true, render: (v) => v ? format(new Date(v), 'dd/MM/yyyy') : '-' },
  ];

  const actions = [
    { label: 'Supprimer', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Rebuts"
        description="Enregistrement et analyse des rebuts de production"
        icon={PackageX}
        breadcrumbs={['Production', 'Rebuts']}
        actions={
          <Button onClick={openCreate} variant="destructive">
            <Plus className="h-4 w-4 mr-2" />Enregistrer un Rebut
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Quantité Totale" value={totalQty} icon={PackageX} color="red" />
        <StatCard title="Coût Total" value={`${totalCost.toFixed(0)} €`} icon={DollarSign} color="red" />
        <StatCard title="Défauts Qualité" value={defects} icon={AlertTriangle} color="amber" />
        <StatCard title="Rejets QC" value={rejections} icon={BarChart3} color="orange" />
      </div>

      <DataTable
        columns={columns}
        data={scraps}
        loading={isLoading}
        actions={actions}
        emptyMessage="Aucun rebut enregistré"
        emptyIcon={PackageX}
        exportFileName="rebuts"
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['scraps'] })}
        filterOptions={{
          reason: REASONS.map(r => ({ label: r.label, value: r.value }))
        }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enregistrer un Rebut</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Produit *</Label>
                <Select value={formData.product_id || ''} onValueChange={v => setFormData({...formData, product_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ordre de Fabrication</Label>
                <Select value={formData.manufacturing_order_id || ''} onValueChange={v => setFormData({...formData, manufacturing_order_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                  <SelectContent>
                    {orders.map(o => <SelectItem key={o.id} value={o.id}>{o.order_number}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Poste de Travail</Label>
                <Select value={formData.workstation_id || ''} onValueChange={v => setFormData({...formData, workstation_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                  <SelectContent>
                    {workstations.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Motif *</Label>
                <Select value={formData.reason || 'defect'} onValueChange={v => setFormData({...formData, reason: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REASONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantité *</Label>
                <Input type="number" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: e.target.value})} required min="0" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Unité</Label>
                <Input value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="kg, pcs..." />
              </div>
              <div className="space-y-2">
                <Label>Coût Unitaire (€)</Label>
                <Input type="number" value={formData.unit_cost || ''} onChange={e => setFormData({...formData, unit_cost: e.target.value})} min="0" step="0.01" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Détail du motif</Label>
              <Textarea value={formData.reason_detail || ''} onChange={e => setFormData({...formData, reason_detail: e.target.value})} rows={2} placeholder="Description du problème..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button type="submit" variant="destructive">Enregistrer le Rebut</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}