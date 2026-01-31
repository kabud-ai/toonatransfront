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
  Truck, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2,
  Star,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function Suppliers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Supplier.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Supplier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setDialogOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Supplier.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      name: formData.get('name'),
      code: formData.get('code'),
      contact_name: formData.get('contact_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      country: formData.get('country'),
      payment_terms: formData.get('payment_terms'),
      lead_time_days: parseInt(formData.get('lead_time_days')) || 7,
      notes: formData.get('notes'),
      is_active: true
    };

    if (selectedSupplier) {
      updateMutation.mutate({ id: selectedSupplier.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const renderRating = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= (rating || 0) 
                ? 'text-amber-400 fill-amber-400' 
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (value) => (
        <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Supplier Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              {value?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-slate-500">{row.contact_name}</p>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Contact',
      render: (value, row) => (
        <div className="text-sm">
          <p>{value}</p>
          <p className="text-slate-500">{row.phone}</p>
        </div>
      )
    },
    {
      key: 'city',
      label: 'Location',
      render: (value, row) => value && row.country ? `${value}, ${row.country}` : value || row.country || '-'
    },
    {
      key: 'lead_time_days',
      label: 'Lead Time',
      render: (value) => `${value || 7} days`
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (value) => renderRating(value)
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <Badge className={value ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  const actions = [
    { label: 'View', icon: Eye, onClick: (row) => { setSelectedSupplier(row); setDetailsOpen(true); } },
    { label: 'Edit', icon: Pencil, onClick: (row) => { setSelectedSupplier(row); setDialogOpen(true); } },
    { label: 'Delete', icon: Trash2, onClick: (row) => deleteMutation.mutate(row.id), destructive: true }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('suppliers.title') || t('nav.suppliers')}
        description={t('suppliers.description')}
        icon={Truck}
        breadcrumbs={[t('nav.purchasing'), t('nav.suppliers')]}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => { setSelectedSupplier(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('suppliers.addSupplier')}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={suppliers}
        loading={isLoading}
        selectable
        actions={actions}
        onRowClick={(row) => { setSelectedSupplier(row); setDetailsOpen(true); }}
        emptyMessage="No suppliers found"
        emptyIcon={Truck}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSupplier ? 'Edit Supplier' : 'New Supplier'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier Name *</Label>
                <Input 
                  name="name" 
                  defaultValue={selectedSupplier?.name}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input 
                  name="code" 
                  defaultValue={selectedSupplier?.code}
                  required 
                  placeholder="e.g., SUP-001"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input 
                  name="contact_name" 
                  defaultValue={selectedSupplier?.contact_name}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  name="email" 
                  type="email"
                  defaultValue={selectedSupplier?.email}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  name="phone" 
                  defaultValue={selectedSupplier?.phone}
                />
              </div>
              <div className="space-y-2">
                <Label>Lead Time (days)</Label>
                <Input 
                  name="lead_time_days" 
                  type="number"
                  defaultValue={selectedSupplier?.lead_time_days || 7}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input 
                name="address" 
                defaultValue={selectedSupplier?.address}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input 
                  name="city" 
                  defaultValue={selectedSupplier?.city}
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input 
                  name="country" 
                  defaultValue={selectedSupplier?.country}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Input 
                name="payment_terms" 
                defaultValue={selectedSupplier?.payment_terms}
                placeholder="e.g., Net 30"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                name="notes"
                defaultValue={selectedSupplier?.notes}
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {selectedSupplier ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSupplier?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedSupplier && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge className="text-sm bg-slate-100 text-slate-700 font-mono">
                  {selectedSupplier.code}
                </Badge>
                {renderRating(selectedSupplier.rating)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{selectedSupplier.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{selectedSupplier.phone || '-'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                      <span>
                        {selectedSupplier.address && <>{selectedSupplier.address}<br /></>}
                        {selectedSupplier.city && selectedSupplier.country 
                          ? `${selectedSupplier.city}, ${selectedSupplier.country}`
                          : selectedSupplier.city || selectedSupplier.country || '-'
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Contact Person</p>
                      <p className="font-medium">{selectedSupplier.contact_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Lead Time</p>
                      <p className="font-medium">{selectedSupplier.lead_time_days || 7} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Payment Terms</p>
                      <p className="font-medium">{selectedSupplier.payment_terms || '-'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedSupplier.notes && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedSupplier.notes}</p>
                </div>
              )}

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