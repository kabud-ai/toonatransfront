import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
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
  Tag, 
  Plus, 
  Pencil, 
  Trash2
} from 'lucide-react';

export default function RecipeTypes() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const { data: recipeTypes = [], isLoading } = useQuery({
    queryKey: ['recipeTypes'],
    queryFn: () => base44.entities.RecipeType.list('-created_date', 100)
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RecipeType.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipeTypes'] });
      setDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RecipeType.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipeTypes'] });
      setDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RecipeType.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipeTypes'] })
  });

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    
    const data = {
      name,
      slug: generateSlug(name),
      description: formData.get('description')
    };

    if (selectedType) {
      updateMutation.mutate({ id: selectedType.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getRecipeCount = (typeId) => {
    return recipes.filter(r => r.type_id === typeId).length;
  };

  const columns = [
    {
      key: 'name',
      label: 'Nom du Type',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-slate-500">{row.slug}</p>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => value || '-'
    },
    {
      key: 'id',
      label: 'Recettes',
      render: (value) => (
        <Badge variant="outline">
          {getRecipeCount(value)} recettes
        </Badge>
      )
    }
  ];

  const actions = [
    { label: 'Modifier', icon: Pencil, onClick: (row) => { setSelectedType(row); setDialogOpen(true); } },
    { label: 'Supprimer', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Types de Recettes"
        description="Catégoriser vos recettes de production"
        icon={Tag}
        breadcrumbs={['Configuration', 'Types de Recettes']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedType(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Type
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={recipeTypes}
        loading={isLoading}
        actions={actions}
        emptyMessage="Aucun type de recette défini"
        emptyIcon={Tag}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedType ? 'Modifier' : 'Nouveau'} Type de Recette</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input 
                name="name" 
                defaultValue={selectedType?.name}
                required 
                placeholder="ex: Dessert, Plat principal..."
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                name="description"
                defaultValue={selectedType?.description}
                rows={3}
                placeholder="Description du type de recette"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedType ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}