import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
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
  Boxes, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2,
  TrendingUp,
  Package,
  DollarSign,
  History,
  Download,
  FileUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { convertUnity } from '@/components/utils/unityConverter';
import { parseCSV } from '@/components/utils/excelExport';
import { exportStockToPDF } from '@/components/utils/pdfExport';

export default function RawMaterials() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRawMaterial, setSelectedRawMaterial] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const { data: rawMaterials = [], isLoading } = useQuery({
    queryKey: ['rawMaterials'],
    queryFn: () => base44.entities.RawMaterial.list('-created_date', 100)
  });

  const unityOptions = [
    { value: 'kg', label: 'Kilogramme (kg)' },
    { value: 'g', label: 'Gramme (g)' },
    { value: 't', label: 'Tonne (t)' },
    { value: 'L', label: 'Litre (L)' },
    { value: 'ml', label: 'Millilitre (ml)' },
    { value: 'm', label: 'Mètre (m)' },
    { value: 'cm', label: 'Centimètre (cm)' },
    { value: 'pcs', label: 'Pièce (pcs)' }
  ];

  const { data: stockLots = [] } = useQuery({
    queryKey: ['stockLots'],
    queryFn: () => base44.entities.StockLot.list('-bought_at', 200)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RawMaterial.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rawMaterials'] });
      setDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RawMaterial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rawMaterials'] });
      setDialogOpen(false);
      setDetailsOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RawMaterial.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rawMaterials'] })
  });

  const addStockMutation = useMutation({
    mutationFn: async ({ rawMaterialId, quantity, unity, price }) => {
      // Create stock lot
      await base44.entities.StockLot.create({
        rawmaterial_id: rawMaterialId,
        rawmaterial_name: selectedRawMaterial.name,
        bought_quantity: quantity,
        remaining_quantity: quantity,
        used_quantity: 0,
        unity: unity,
        price: price,
        bought_at: new Date().toISOString()
      });
      
      // Update total instock with conversion
      const currentStock = selectedRawMaterial.instock || 0;
      const defaultUnity = selectedRawMaterial.unity;
      
      // Convert to default unity if different
      let quantityToAdd = quantity;
      if (unity !== defaultUnity) {
        const converted = convertUnity(quantity, unity, defaultUnity);
        if (converted !== null) {
          quantityToAdd = converted;
          toast.info(`Converti: ${quantity} ${unity} = ${converted.toFixed(2)} ${defaultUnity}`);
        } else {
          toast.warning('Unités incompatibles - ajout sans conversion');
        }
      }
      
      await base44.entities.RawMaterial.update(rawMaterialId, {
        instock: currentStock + quantityToAdd
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rawMaterials'] });
      queryClient.invalidateQueries({ queryKey: ['stockLots'] });
      setAddStockOpen(false);
      toast.success('Stock ajouté avec succès');
    }
  });

  const generateCode = () => {
    const count = rawMaterials.length + 1;
    return `RM-${String(count).padStart(4, '0')}`;
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleExportStock = () => {
    exportStockToPDF(rawMaterials, 'rapport_stock');
    toast.success('Rapport PDF exporté');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const data = parseCSV(text);
        
        for (const row of data) {
          if (row.Code && row.Nom) {
            await base44.entities.RawMaterial.create({
              code: row.Code,
              name: row.Nom,
              unity: row['Unité'] || 'kg',
              instock: parseFloat(row.Stock) || 0,
              density: parseFloat(row['Densité']) || null,
              description: row.Description || '',
              slug: row.Nom.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            });
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ['rawMaterials'] });
        setImportDialogOpen(false);
        toast.success(`${data.length} matières importées`);
      } catch (error) {
        toast.error('Erreur lors de l\'import');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      name: formData.get('name'),
      code: selectedRawMaterial?.code || generateCode(),
      slug: generateSlug(formData.get('name')),
      density: parseFloat(formData.get('density')) || 0,
      unity: formData.get('unity'),
      description: formData.get('description'),
      instock: selectedRawMaterial?.instock || 0
    };

    if (selectedRawMaterial) {
      updateMutation.mutate({ id: selectedRawMaterial.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAddStock = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    addStockMutation.mutate({
      rawMaterialId: selectedRawMaterial.id,
      quantity: parseFloat(formData.get('quantity')),
      unity: formData.get('unity'),
      price: parseFloat(formData.get('price'))
    });
  };

  const getRawMaterialLots = (rmId) => {
    return stockLots.filter(lot => lot.rawmaterial_id === rmId);
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Matière Première',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Boxes className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            {row.description && <p className="text-xs text-slate-500">{row.description.slice(0, 50)}</p>}
          </div>
        </div>
      )
    },
    {
      key: 'instock',
      label: 'En Stock',
      sortable: true,
      render: (value, row) => {
        const isLow = value < 10;
        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? 'text-red-600 font-medium' : 'font-medium'}>
              {(value || 0).toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">{row.unity}</span>
          </div>
        );
      }
    },
    {
      key: 'density',
      label: 'Densité',
      render: (value) => value ? value.toFixed(2) : '-'
    },
    {
      key: 'unity',
      label: 'Unité',
      render: (value) => (
        <Badge variant="outline">{value || '-'}</Badge>
      )
    }
  ];

  const actions = [
    { 
      label: 'Voir stock détaillé', 
      icon: Eye, 
      onClick: (row) => { setSelectedRawMaterial(row); setDetailsOpen(true); } 
    },
    { 
      label: 'Ajouter stock', 
      icon: TrendingUp, 
      onClick: (row) => { setSelectedRawMaterial(row); setAddStockOpen(true); } 
    },
    { label: 'Modifier', icon: Pencil, onClick: (row) => { setSelectedRawMaterial(row); setDialogOpen(true); } },
    { label: 'Supprimer', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matières Premières"
        description="Gérer les matières premières et le stock par lot (FIFO)"
        icon={Boxes}
        breadcrumbs={['Inventaire', 'Matières Premières']}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportStock}>
              <Download className="h-4 w-4 mr-2" />
              Rapport Stock PDF
            </Button>
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <FileUp className="h-4 w-4 mr-2" />
              Import Excel
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => { setSelectedRawMaterial(null); setDialogOpen(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Matière
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={rawMaterials}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={(row) => { setSelectedRawMaterial(row); setDetailsOpen(true); }}
        emptyMessage="Aucune matière première trouvée"
        emptyIcon={Boxes}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRawMaterial ? 'Modifier' : 'Nouvelle'} Matière Première</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input 
                  name="name" 
                  defaultValue={selectedRawMaterial?.name}
                  required 
                  placeholder="ex: Farine de blé"
                />
              </div>
              <div className="space-y-2">
                <Label>Unité par défaut *</Label>
                <Select name="unity" defaultValue={selectedRawMaterial?.unity} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {unityOptions.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Densité</Label>
              <Input 
                name="density" 
                type="number"
                step="0.01"
                defaultValue={selectedRawMaterial?.density}
                placeholder="ex: 7.85"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                name="description"
                defaultValue={selectedRawMaterial?.description}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedRawMaterial ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Stock Dialog */}
      <Dialog open={addStockOpen} onOpenChange={setAddStockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter au Stock - {selectedRawMaterial?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStock} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantité *</Label>
                <Input 
                  name="quantity" 
                  type="number"
                  step="0.01"
                  required 
                  min="0.01"
                  placeholder="ex: 100"
                />
              </div>
              <div className="space-y-2">
                <Label>Unité *</Label>
                <Select name="unity" defaultValue={selectedRawMaterial?.unity} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unityOptions.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prix total d'achat *</Label>
              <Input 
                name="price" 
                type="number"
                step="0.01"
                required 
                min="0"
                placeholder="ex: 500.00"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setAddStockOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                Ajouter au Stock
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog with Stock Lots */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedRawMaterial?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedRawMaterial && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Stock Total</p>
                        <p className="text-lg font-medium">
                          {(selectedRawMaterial.instock || 0).toFixed(2)} {selectedRawMaterial.unity}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <History className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Lots en Stock</p>
                        <p className="text-lg font-medium">
                          {getRawMaterialLots(selectedRawMaterial.id).filter(l => l.remaining_quantity > 0).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">ρ</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Densité</p>
                        <p className="text-lg font-medium">{selectedRawMaterial.density || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Historique des Lots (FIFO)</h3>
                  <Button 
                    size="sm"
                    onClick={() => setAddStockOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter Stock
                  </Button>
                </div>
                
                {getRawMaterialLots(selectedRawMaterial.id).length === 0 ? (
                  <p className="text-sm text-slate-500">Aucun lot en stock</p>
                ) : (
                  <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {getRawMaterialLots(selectedRawMaterial.id).map((lot) => (
                      <div key={lot.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <p className="text-sm font-medium">
                            Acheté: {lot.bought_quantity} {lot.unity}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(lot.bought_at).toLocaleDateString('fr-FR')} - 
                            Prix: ${lot.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            Restant: {lot.remaining_quantity.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500">
                            Utilisé: {lot.used_quantity.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setDetailsOpen(false);
                  setDialogOpen(true);
                }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setAddStockOpen(true)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ajouter Stock
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importer des Matières Premières</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Téléchargez un fichier CSV avec les colonnes: Code, Nom, Unité, Stock, Densité, Description
            </p>
            <Input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="cursor-pointer"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}