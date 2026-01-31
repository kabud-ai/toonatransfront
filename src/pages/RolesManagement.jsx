import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Shield, Plus, Eye, Pencil, Trash2, Lock } from 'lucide-react';
import { useTranslation } from '@/components/i18n/LanguageContext';

const MODULES = [
  { key: 'dashboard', label: 'Dashboard', permissions: ['view'] },
  { key: 'products', label: 'Produits', permissions: ['view', 'create', 'edit', 'delete'] },
  { key: 'recipes', label: 'Recettes', permissions: ['view', 'create', 'edit', 'delete'] },
  { key: 'bom', label: 'Nomenclatures (BOM)', permissions: ['view', 'create', 'edit', 'delete'] },
  { key: 'manufacturing_orders', label: 'Ordres de Fabrication', permissions: ['view', 'create', 'edit', 'delete', 'execute'] },
  { key: 'inventory', label: 'Inventaire', permissions: ['view', 'create', 'edit', 'delete', 'adjust'] },
  { key: 'warehouses', label: 'Entrepôts', permissions: ['view', 'create', 'edit', 'delete'] },
  { key: 'lots', label: 'Lots', permissions: ['view', 'create', 'edit', 'delete', 'quarantine'] },
  { key: 'suppliers', label: 'Fournisseurs', permissions: ['view', 'create', 'edit', 'delete'] },
  { key: 'purchase_orders', label: 'Commandes Achat', permissions: ['view', 'create', 'edit', 'delete', 'approve'] },
  { key: 'goods_receipts', label: 'Bons de Réception', permissions: ['view', 'create', 'edit', 'delete'] },
  { key: 'quality', label: 'Qualité', permissions: ['view', 'create', 'edit', 'delete', 'approve'] },
  { key: 'maintenance', label: 'Maintenance', permissions: ['view', 'create', 'edit', 'delete'] },
  { key: 'equipment', label: 'Équipements', permissions: ['view', 'create', 'edit', 'delete'] },
  { key: 'settings', label: 'Paramètres', permissions: ['view', 'edit'] },
  { key: 'users', label: 'Utilisateurs', permissions: ['view', 'create', 'edit', 'delete'] },
  { key: 'roles', label: 'Rôles', permissions: ['view', 'create', 'edit', 'delete'] },
  { key: 'reports', label: 'Rapports', permissions: ['view', 'financial'] },
];

const PERMISSION_LABELS = {
  view: 'Voir',
  create: 'Créer',
  edit: 'Modifier',
  delete: 'Supprimer',
  execute: 'Exécuter',
  adjust: 'Ajuster',
  quarantine: 'Quarantaine',
  approve: 'Approuver',
  financial: 'Financier'
};

