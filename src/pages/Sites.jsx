import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
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
  Building2, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2,
  MapPin,
  User,
  Warehouse
} from 'lucide-react';

export default function Sites() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list('-created_date', 100)
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => base44.entities.Warehouse.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Site.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Site.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setDialogOpen(false);
      setDetailsOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Site.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites'] })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      name: formData.get('name'),
      code: formData.get('code'),
      address: formData.get('address'),
      city: formData.get('city'),
      country: formData.get('country'),
      manager_id: formData.get('manager_id'),
      is_active: true
    };

    if (selectedSite) {
      updateMutation.mutate({ id: selectedSite.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getSiteWarehouses = (siteId) => {
    return warehouses.filter(w => w.site_id === siteId);
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
      label: 'Site Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-slate-500">{row.city}, {row.country}</p>
          </div>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Address',
      render: (value) => value || '-'
    },
    {
      key: 'id',
      label: 'Warehouses',
      render: (value) => {
        const count = getSiteWarehouses(value).length;
        return <span className="font-medium">{count}</span>;
      }
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <StatusBadge status={value ? 'active' : 'offline'} customLabel={value ? 'Active' : 'Inactive'} />
      )
    }
  ];

  const actions = [
    { label: 'View', icon: Eye, onClick: (row) => { setSelectedSite(row); setDetailsOpen(true); } },
    { label: 'Edit', icon: Pencil, onClick: (row) => { setSelectedSite(row); setDialogOpen(true); } },
    { label: 'Delete', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sites"
        description="Manage production sites and facilities"
        icon={Building2}
        breadcrumbs={['Administration', 'Sites']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedSite(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Site
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={sites}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={(row) => { setSelectedSite(row); setDetailsOpen(true); }}
        emptyMessage="No sites configured"
        emptyIcon={Building2}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSite ? 'Edit Site' : 'New Site'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Site Name *</Label>
                <Input 
                  name="name" 
                  defaultValue={selectedSite?.name}
                  required 
                  placeholder="e.g., Main Factory"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input 
                  name="code" 
                  defaultValue={selectedSite?.code}
                  required 
                  placeholder="e.g., SITE-001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input 
                name="address" 
                defaultValue={selectedSite?.address}
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input 
                  name="city" 
                  defaultValue={selectedSite?.city}
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input 
                  name="country" 
                  defaultValue={selectedSite?.country}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Manager ID</Label>
              <Input 
                name="manager_id" 
                defaultValue={selectedSite?.manager_id}
                placeholder="User ID"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedSite ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedSite?.name}</span>
              <StatusBadge status={selectedSite?.is_active ? 'active' : 'offline'} />
            </DialogTitle>
          </DialogHeader>
          
          {selectedSite && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">Location</span>
                    </div>
                    <div>
                      {selectedSite.address && <p className="text-sm">{selectedSite.address}</p>}
                      <p className="text-sm font-medium">
                        {selectedSite.city}, {selectedSite.country}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Warehouse className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">Warehouses</span>
                    </div>
                    <p className="text-2xl font-semibold">
                      {getSiteWarehouses(selectedSite.id).length}
                    </p>
                    {getSiteWarehouses(selectedSite.id).length > 0 && (
                      <div className="space-y-1">
                        {getSiteWarehouses(selectedSite.id).slice(0, 3).map(w => (
                          <p key={w.id} className="text-xs text-slate-500">• {w.name}</p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Site Code</p>
                <p className="font-mono text-lg">{selectedSite.code}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setDetailsOpen(false);
                  setDialogOpen(true);
                }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}