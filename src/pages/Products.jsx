import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Package, Plus, Eye, Pencil, Trash2, Barcode, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Products() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDialogOpen(false);
      setSelectedProduct(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDialogOpen(false);
      setSelectedProduct(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
      toast.success('Image uploadée');
    } catch (error) {
      toast.error('Erreur upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      code: formData.get('code'),
      unity: formData.get('unity'),
      description: formData.get('description'),
      slug: formData.get('name').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      image_url: imageUrl || selectedProduct?.image_url
    };

    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
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
      label: 'Nom du Produit',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            {row.image_url ? (
              <img src={row.image_url} alt={value} className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <div>
            <p className="font-medium">{value}</p>
            {row.description && <p className="text-xs text-slate-500">{row.description.slice(0, 40)}</p>}
          </div>
        </div>
      )
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
    { label: 'View', icon: Eye, onClick: (row) => { setSelectedProduct(row); setDialogOpen(true); } },
    { label: 'Edit', icon: Pencil, onClick: (row) => { setSelectedProduct(row); setDialogOpen(true); } },
    { label: 'Delete', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produits"
        description="Gérer le catalogue des produits finis"
        icon={Package}
        breadcrumbs={['Inventaire', 'Produits']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedProduct(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Produit
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={products}
        loading={isLoading}
        selectable
        actions={actions}
        emptyMessage="Aucun produit trouvé"
        emptyIcon={Package}
      />

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setImageUrl(null);
          setSelectedProduct(null);
        } else if (selectedProduct) {
          setImageUrl(selectedProduct.image_url);
        }
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Modifier' : 'Nouveau'} Produit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Image du Produit</Label>
              <div className="flex items-center gap-4">
                {imageUrl ? (
                  <div className="relative">
                    <img src={imageUrl} alt="Produit" className="h-20 w-20 rounded-lg object-cover border-2 border-slate-200" />
                    <button
                      type="button"
                      onClick={() => setImageUrl(null)}
                      className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Package className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="cursor-pointer"
                  />
                  {uploadingImage && <p className="text-xs text-slate-500 mt-1">Upload en cours...</p>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du Produit *</Label>
                <Input 
                  name="name" 
                  defaultValue={selectedProduct?.name}
                  required 
                  placeholder="ex: Chocolat noir"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input 
                  name="code" 
                  defaultValue={selectedProduct?.code}
                  required 
                  placeholder="ex: PROD-001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Unité de mesure *</Label>
              <Select name="unity" defaultValue={selectedProduct?.unity || 'kg'} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogramme (kg)</SelectItem>
                  <SelectItem value="g">Gramme (g)</SelectItem>
                  <SelectItem value="t">Tonne (t)</SelectItem>
                  <SelectItem value="L">Litre (L)</SelectItem>
                  <SelectItem value="ml">Millilitre (ml)</SelectItem>
                  <SelectItem value="pcs">Pièce (pcs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                name="description"
                defaultValue={selectedProduct?.description}
                rows={3}
                placeholder="Description du produit"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedProduct ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}