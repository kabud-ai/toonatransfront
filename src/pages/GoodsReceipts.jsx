import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatCard from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  PackageCheck, 
  Plus, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function GoodsReceipts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [receiptLines, setReceiptLines] = useState([]);

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ['goodsReceipts'],
    queryFn: () => base44.entities.GoodsReceipt.list('-created_date', 100)
  });

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: () => base44.entities.PurchaseOrder.list()
  });

  const createReceipt = useMutation({
    mutationFn: async (data) => {
      const receipt = await base44.entities.GoodsReceipt.create(data);
      
      // Create lot entries for each received line
      for (const line of data.lines) {
        if (line.received_quantity > 0 && line.lot_number) {
          await base44.entities.ProductLot.create({
            lot_number: line.lot_number,
            product_id: line.product_id,
            product_name: line.product_name,
            warehouse_id: data.warehouse_id,
            warehouse_name: data.warehouse_name,
            initial_quantity: line.received_quantity,
            current_quantity: line.received_quantity,
            unit_cost: line.unit_cost,
            received_date: data.receipt_date,
            status: 'available',
            quality_status: 'pending'
          });

          // Create lot movement
          await base44.entities.LotMovement.create({
            lot_number: line.lot_number,
            product_id: line.product_id,
            product_name: line.product_name,
            warehouse_id: data.warehouse_id,
            movement_type: 'in',
            quantity: line.received_quantity,
            quantity_before: 0,
            quantity_after: line.received_quantity,
            reference_type: 'purchase_order',
            reference_id: data.purchase_order_id,
            unit_cost: line.unit_cost,
            performed_by: data.received_by
          });
        }
      }
      
      return receipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goodsReceipts'] });
      queryClient.invalidateQueries({ queryKey: ['productLots'] });
      queryClient.invalidateQueries({ queryKey: ['lotMovements'] });
      setDialogOpen(false);
      setSelectedPO(null);
      setReceiptLines([]);
      toast.success(t('goodsReceipt.created') || 'Bon de réception créé');
    }
  });

  const updateReceipt = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GoodsReceipt.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goodsReceipts'] });
      setDetailsOpen(false);
    }
  });

  const generateReceiptNumber = () => {
    const year = new Date().getFullYear();
    const count = receipts.length + 1;
    return `GR-${year}-${String(count).padStart(4, '0')}`;
  };

  const loadPurchaseOrder = (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      setSelectedPO(po);
      setReceiptLines(po.lines?.map(line => ({
        ...line,
        received_quantity: line.quantity - (line.quantity_received || 0),
        accepted_quantity: 0,
        rejected_quantity: 0,
        lot_number: `LOT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        unit_cost: line.unit_price
      })) || []);
    }
  };

  const updateReceiptLine = (index, field, value) => {
    const updated = [...receiptLines];
    updated[index][field] = value;
    setReceiptLines(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      receipt_number: generateReceiptNumber(),
      purchase_order_id: selectedPO.id,
      purchase_order_number: selectedPO.order_number,
      supplier_id: selectedPO.supplier_id,
      supplier_name: selectedPO.supplier_name,
      warehouse_id: selectedPO.warehouse_id,
      warehouse_name: purchaseOrders.find(p => p.id === selectedPO.id)?.warehouse_name,
      receipt_date: new Date().toISOString(),
      status: 'confirmed',
      lines: receiptLines,
      received_by: base44.auth.me().email
    };

    createReceipt.mutate(data);
  };

  const acceptReceipt = (receipt) => {
    updateReceipt.mutate({
      id: receipt.id,
      data: { status: 'accepted' }
    });
  };

  // Stats
  const draftReceipts = receipts.filter(r => r.status === 'draft').length;
  const confirmedReceipts = receipts.filter(r => r.status === 'confirmed').length;
  const acceptedReceipts = receipts.filter(r => r.status === 'accepted').length;

  const columns = [
    {
      key: 'receipt_number',
      label: t('goodsReceipt.receiptNumber') || 'N° Réception',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">
          {value}
        </span>
      )
    },
    {
      key: 'purchase_order_number',
      label: t('goodsReceipt.purchaseOrder') || 'Bon de commande',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'supplier_name',
      label: t('common.supplier'),
      sortable: true
    },
    {
      key: 'lines',
      label: t('goodsReceipt.items') || 'Articles',
      render: (value) => (
        <Badge variant="outline">
          {value?.length || 0} articles
        </Badge>
      )
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'receipt_date',
      label: t('goodsReceipt.receiptDate') || 'Date',
      sortable: true,
      render: (value) => value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '-'
    },
    {
      key: 'received_by',
      label: t('goodsReceipt.receivedBy') || 'Reçu par',
      render: (value) => value || '-'
    }
  ];

  const actions = [
    { 
      label: t('common.viewDetails') || 'Voir', 
      icon: Eye, 
      onClick: (row) => { setSelectedReceipt(row); setDetailsOpen(true); } 
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('goodsReceipt.title') || 'Bons de Réception'}
        description={t('goodsReceipt.description') || 'Gérer les réceptions de marchandises'}
        icon={PackageCheck}
        breadcrumbs={[t('nav.purchasing'), t('goodsReceipt.title') || 'Réceptions']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedPO(null); setReceiptLines([]); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('goodsReceipt.createReceipt') || 'Nouvelle Réception'}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('goodsReceipt.draft') || 'Brouillon'}
          value={draftReceipts}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title={t('goodsReceipt.confirmed') || 'Confirmé'}
          value={confirmedReceipts}
          icon={PackageCheck}
          color="blue"
        />
        <StatCard
          title={t('goodsReceipt.accepted') || 'Accepté'}
          value={acceptedReceipts}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title={t('goodsReceipt.totalReceipts') || 'Total'}
          value={receipts.length}
          icon={Package}
          color="indigo"
        />
      </div>

      <DataTable
        columns={columns}
        data={receipts}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={(row) => { setSelectedReceipt(row); setDetailsOpen(true); }}
        emptyMessage={t('goodsReceipt.noReceipts') || 'Aucune réception'}
        emptyIcon={PackageCheck}
      />

      {/* Create Receipt Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('goodsReceipt.createReceipt') || 'Créer un bon de réception'}</DialogTitle>
          </DialogHeader>

          {!selectedPO ? (
            <div className="space-y-4">
              <Label>{t('goodsReceipt.selectPurchaseOrder') || 'Sélectionner un bon de commande'}</Label>
              <Select onValueChange={loadPurchaseOrder}>
                <SelectTrigger>
                  <SelectValue placeholder={t('goodsReceipt.selectPO') || 'Choisir un BC...'} />
                </SelectTrigger>
                <SelectContent>
                  {purchaseOrders.filter(po => ['sent', 'confirmed', 'partial'].includes(po.status)).map((po) => (
                    <SelectItem key={po.id} value={po.id}>
                      {po.order_number} - {po.supplier_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Card className="bg-slate-50 dark:bg-slate-800">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">{t('goodsReceipt.purchaseOrder')}</p>
                      <p className="font-medium">{selectedPO.order_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t('common.supplier')}</p>
                      <p className="font-medium">{selectedPO.supplier_name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Label className="text-base">{t('goodsReceipt.receiptLines') || 'Lignes de réception'}</Label>
                <div className="border rounded-lg divide-y">
                  {receiptLines.map((line, idx) => (
                    <div key={idx} className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{line.product_name}</p>
                        <Badge variant="outline">
                          {t('goodsReceipt.ordered') || 'Commandé'}: {line.quantity}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t('goodsReceipt.received') || 'Reçu'}</Label>
                          <Input
                            type="number"
                            value={line.received_quantity}
                            onChange={(e) => updateReceiptLine(idx, 'received_quantity', parseFloat(e.target.value))}
                            min="0"
                            max={line.quantity}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('goodsReceipt.accepted') || 'Accepté'}</Label>
                          <Input
                            type="number"
                            value={line.accepted_quantity}
                            onChange={(e) => updateReceiptLine(idx, 'accepted_quantity', parseFloat(e.target.value))}
                            min="0"
                            max={line.received_quantity}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('goodsReceipt.rejected') || 'Rejeté'}</Label>
                          <Input
                            type="number"
                            value={line.rejected_quantity}
                            onChange={(e) => updateReceiptLine(idx, 'rejected_quantity', parseFloat(e.target.value))}
                            min="0"
                            max={line.received_quantity}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t('lotTracking.lotNumber') || 'N° Lot'}</Label>
                          <Input
                            value={line.lot_number}
                            onChange={(e) => updateReceiptLine(idx, 'lot_number', e.target.value)}
                            placeholder="LOT-XXX"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setDialogOpen(false);
                  setSelectedPO(null);
                  setReceiptLines([]);
                }}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  {t('goodsReceipt.createReceipt') || 'Créer la réception'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedReceipt?.receipt_number}</span>
              <StatusBadge status={selectedReceipt?.status} />
            </DialogTitle>
          </DialogHeader>
          
          {selectedReceipt && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">{t('goodsReceipt.purchaseOrder')}</p>
                  <p className="font-medium font-mono">{selectedReceipt.purchase_order_number}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">{t('common.supplier')}</p>
                  <p className="font-medium">{selectedReceipt.supplier_name}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">{t('goodsReceipt.receiptDate')}</p>
                  <p className="font-medium">
                    {selectedReceipt.receipt_date ? format(new Date(selectedReceipt.receipt_date), 'dd/MM/yyyy') : '-'}
                  </p>
                </div>
              </div>

              {selectedReceipt.lines?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">{t('goodsReceipt.receiptLines')}</h3>
                  <div className="border rounded-lg divide-y">
                    {selectedReceipt.lines.map((line, idx) => (
                      <div key={idx} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{line.product_name}</p>
                          <span className="font-mono text-xs text-slate-500">{line.lot_number}</span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">{t('goodsReceipt.ordered')}: </span>
                            <span>{line.ordered_quantity}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">{t('goodsReceipt.received')}: </span>
                            <span className="text-blue-600">{line.received_quantity}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">{t('goodsReceipt.accepted')}: </span>
                            <span className="text-green-600">{line.accepted_quantity}</span>
                          </div>
                          {line.rejected_quantity > 0 && (
                            <div>
                              <span className="text-slate-500">{t('goodsReceipt.rejected')}: </span>
                              <span className="text-red-600">{line.rejected_quantity}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReceipt.status === 'confirmed' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => acceptReceipt(selectedReceipt)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('goodsReceipt.acceptReceipt') || 'Accepter la réception'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}