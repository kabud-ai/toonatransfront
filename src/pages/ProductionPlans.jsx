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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar, 
  Plus, 
  Eye,
  Play,
  CheckCircle,
  Clock,
  Factory,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ProductionPlans() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['productionPlans'],
    queryFn: () => base44.entities.ProductionPlan.list('-created_date', 100)
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProductionPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productionPlans'] });
      setDialogOpen(false);
      toast.success('Production planifiée avec succès');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProductionPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productionPlans'] });
      setDetailsOpen(false);
      toast.success('Plan mis à jour');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = products.find(p => p.id === formData.get('product_id'));
    const recipe = recipes.find(r => r.id === formData.get('recipe_id'));
    const quantity = parseFloat(formData.get('quantity'));
    
    const data = {
      product_id: formData.get('product_id'),
      product_name: product?.name,
      recipe_id: formData.get('recipe_id'),
      recipe_title: recipe?.title,
      quantity: quantity,
      cost: (recipe?.cost || 0) * quantity,
      status: 'planned',
      planned_date: formData.get('planned_date')
    };

    createMutation.mutate(data);
  };

  const executePlan = (plan) => {
    updateMutation.mutate({
      id: plan.id,
      data: {
        status: 'in_progress'
      }
    });
  };

  const completePlan = (plan) => {
    updateMutation.mutate({
      id: plan.id,
      data: {
        status: 'completed',
        completed_date: new Date().toISOString()
      }
    });
  };

  // Stats
  const plannedCount = plans.filter(p => p.status === 'planned').length;
  const inProgressCount = plans.filter(p => p.status === 'in_progress').length;
  const completedCount = plans.filter(p => p.status === 'completed').length;
  const totalCost = plans.filter(p => p.status !== 'cancelled').reduce((sum, p) => sum + (p.cost || 0), 0);

  const columns = [
    {
      key: 'product_name',
      label: 'Produit',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-slate-500">Recipe: {row.recipe_title}</p>
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Quantité',
      sortable: true,
      render: (value) => <span className="font-medium">{value?.toLocaleString()}</span>
    },
    {
      key: 'cost',
      label: 'Coût Estimé',
      sortable: true,
      render: (value) => `$${(value || 0).toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'planned_date',
      label: 'Date Prévue',
      sortable: true,
      render: (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-'
    },
    {
      key: 'completed_date',
      label: 'Terminé le',
      render: (value) => value ? format(new Date(value), 'dd MMM yyyy') : '-'
    }
  ];

  const actions = [
    { label: 'Voir', icon: Eye, onClick: (row) => { setSelectedPlan(row); setDetailsOpen(true); } }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planification de Production"
        description="Planifier et exécuter les productions"
        icon={Calendar}
        breadcrumbs={['Production', 'Planification']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedPlan(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Planifier Production
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Planifié" value={plannedCount} icon={Clock} color="blue" />
        <StatCard title="En Cours" value={inProgressCount} icon={Play} color="amber" />
        <StatCard title="Terminé" value={completedCount} icon={CheckCircle} color="green" />
        <StatCard title="Coût Total" value={`$${totalCost.toLocaleString()}`} icon={DollarSign} color="indigo" />
      </div>

      <DataTable
        columns={columns}
        data={plans}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={(row) => { setSelectedPlan(row); setDetailsOpen(true); }}
        emptyMessage="Aucune production planifiée"
        emptyIcon={Calendar}
      />

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Planifier une Production</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Produit *</Label>
              <Select name="product_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recette *</Label>
              <Select name="recipe_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une recette" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.filter(r => r.status === 'active').map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title} (v{r.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantité *</Label>
                <Input name="quantity" type="number" required min="1" />
              </div>
              <div className="space-y-2">
                <Label>Date prévue</Label>
                <Input name="planned_date" type="date" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                Planifier
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedPlan?.product_name}</span>
              <StatusBadge status={selectedPlan?.status} />
            </DialogTitle>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500 mb-1">Recette</p>
                    <p className="font-medium">{selectedPlan.recipe_title}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500 mb-1">Quantité</p>
                    <p className="text-lg font-medium">{selectedPlan.quantity}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500 mb-1">Coût Estimé</p>
                    <p className="text-lg font-medium">${(selectedPlan.cost || 0).toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500 mb-1">Date Prévue</p>
                    <p className="font-medium">
                      {selectedPlan.planned_date ? format(new Date(selectedPlan.planned_date), 'dd MMM yyyy') : '-'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {selectedPlan.status === 'planned' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => executePlan(selectedPlan)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Démarrer Production
                  </Button>
                )}
                {selectedPlan.status === 'in_progress' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => completePlan(selectedPlan)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terminer Production
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}