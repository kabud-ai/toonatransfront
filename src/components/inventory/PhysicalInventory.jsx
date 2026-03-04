import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  ClipboardList, Package, ArrowUpRight, ArrowDownRight, CheckCircle2,
  RotateCcw, AlertTriangle, Search, SlidersHorizontal, CheckCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PhysicalInventory({ stockLevels, products, warehouses, loadingLevels }) {
  const queryClient = useQueryClient();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState('all');
  const [sessionDate] = useState(new Date());
  const [physicalCounts, setPhysicalCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [adjustNotes, setAdjustNotes] = useState('');

  const createMovement = useMutation({
    mutationFn: (data) => base44.entities.StockMovement.create(data),
  });

  const updateStockLevel = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StockLevel.update(id, data),
  });

  // Filter stock levels by selected warehouse
  const filteredLevels = useMemo(() => {
    let levels = selectedWarehouseId === 'all'
      ? stockLevels
      : stockLevels.filter(s => s.warehouse_id === selectedWarehouseId);

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      levels = levels.filter(s =>
        s.product_name?.toLowerCase().includes(q) ||
        s.product_sku?.toLowerCase().includes(q)
      );
    }
    return levels;
  }, [stockLevels, selectedWarehouseId, searchTerm]);

  // Items with a physical count entered
  const countedItems = filteredLevels.filter(s => physicalCounts[s.id] !== undefined && physicalCounts[s.id] !== '');

  // Items that have a difference
  const itemsWithDiff = filteredLevels
    .filter(s => physicalCounts[s.id] !== undefined && physicalCounts[s.id] !== '')
    .map(s => {
      const systemQty = s.quantity || 0;
      const physQty = parseFloat(physicalCounts[s.id] || 0);
      const diff = physQty - systemQty;
      return { ...s, physQty, diff };
    })
    .filter(s => s.diff !== 0);

  const handleReset = () => {
    setPhysicalCounts({});
    setSearchTerm('');
  };

  // Apply all adjustments via StockMovements
  const handleAdjustAll = async () => {
    if (itemsWithDiff.length === 0) {
      toast.info('Aucun écart à ajuster');
      setConfirmOpen(false);
      return;
    }

    const ref = `INV-${format(sessionDate, 'yyyyMMdd-HHmm')}`;

    try {
      const promises = itemsWithDiff.map(async (item) => {
        const absDiff = Math.abs(item.diff);
        const movType = item.diff > 0 ? 'in' : 'out';

        // Create movement
        await createMovement.mutateAsync({
          product_id: item.product_id,
          product_name: item.product_name,
          warehouse_id: item.warehouse_id,
          warehouse_name: item.warehouse_name,
          type: 'adjustment',
          quantity: absDiff,
          reference: ref,
          reference_type: 'adjustment',
          notes: adjustNotes || `Inventaire physique du ${format(sessionDate, 'dd/MM/yyyy')} — ${item.diff > 0 ? '+' : ''}${item.diff}`,
        });

        // Update StockLevel
        const newQty = item.physQty;
        await updateStockLevel.mutateAsync({
          id: item.id,
          data: {
            quantity: newQty,
            available_quantity: newQty - (item.reserved_quantity || 0),
            total_value: newQty * (item.unit_cost || 0),
          }
        });
      });

      await Promise.all(promises);

      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });

      toast.success(`${itemsWithDiff.length} article(s) ajusté(s) avec succès`);
      setConfirmOpen(false);
      setPhysicalCounts({});
    } catch (err) {
      toast.error("Erreur lors des ajustements");
    }
  };

  const diffColor = (diff) => {
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-slate-500';
  };

  const diffBadge = (diff) => {
    if (diff > 0) return <Badge className="bg-green-100 text-green-700"><ArrowUpRight className="h-3 w-3 mr-1" />+{diff}</Badge>;
    if (diff < 0) return <Badge className="bg-red-100 text-red-700"><ArrowDownRight className="h-3 w-3 mr-1" />{diff}</Badge>;
    return <Badge className="bg-slate-100 text-slate-600">0</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les entrepôts</SelectItem>
              {warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9 w-56"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="outline">{countedItems.length} / {filteredLevels.length} saisis</Badge>
          {itemsWithDiff.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700">
              <AlertTriangle className="h-3 w-3 mr-1" />{itemsWithDiff.length} écart(s)
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />Réinitialiser
          </Button>
          <Button
            size="sm"
            className="bg-sky-600 hover:bg-sky-700"
            onClick={() => setConfirmOpen(true)}
            disabled={itemsWithDiff.length === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Valider les Ajustements ({itemsWithDiff.length})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead>Produit</TableHead>
                <TableHead>Entrepôt</TableHead>
                <TableHead className="text-right">Qté Système</TableHead>
                <TableHead className="text-right w-40">Qté Physique Réelle</TableHead>
                <TableHead className="text-right">Écart</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLevels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredLevels.map((item) => {
                  const physVal = physicalCounts[item.id];
                  const hasCount = physVal !== undefined && physVal !== '';
                  const physQty = hasCount ? parseFloat(physVal) : null;
                  const diff = hasCount ? physQty - (item.quantity || 0) : null;

                  return (
                    <TableRow
                      key={item.id}
                      className={hasCount && diff === 0 ? 'bg-green-50/40 dark:bg-green-900/10' :
                        hasCount && diff !== 0 ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <Package className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.product_name}</p>
                            {item.product_sku && <p className="text-xs text-slate-400 font-mono">{item.product_sku}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">{item.warehouse_name || '—'}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{(item.quantity || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          className="w-28 text-right ml-auto"
                          placeholder="Saisir..."
                          value={physVal ?? ''}
                          onChange={e => setPhysicalCounts(prev => ({ ...prev, [item.id]: e.target.value }))}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {hasCount ? (
                          <span className={diffColor(diff)}>
                            {diff > 0 ? '+' : ''}{diff}
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        {!hasCount && <Badge variant="outline" className="text-xs text-slate-400">En attente</Badge>}
                        {hasCount && diff === 0 && <Badge className="bg-green-100 text-green-700 text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Conforme</Badge>}
                        {hasCount && diff !== 0 && diffBadge(diff)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Valider les Ajustements d'Inventaire</DialogTitle>
            <DialogDescription>
              {itemsWithDiff.length} mouvement(s) d'ajustement seront créés et le stock sera mis à jour.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-56 overflow-y-auto space-y-2 border rounded-lg p-3 bg-slate-50 dark:bg-slate-800">
              {itemsWithDiff.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.product_name}</span>
                    <span className="text-slate-400 ml-2 text-xs">{item.warehouse_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{item.quantity} →</span>
                    <span className="font-semibold">{item.physQty}</span>
                    {diffBadge(item.diff)}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <Label>Notes d'inventaire (optionnel)</Label>
              <Textarea
                rows={2}
                placeholder="Motif de l'ajustement, référence de la session..."
                value={adjustNotes}
                onChange={e => setAdjustNotes(e.target.value)}
              />
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Cette action créera des mouvements d'ajustement et mettra à jour le stock système. Elle est irréversible.
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>Annuler</Button>
              <Button className="bg-sky-600 hover:bg-sky-700" onClick={handleAdjustAll}>
                <CheckCheck className="h-4 w-4 mr-2" />Confirmer les Ajustements
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}