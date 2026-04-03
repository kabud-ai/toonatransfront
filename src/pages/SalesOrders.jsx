import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import StatCard from '@/components/common/StatCard';
import { ShoppingBag, Plus, Trash2, Eye, CheckCircle, Truck, XCircle, Package, DollarSign, TrendingUp, ClipboardList, Printer } from 'lucide-react';
import { format } from 'date-fns';
import InvoicePrint from '@/components/sales/InvoicePrint';

const STATUS_CONFIG = {
  draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-700' },
  confirmed: { label: 'Confirmé', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Expédié', color: 'bg-amber-100 text-amber-700' },
  delivered: { label: 'Livré', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700' },
};

const PAYMENT_STATUS_CONFIG = {
  unpaid: { label: 'Non payé', color: 'bg-red-100 text-red-700' },
  partial: { label: 'Partiel', color: 'bg-amber-100 text-amber-700' },
  paid: { label: 'Payé', color: 'bg-green-100 text-green-700' },
};

function generateOrderNumber() {
  const d = new Date();
  return `VTE-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export default function SalesOrders() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lines, setLines] = useState([]);
  const [taxRate, setTaxRate] = useState(0);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: () => base44.entities.SalesOrder.list('-created_date'),
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => base44.entities.Warehouse.list(),
  });

  const { data: stockLevels = [] } = useQuery({
    queryKey: ['stock-levels'],
    queryFn: () => base44.entities.StockLevel.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SalesOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      toast.success('Commande créée avec succès');
      setCreateOpen(false);
      setLines([]);
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SalesOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      toast.success('Commande mise à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SalesOrder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      toast.success('Commande supprimée');
    },
  });

  const handleConfirmDelivery = async (order) => {
    // Décrémenter le stock pour chaque ligne
    for (const line of order.lines || []) {
      const sl = stockLevels.find(s => s.product_id === line.product_id && s.warehouse_id === order.warehouse_id);
      if (sl) {
        const newQty = (sl.quantity || 0) - line.quantity;
        await base44.entities.StockLevel.update(sl.id, {
          quantity: Math.max(0, newQty),
          available_quantity: Math.max(0, newQty - (sl.reserved_quantity || 0)),
        });
        // Enregistrer un mouvement de stock
        await base44.entities.StockMovement.create({
          product_id: line.product_id,
          product_name: line.product_name,
          warehouse_id: order.warehouse_id,
          type: 'out',
          quantity: line.quantity,
          reference: order.order_number,
          notes: `Vente - ${order.customer_name}`,
          movement_date: new Date().toISOString(),
        });
      }
    }
    await updateMutation.mutateAsync({ id: order.id, data: { status: 'delivered', payment_status: 'paid' } });
    queryClient.invalidateQueries({ queryKey: ['stock-levels'] });
    toast.success('Livraison confirmée et stock mis à jour');
    setDetailsOpen(false);
  };

  const addLine = () => setLines(prev => [...prev, { product_id: '', product_name: '', product_sku: '', quantity: 1, unit: 'pcs', unit_price: 0, discount: 0, total_price: 0 }]);

  const removeLine = (i) => setLines(prev => prev.filter((_, idx) => idx !== i));

  const updateLine = (i, field, value) => {
    setLines(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      if (field === 'product_id') {
        const product = products.find(p => p.id === value);
        if (product) {
          updated[i].product_name = product.name;
          updated[i].product_sku = product.sku || '';
          updated[i].unit = product.unity || 'pcs';
          updated[i].unit_price = product.selling_price || 0;
        }
      }
      const qty = parseFloat(updated[i].quantity) || 0;
      const price = parseFloat(updated[i].unit_price) || 0;
      const disc = parseFloat(updated[i].discount) || 0;
      updated[i].total_price = qty * price * (1 - disc / 100);
      return updated;
    });
  };

  const subtotal = lines.reduce((s, l) => s + (l.total_price || 0), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleCreate = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const warehouseId = fd.get('warehouse_id');
    const warehouse = warehouses.find(w => w.id === warehouseId);
    createMutation.mutate({
      order_number: generateOrderNumber(),
      customer_name: fd.get('customer_name'),
      customer_email: fd.get('customer_email'),
      customer_phone: fd.get('customer_phone'),
      customer_address: fd.get('customer_address'),
      warehouse_id: warehouseId,
      warehouse_name: warehouse?.name || '',
      order_date: fd.get('order_date') || new Date().toISOString().split('T')[0],
      delivery_date: fd.get('delivery_date'),
      status: 'confirmed',
      payment_method: fd.get('payment_method'),
      payment_status: 'unpaid',
      notes: fd.get('notes'),
      lines,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: total,
    });
  };

  // Stats
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => ['confirmed', 'shipped'].includes(o.status)).length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  const columns = [
    { key: 'order_number', label: 'N° Commande', sortable: true },
    { key: 'customer_name', label: 'Client', sortable: true },
    { key: 'warehouse_name', label: 'Entrepôt' },
    { key: 'order_date', label: 'Date', render: (v) => v ? format(new Date(v), 'dd/MM/yyyy') : '-' },
    {
      key: 'status', label: 'Statut', render: (v) => {
        const c = STATUS_CONFIG[v] || {};
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
      }
    },
    {
      key: 'payment_status', label: 'Paiement', render: (v) => {
        const c = PAYMENT_STATUS_CONFIG[v] || {};
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
      }
    },
    { key: 'total_amount', label: 'Total', render: (v) => `${(v || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €` },
  ];

  const actions = [
    {
      label: 'Voir détails',
      icon: Eye,
      onClick: (row) => { setSelectedOrder(row); setDetailsOpen(true); }
    },
    {
      label: 'Imprimer facture',
      icon: Printer,
      onClick: (row) => { setSelectedOrder(row); setTimeout(() => document.getElementById('invoice-print-btn')?.click(), 100); }
    },
    {
      label: 'Confirmer livraison',
      icon: CheckCircle,
      onClick: (row) => handleConfirmDelivery(row),
      disabled: (row) => row.status === 'delivered' || row.status === 'cancelled',
    },
    {
      label: 'Supprimer',
      icon: XCircle,
      destructive: true,
      onClick: (row) => deleteMutation.mutate(row.id),
      disabled: (row) => row.status !== 'draft' && row.status !== 'cancelled',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventes"
        description="Gérer les commandes de vente et liquider les produits finis"
        icon={ShoppingBag}
        actions={
          <Button onClick={() => { setLines([]); setTaxRate(0); setCreateOpen(true); }} className="bg-sky-600 hover:bg-sky-700">
            <Plus className="h-4 w-4 mr-2" />Nouvelle Vente
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Chiffre d'affaires" value={`${totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`} icon={DollarSign} color="green" />
        <StatCard title="Commandes en cours" value={pendingOrders} icon={ClipboardList} color="amber" />
        <StatCard title="Livraisons effectuées" value={deliveredOrders} icon={Truck} color="sky" />
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={isLoading}
        actions={actions}
        onRowClick={(row) => { setSelectedOrder(row); setDetailsOpen(true); }}
        emptyMessage="Aucune commande de vente"
        emptyIcon={ShoppingBag}
        exportFileName="ventes"
      />

      {/* Création */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle commande de vente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Client *</Label>
                <Input name="customer_name" required placeholder="Nom du client" />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input name="customer_email" type="email" placeholder="email@exemple.com" />
              </div>
              <div className="space-y-1">
                <Label>Téléphone</Label>
                <Input name="customer_phone" placeholder="+33..." />
              </div>
              <div className="space-y-1">
                <Label>Entrepôt source *</Label>
                <select name="warehouse_id" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Sélectionner...</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Date de commande</Label>
                <Input name="order_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-1">
                <Label>Date de livraison prévue</Label>
                <Input name="delivery_date" type="date" />
              </div>
              <div className="space-y-1">
                <Label>Mode de paiement</Label>
                <select name="payment_method" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="cash">Espèces</option>
                  <option value="bank_transfer">Virement</option>
                  <option value="check">Chèque</option>
                  <option value="credit_card">Carte bancaire</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>TVA (%)</Label>
                <Input type="number" min="0" max="100" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Adresse de livraison</Label>
              <Textarea name="customer_address" rows={2} placeholder="Adresse complète..." />
            </div>

            {/* Lignes de commande */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">Produits à vendre</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4 mr-1" />Ajouter
                </Button>
              </div>
              {lines.length === 0 && (
                <div className="text-center py-6 text-slate-400 border-2 border-dashed rounded-lg">
                  Cliquez sur "Ajouter" pour sélectionner des produits
                </div>
              )}
              <div className="space-y-2">
                {lines.map((line, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg">
                    <div className="col-span-4">
                      <select
                        className="flex h-8 w-full rounded-md border border-input bg-white px-2 py-1 text-sm"
                        value={line.product_id}
                        onChange={e => updateLine(i, 'product_id', e.target.value)}
                        required
                      >
                        <option value="">Produit...</option>
                        {products.filter(p => p.type === 'finished_product' || p.type === 'semi_finished').map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number" min="0.01" step="0.01" placeholder="Qté"
                        value={line.quantity}
                        onChange={e => updateLine(i, 'quantity', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number" min="0" step="0.01" placeholder="Prix U."
                        value={line.unit_price}
                        onChange={e => updateLine(i, 'unit_price', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number" min="0" max="100" placeholder="Remise%"
                        value={line.discount}
                        onChange={e => updateLine(i, 'discount', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-1 text-right text-sm font-medium text-slate-700">
                      {(line.total_price || 0).toFixed(2)}€
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeLine(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {lines.length > 0 && (
                <div className="mt-3 p-3 bg-slate-100 rounded-lg text-right space-y-1">
                  <p className="text-sm text-slate-600">Sous-total HT : <span className="font-medium">{subtotal.toFixed(2)} €</span></p>
                  <p className="text-sm text-slate-600">TVA ({taxRate}%) : <span className="font-medium">{taxAmount.toFixed(2)} €</span></p>
                  <p className="text-base font-bold text-slate-900">Total TTC : {total.toFixed(2)} €</p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea name="notes" rows={2} placeholder="Notes internes..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
              <Button type="submit" className="bg-sky-600 hover:bg-sky-700" disabled={lines.length === 0}>
                Créer la commande
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Détails */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        {selectedOrder && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-sky-600" />
                  {selectedOrder.order_number}
                </div>
                <span id="invoice-print-btn">
                  <InvoicePrint order={selectedOrder} />
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedOrder.status]?.color}`}>
                  {STATUS_CONFIG[selectedOrder.status]?.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_CONFIG[selectedOrder.payment_status]?.color}`}>
                  {PAYMENT_STATUS_CONFIG[selectedOrder.payment_status]?.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Client :</span> <span className="font-medium">{selectedOrder.customer_name}</span></div>
                <div><span className="text-slate-500">Entrepôt :</span> <span className="font-medium">{selectedOrder.warehouse_name}</span></div>
                {selectedOrder.customer_email && <div><span className="text-slate-500">Email :</span> {selectedOrder.customer_email}</div>}
                {selectedOrder.customer_phone && <div><span className="text-slate-500">Tél :</span> {selectedOrder.customer_phone}</div>}
                {selectedOrder.order_date && <div><span className="text-slate-500">Date :</span> {format(new Date(selectedOrder.order_date), 'dd/MM/yyyy')}</div>}
                {selectedOrder.delivery_date && <div><span className="text-slate-500">Livraison :</span> {format(new Date(selectedOrder.delivery_date), 'dd/MM/yyyy')}</div>}
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Lignes de commande</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-3 py-2 text-slate-600">Produit</th>
                        <th className="text-right px-3 py-2 text-slate-600">Qté</th>
                        <th className="text-right px-3 py-2 text-slate-600">Prix U.</th>
                        <th className="text-right px-3 py-2 text-slate-600">Remise</th>
                        <th className="text-right px-3 py-2 text-slate-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.lines || []).map((line, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{line.product_name}</td>
                          <td className="text-right px-3 py-2">{line.quantity} {line.unit}</td>
                          <td className="text-right px-3 py-2">{(line.unit_price || 0).toFixed(2)} €</td>
                          <td className="text-right px-3 py-2">{line.discount || 0}%</td>
                          <td className="text-right px-3 py-2 font-medium">{(line.total_price || 0).toFixed(2)} €</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 p-3 bg-slate-50 rounded-lg text-right space-y-1 text-sm">
                  <p>Sous-total HT : <span className="font-medium">{(selectedOrder.subtotal || 0).toFixed(2)} €</span></p>
                  <p>TVA ({selectedOrder.tax_rate || 0}%) : <span className="font-medium">{(selectedOrder.tax_amount || 0).toFixed(2)} €</span></p>
                  <p className="text-base font-bold">Total TTC : {(selectedOrder.total_amount || 0).toFixed(2)} €</p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="text-sm">
                  <span className="text-slate-500">Notes :</span> {selectedOrder.notes}
                </div>
              )}

              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <div className="flex gap-2 pt-2 border-t">
                  {selectedOrder.status === 'confirmed' && (
                    <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: selectedOrder.id, data: { status: 'shipped' } })}>
                      <Truck className="h-4 w-4 mr-1" />Marquer Expédié
                    </Button>
                  )}
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleConfirmDelivery(selectedOrder)}>
                    <CheckCircle className="h-4 w-4 mr-1" />Confirmer Livraison & Déduire Stock
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => { updateMutation.mutate({ id: selectedOrder.id, data: { status: 'cancelled' } }); setDetailsOpen(false); }}>
                    <XCircle className="h-4 w-4 mr-1" />Annuler
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}