export default function RolesManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [permissions, setPermissions] = useState({});

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Role.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Role.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Role.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
  });

  const handleOpenDialog = (role = null) => {
    setSelectedRole(role);
    if (role) {
      setPermissions(role.permissions || {});
    } else {
      // Initialize default permissions structure
      const defaultPerms = {};
      MODULES.forEach(module => {
        defaultPerms[module.key] = {};
        module.permissions.forEach(perm => {
          defaultPerms[module.key][perm] = false;
        });
      });
      setPermissions(defaultPerms);
    }
    setDialogOpen(true);
  };

  const handlePermissionChange = (module, permission, checked) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: checked
      }
    }));
  };

  const handleSelectAllModule = (module, checked) => {
    const moduleConfig = MODULES.find(m => m.key === module);
    const newPerms = {};
    moduleConfig.permissions.forEach(perm => {
      newPerms[perm] = checked;
    });
    setPermissions(prev => ({
      ...prev,
      [module]: newPerms
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      name: formData.get('name'),
      code: formData.get('code'),
      description: formData.get('description'),
      permissions: permissions,
      is_active: true,
      is_system_role: false
    };

    if (selectedRole) {
      updateMutation.mutate({ id: selectedRole.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const countPermissions = (role) => {
    if (!role.permissions) return 0;
    let count = 0;
    Object.values(role.permissions).forEach(modulePerms => {
      Object.values(modulePerms).forEach(val => {
        if (val === true) count++;
      });
    });
    return count;
  };

  const columns = [
    {
      key: 'name',
      label: 'Nom du Rôle',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-medium flex items-center gap-2">
              {value}
              {row.is_system_role && <Lock className="h-3 w-3 text-slate-400" />}
            </p>
            <p className="text-xs text-slate-500 font-mono">{row.code}</p>
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
      key: 'permissions',
      label: 'Permissions',
      render: (value, row) => (
        <Badge variant="outline">
          {countPermissions(row)} permissions
        </Badge>
      )
    },
    {
      key: 'is_active',
      label: 'Statut',
      render: (value) => (
        <Badge className={value ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
          {value ? 'Actif' : 'Inactif'}
        </Badge>
      )
    }
  ];

  const actions = [
    { label: 'Voir', icon: Eye, onClick: (row) => { setSelectedRole(row); setDetailsOpen(true); } },
    { 
      label: 'Modifier', 
      icon: Pencil, 
      onClick: (row) => handleOpenDialog(row),
      disabled: (row) => row.is_system_role
    },
    { 
      label: 'Supprimer', 
      icon: Trash2, 
      onClick: (row) => deleteMutation.mutate(row.id),
      destructive: true,
      disabled: (row) => row.is_system_role
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Rôles"
        description="Créez et gérez les rôles avec des permissions personnalisées"
        icon={Shield}
        breadcrumbs={['Paramètres', 'Rôles']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Rôle
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={roles}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={(row) => { setSelectedRole(row); setDetailsOpen(true); }}
        emptyMessage="Aucun rôle trouvé"
        emptyIcon={Shield}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRole ? 'Modifier le Rôle' : 'Nouveau Rôle'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du Rôle *</Label>
                <Input 
                  name="name" 
                  defaultValue={selectedRole?.name}
                  required 
                  placeholder="ex: Chef d'Atelier"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input 
                  name="code" 
                  defaultValue={selectedRole?.code}
                  required 
                  placeholder="ex: CHEF_ATELIER"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                name="description"
                defaultValue={selectedRole?.description}
                rows={2}
                placeholder="Description du rôle et de ses responsabilités"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base">Permissions par Module</Label>
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                <Accordion type="multiple" className="space-y-2">
                  {MODULES.map(module => (
                    <AccordionItem key={module.key} value={module.key} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium">{module.label}</span>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={module.permissions.every(p => permissions[module.key]?.[p])}
                              onCheckedChange={(checked) => handleSelectAllModule(module.key, checked)}
                            />
                            <span className="text-xs text-slate-500">Tout sélectionner</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          {module.permissions.map(perm => (
                            <div key={perm} className="flex items-center gap-2">
                              <Checkbox
                                checked={permissions[module.key]?.[perm] || false}
                                onCheckedChange={(checked) => handlePermissionChange(module.key, perm, checked)}
                              />
                              <Label className="font-normal cursor-pointer">
                                {PERMISSION_LABELS[perm]}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedRole ? 'Mettre à jour' : 'Créer le Rôle'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRole?.name}
              {selectedRole?.is_system_role && (
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3 w-3" /> Système
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Code</p>
                  <p className="font-mono text-sm">{selectedRole.code}</p>
                </div>
                <Badge className={selectedRole.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                  {selectedRole.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              {selectedRole.description && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Description</p>
                  <p className="text-sm">{selectedRole.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-3">Permissions Accordées</p>
                <div className="space-y-2">
                  {MODULES.map(module => {
                    const modulePerms = selectedRole.permissions?.[module.key] || {};
                    const activePerms = Object.entries(modulePerms).filter(([_, val]) => val === true);
                    
                    if (activePerms.length === 0) return null;

                    return (
                      <Card key={module.key}>
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-medium">{module.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                          <div className="flex flex-wrap gap-2">
                            {activePerms.map(([perm]) => (
                              <Badge key={perm} variant="outline" className="text-xs">
                                {PERMISSION_LABELS[perm]}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {!selectedRole.is_system_role && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setDetailsOpen(false);
                    handleOpenDialog(selectedRole);
                  }}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
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