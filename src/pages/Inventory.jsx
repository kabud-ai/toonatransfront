import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Boxes, 
  Plus, 
  ArrowUpDown, 
  AlertTriangle, 
  TrendingUp, 
  Package,
  ArrowDownRight,
  ArrowUpRight,
  History,
  ScanLine
} from 'lucide-react';
import BarcodeScanner from '@/components/barcode/BarcodeScanner';
import EmptyBox from '@/components/illustrations/EmptyBox';

export default function Inventory() {
  const queryClient = useQueryClient();
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('levels');

  const { data: stockLevels = [], isLoading: loadingLevels } = useQuery({
    queryKey: ['stockLevels'],
    queryFn: () => base44.entities.StockLevel.list('-updated_date', 100)
  });

  const { data: movements = [], isLoading: loadingMovements } = useQuery({
    queryKey: ['stockMovements'],
    queryFn: () => base44.entities.StockMovement.list('-created_date', 100)
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => base44.entities.Warehouse.list()
  });

  const createMovement = useMutation({
    mutationFn: (data) => base44.entities.StockMovement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['stockLevels'] });
      setMovementDialogOpen(false);
    }
  });

  const handleMovementSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = products.find(p => p.id === formData.get('product_id'));
    const warehouse = warehouses.find(w => w.id === formData.get('warehouse_id'));
    
    createMovement.mutate({
      product_id: formData.get('product_id'),
      product_name: product?.name,
      warehouse_id: formData.get('warehouse_id'),
      warehouse_name: warehouse?.name,
      type: formData.get('type'),
      quantity: parseFloat(formData.get('quantity')),
      lot_number: formData.get('lot_number'),
      reference: formData.get('reference'),
      notes: formData.get('notes')
    });
  };

  // Stats
  const totalItems = stockLevels.length;
  const totalValue = stockLevels.reduce((sum, s) => sum + (s.total_value || 0), 0);
  const lowStockItems = stockLevels.filter(s => s.quantity < 10).length;
  const movementsToday = movements.filter(m => 
    new Date(m.created_date).toDateString() === new Date().toDateString()
  ).length;

  const stockColumns = [
    {
      key: 'product_sku',
      label: 'SKU',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'product_name',
      label: 'Product',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Package className="h-4 w-4 text-slate-400" />
          </div>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'warehouse_name',
      label: 'Warehouse',
      render: (value) => value || '-'
    },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      render: (value, row) => {
        const isLow = value < 10;
        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? 'text-red-600 font-medium' : ''}>
              {value?.toLocaleString()}
            </span>
            {isLow && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
        );
      }
    },
    {
      key: 'reserved_quantity',
      label: 'Reserved',
      render: (value) => value?.toLocaleString() || 0
    },
    {
      key: 'available_quantity',
      label: 'Available',
      sortable: true,
      render: (value, row) => (
        <Badge variant="outline" className="font-medium">
          {value?.toLocaleString() || (row.quantity - (row.reserved_quantity || 0))}
        </Badge>
      )
    },
    {
      key: 'total_value',
      label: 'Value',
      sortable: true,
      render: (value) => `$${(value || 0).toLocaleString()}`
    }
  ];

  const movementColumns = [
    {
      key: 'created_date',
      label: 'Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'product_name',
      label: 'Product',
      render: (value) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'warehouse_name',
      label: 'Warehouse'
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => {
        const colors = {
          in: 'bg-green-100 text-green-700',
          out: 'bg-red-100 text-red-700',
          transfer: 'bg-blue-100 text-blue-700',
          adjustment: 'bg-amber-100 text-amber-700',
          production: 'bg-purple-100 text-purple-700',
          consumption: 'bg-orange-100 text-orange-700'
        };
        return (
          <Badge className={colors[value] || 'bg-slate-100 text-slate-700'}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (value, row) => (
        <div className="flex items-center gap-1">
          {row.type === 'in' || row.type === 'production' ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'lot_number',
      label: 'Lot #',
      render: (value) => value || '-'
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (value) => value || '-'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track stock levels and movements across warehouses"
        icon={Boxes}
        breadcrumbs={['Inventory', 'Stock']}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setScannerOpen(true)}
            >
              <ScanLine className="h-4 w-4 mr-2" />
              Scan
            </Button>
            <Button 
              className="bg-sky-600 hover:bg-sky-700"
              onClick={() => setMovementDialogOpen(true)}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Record Movement
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total SKUs"
          value={totalItems}
          icon={Package}
          color="indigo"
        />
        <StatCard
          title="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockItems}
          icon={AlertTriangle}
          color={lowStockItems > 0 ? 'amber' : 'green'}
        />
        <StatCard
          title="Today's Movements"
          value={movementsToday}
          icon={History}
          color="blue"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="levels">Stock Levels</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="levels" className="mt-4">
          <DataTable
            columns={stockColumns}
            data={stockLevels}
            loading={loadingLevels}
            selectable
            emptyMessage="No stock data found"
            emptyIcon={Boxes}
          />
        </TabsContent>
        
        <TabsContent value="movements" className="mt-4">
          <DataTable
            columns={movementColumns}
            data={movements}
            loading={loadingMovements}
            emptyMessage="No movements recorded"
            emptyIcon={History}
          />
        </TabsContent>
      </Tabs>

      {/* Movement Dialog */}
      <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Stock Movement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMovementSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Product *</Label>
              <Select name="product_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.sku} - {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Warehouse *</Label>
              <Select name="warehouse_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Movement Type *</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Stock In</SelectItem>
                    <SelectItem value="out">Stock Out</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input name="quantity" type="number" required min="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lot Number</Label>
                <Input name="lot_number" />
              </div>
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input name="reference" placeholder="PO-001, MO-001..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input name="notes" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setMovementDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                Record Movement
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(code) => {
          console.log('Scanned:', code);
          // TODO: Search for product/lot by code
        }}
        title="Scan Product or Lot"
      />
    </div>
  );
}