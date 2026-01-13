import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
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
  Ruler, 
  Plus, 
  Pencil, 
  Trash2
} from 'lucide-react';

export default function Unities() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUnity, setSelectedUnity] = useState(null);

  const { data: unities = [], isLoading } = useQuery({
    queryKey: ['unities'],
    queryFn: () => base44.entities.Unity.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Unity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unities'] });
      setDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Unity.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unities'] });
      setDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Unity.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['unities'] })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      name: formData.get('name'),
      symbol: formData.get('symbol'),
      description: formData.get('description')
    };

    if (selectedUnity) {
      updateMutation.mutate({ id: selectedUnity.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    {
      key: 'symbol',
      label: 'Symbole',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">
          {value}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => value || '-'
    }
  ];

  const actions = [
    { label: 'Modifier', icon: Pencil, onClick: (row) => { setSelectedUnity(row); setDialogOpen(true); } },
    { label: 'Supprimer', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unités de Mesure"
        description="Gérer les unités utilisées dans l'application"
        icon={Ruler}
        breadcrumbs={['Configuration', 'Unités']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedUnity(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Unité
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={unities}
        loading={isLoading}
        actions={actions}
        emptyMessage="Aucune unité de mesure définie"
        emptyIcon={Ruler}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUnity ? 'Modifier' : 'Nouvelle'} Unité</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input 
                  name="name" 
                  defaultValue={selectedUnity?.name}
                  required 
                  placeholder="ex: Kilogramme"
                />
              </div>
              <div className="space-y-2">
                <Label>Symbole *</Label>
                <Input 
                  name="symbol" 
                  defaultValue={selectedUnity?.symbol}
                  required 
                  placeholder="ex: Kg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                name="description"
                defaultValue={selectedUnity?.description}
                rows={2}
                placeholder="Unité de masse"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedUnity ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}