import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  BookOpen, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2,
  ChevronRight,
  ListOrdered,
  Package,
  X,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Recipes() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [steps, setSteps] = useState([]);

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100)
  });

  const { data: recipeTypes = [] } = useQuery({
    queryKey: ['recipeTypes'],
    queryFn: () => base44.entities.RecipeType.list()
  });

  const { data: rawMaterials = [] } = useQuery({
    queryKey: ['rawMaterials'],
    queryFn: () => base44.entities.RawMaterial.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Recipe.create(data),
    onSuccess: (newRecipe) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      // Create history entry
      base44.entities.RecipeHistory.create({
        recipe_id: newRecipe.id,
        recipe_title: newRecipe.title,
        recipe_code: newRecipe.code,
        recipe_version: newRecipe.version,
        change_type: 'create',
        changed_at: new Date().toISOString(),
        new_data: newRecipe
      });
      setDialogOpen(false);
      setSteps([]);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, previousData }) => {
      // Create history entry
      base44.entities.RecipeHistory.create({
        recipe_id: id,
        recipe_title: previousData.title,
        recipe_code: previousData.code,
        recipe_version: previousData.version,
        change_type: 'update',
        changed_at: new Date().toISOString(),
        previous_data: previousData,
        new_data: data
      });
      return base44.entities.Recipe.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setDialogOpen(false);
      setDetailsOpen(false);
      setSteps([]);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (recipe) => {
      // Create history entry
      base44.entities.RecipeHistory.create({
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        recipe_code: recipe.code,
        recipe_version: recipe.version,
        change_type: 'delete',
        changed_at: new Date().toISOString(),
        previous_data: recipe
      });
      return base44.entities.Recipe.delete(recipe.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] })
  });

  const generateCode = () => {
    const count = recipes.length + 1;
    return `REC-${String(count).padStart(4, '0')}`;
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const recipeType = recipeTypes.find(t => t.id === formData.get('type_id'));
    const title = formData.get('title');
    
    const totalCost = steps.reduce((sum, step) => {
      const stepCost = step.components.reduce((s, c) => {
        const rm = rawMaterials.find(r => r.id === c.rawmaterial_id);
        return s + (c.quantity * (rm?.cost_per_unit || 0));
      }, 0);
      return sum + stepCost;
    }, 0);

    const data = {
      title,
      description: formData.get('description'),
      code: selectedRecipe?.code || generateCode(),
      version: formData.get('version') || '1.0',
      status: formData.get('status') || 'draft',
      slug: generateSlug(title),
      type_id: formData.get('type_id'),
      type_name: recipeType?.name,
      steps: steps,
      cost: totalCost
    };

    if (selectedRecipe) {
      updateMutation.mutate({ id: selectedRecipe.id, data, previousData: selectedRecipe });
    } else {
      createMutation.mutate(data);
    }
  };

  const addStep = () => {
    setSteps([...steps, {
      lineorder: steps.length + 1,
      description: '',
      components: []
    }]);
  };

  const updateStep = (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, lineorder: i + 1 })));
  };

  const addComponent = (stepIndex) => {
    const updated = [...steps];
    updated[stepIndex].components.push({
      rawmaterial_id: '',
      rawmaterial_name: '',
      quantity: 0,
      unity: 'kg'
    });
    setSteps(updated);
  };

  const updateComponent = (stepIndex, compIndex, field, value) => {
    const updated = [...steps];
    updated[stepIndex].components[compIndex][field] = value;
    
    if (field === 'rawmaterial_id') {
      const rm = rawMaterials.find(r => r.id === value);
      if (rm) {
        updated[stepIndex].components[compIndex].rawmaterial_name = rm.name;
        updated[stepIndex].components[compIndex].unity = rm.unity_symbol || 'kg';
      }
    }
    
    setSteps(updated);
  };

  const removeComponent = (stepIndex, compIndex) => {
    const updated = [...steps];
    updated[stepIndex].components = updated[stepIndex].components.filter((_, i) => i !== compIndex);
    setSteps(updated);
  };

  const openEdit = (recipe) => {
    setSelectedRecipe(recipe);
    setSteps(recipe.steps || []);
    setDialogOpen(true);
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
      key: 'title',
      label: 'Titre',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-slate-500">{row.type_name || 'Non catégorisé'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'version',
      label: 'Version',
      render: (value) => <Badge variant="outline">v{value}</Badge>
    },
    {
      key: 'steps',
      label: 'Étapes',
      render: (value) => (
        <Badge variant="outline">
          <ListOrdered className="h-3 w-3 mr-1" />
          {value?.length || 0}
        </Badge>
      )
    },
    {
      key: 'cost',
      label: 'Coût',
      sortable: true,
      render: (value) => `$${(value || 0).toFixed(2)}`
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value) => <StatusBadge status={value} />
    }
  ];

  const actions = [
    { label: 'Voir détails', icon: Eye, onClick: (row) => { setSelectedRecipe(row); setDetailsOpen(true); } },
    { label: 'Modifier', icon: Pencil, onClick: openEdit },
    { label: 'Supprimer', icon: Trash2, onClick: (row) => deleteMutation.mutate(row), destructive: true }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recettes"
        description="Gérer les recettes de production avec étapes détaillées"
        icon={BookOpen}
        breadcrumbs={['Production', 'Recettes']}
        actions={
          <>
            <Link to={createPageUrl('RecipeHistory')}>
              <Button variant="outline">
                <History className="h-4 w-4 mr-2" />
                Historique
              </Button>
            </Link>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => { 
                setSelectedRecipe(null); 
                setSteps([]); 
                setDialogOpen(true); 
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Recette
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={recipes}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={(row) => { setSelectedRecipe(row); setDetailsOpen(true); }}
        emptyMessage="Aucune recette trouvée"
        emptyIcon={BookOpen}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setSteps([]); }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRecipe ? `Modifier ${selectedRecipe.title}` : 'Nouvelle Recette'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input 
                  name="title" 
                  defaultValue={selectedRecipe?.title}
                  required 
                  placeholder="ex: Chocolat noir premium"
                />
              </div>
              <div className="space-y-2">
                <Label>Type de recette</Label>
                <Select name="type_id" defaultValue={selectedRecipe?.type_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipeTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                name="description"
                defaultValue={selectedRecipe?.description}
                rows={2}
                placeholder="Description détaillée de la recette"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Version</Label>
                <Input 
                  name="version" 
                  defaultValue={selectedRecipe?.version || '1.0'}
                  placeholder="1.0"
                />
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select name="status" defaultValue={selectedRecipe?.status || 'draft'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="obsolete">Obsolète</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Steps Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Étapes de Production</Label>
                <Button type="button" variant="outline" size="sm" onClick={addStep}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter une étape
                </Button>
              </div>
              
              {steps.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <ListOrdered className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Aucune étape ajoutée</p>
                  <Button type="button" variant="ghost" size="sm" onClick={addStep} className="mt-2">
                    Ajouter la première étape
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {steps.map((step, stepIdx) => (
                    <Card key={stepIdx} className="border-l-4 border-l-indigo-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-sm font-semibold text-indigo-600">
                              {step.lineorder}
                            </span>
                            Étape {step.lineorder}
                          </CardTitle>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeStep(stepIdx)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Textarea
                          placeholder="Description de l'étape (ex: Mélanger les ingrédients secs...)"
                          value={step.description}
                          onChange={(e) => updateStep(stepIdx, 'description', e.target.value)}
                          rows={2}
                        />
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Composants (Matières premières)</Label>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => addComponent(stepIdx)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Ajouter
                            </Button>
                          </div>
                          
                          {step.components.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Aucun composant</p>
                          ) : (
                            <div className="space-y-2">
                              {step.components.map((comp, compIdx) => (
                                <div key={compIdx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                  <Select
                                    value={comp.rawmaterial_id}
                                    onValueChange={(v) => updateComponent(stepIdx, compIdx, 'rawmaterial_id', v)}
                                  >
                                    <SelectTrigger className="flex-1">
                                      <SelectValue placeholder="Matière première" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {rawMaterials.map((rm) => (
                                        <SelectItem key={rm.id} value={rm.id}>
                                          {rm.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    type="number"
                                    placeholder="Qté"
                                    value={comp.quantity}
                                    onChange={(e) => updateComponent(stepIdx, compIdx, 'quantity', parseFloat(e.target.value))}
                                    className="w-24"
                                    step="0.01"
                                  />
                                  <Input
                                    placeholder="Unité"
                                    value={comp.unity}
                                    onChange={(e) => updateComponent(stepIdx, compIdx, 'unity', e.target.value)}
                                    className="w-20"
                                  />
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeComponent(stepIdx, compIdx)}
                                  >
                                    <X className="h-4 w-4 text-slate-400" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedRecipe ? 'Mettre à jour' : 'Créer'} la recette
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedRecipe?.title}</span>
              <Badge variant="outline">v{selectedRecipe?.version}</Badge>
              <StatusBadge status={selectedRecipe?.status} />
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecipe && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500 mb-1">Code</p>
                    <p className="font-mono font-medium">{selectedRecipe.code}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500 mb-1">Type</p>
                    <p className="font-medium">{selectedRecipe.type_name || '-'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-slate-500 mb-1">Coût Estimé</p>
                    <p className="font-medium text-lg">${(selectedRecipe.cost || 0).toFixed(2)}</p>
                  </CardContent>
                </Card>
              </div>

              {selectedRecipe.description && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedRecipe.description}</p>
                </div>
              )}

              {selectedRecipe.steps?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-4">Étapes de Production</h3>
                  <div className="space-y-4">
                    {selectedRecipe.steps.map((step, idx) => (
                      <Card key={idx} className="border-l-4 border-l-indigo-400">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                              {step.lineorder}
                            </span>
                            Étape {step.lineorder}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
                          
                          {step.components?.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-slate-500">Composants:</p>
                              <div className="space-y-1">
                                {step.components.map((comp, compIdx) => (
                                  <div key={compIdx} className="flex items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                    <span className="font-medium">{comp.rawmaterial_name}</span>
                                    <span className="text-slate-500">
                                      {comp.quantity} {comp.unity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setDetailsOpen(false);
                  openEdit(selectedRecipe);
                }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}