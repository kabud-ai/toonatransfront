import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import StatCard from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Users, Plus, Eye, Shield, Mail, Calendar, UserCheck, TrendingUp,
  Phone, Building2, Pencil, UserX, UserCog, MapPin, StickyNote, CheckCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { withPermission } from '@/components/permissions/PermissionGuard';

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  user: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
};

const AVATAR_COLORS = [
  'bg-sky-100 text-sky-600',
  'bg-indigo-100 text-indigo-600',
  'bg-emerald-100 text-emerald-600',
  'bg-rose-100 text-rose-600',
  'bg-amber-100 text-amber-600',
  'bg-violet-100 text-violet-600',
];

function getAvatarColor(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function UserManagementPage() {
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editingRoleId, setEditingRoleId] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date', 200)
  });
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });
  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list()
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditOpen(false);
      setRoleOpen(false);
      toast.success('Utilisateur mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour')
  });

  const handleInvite = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await base44.users.inviteUser(fd.get('email'), fd.get('role'));
      toast.success('Invitation envoyée avec succès');
      setInviteOpen(false);
      e.target.reset();
    } catch {
      toast.error("Échec de l'invitation");
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const site = sites.find(s => s.id === editForm.site_id);
    updateUser.mutate({ id: selectedUser.id, data: { ...editForm, site_name: site?.name } });
  };

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    const role = roles.find(r => r.id === editingRoleId);
    updateUser.mutate({ id: selectedUser.id, data: { custom_role_id: editingRoleId || null, custom_role_name: role?.name || null } });
  };

  const openEdit = (user) => { setSelectedUser(user); setEditForm({ ...user }); setEditOpen(true); setDetailsOpen(false); };
  const openRole = (user) => { setSelectedUser(user); setEditingRoleId(user.custom_role_id || ''); setRoleOpen(true); setDetailsOpen(false); };
  const openDetails = (user) => { setSelectedUser(user); setDetailsOpen(true); };

  // Stats
  const totalUsers = users.length;
  const admins = users.filter(u => u.role === 'admin').length;
  const active = users.filter(u => u.is_active !== false).length;
  const withCustomRole = users.filter(u => u.custom_role_id).length;

  const byDept = users.reduce((acc, u) => {
    if (u.department) acc[u.department] = (acc[u.department] || 0) + 1;
    return acc;
  }, {});
  const deptData = Object.entries(byDept).map(([name, value]) => ({ name, value }));
  const CHART_COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const columns = [
    {
      key: 'full_name', label: 'Utilisateur', sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            {row.avatar_url && <AvatarImage src={row.avatar_url} />}
            <AvatarFallback className={getAvatarColor(v)}>
              {v?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{v}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'job_title', label: 'Poste / Département',
      render: (v, row) => (
        <div>
          <p className="text-sm">{v || '—'}</p>
          {row.department && <p className="text-xs text-slate-500">{row.department}</p>}
        </div>
      )
    },
    {
      key: 'role', label: 'Rôle Système',
      render: (v, row) => (
        <div className="flex flex-col gap-1">
          <Badge className={ROLE_COLORS[v]}>
            <Shield className="h-3 w-3 mr-1" />
            {v === 'admin' ? 'Admin' : 'Utilisateur'}
          </Badge>
          {row.custom_role_name && <Badge variant="outline" className="text-xs">{row.custom_role_name}</Badge>}
        </div>
      )
    },
    {
      key: 'is_active', label: 'Statut',
      render: (v) => (
        <Badge className={v !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
          {v !== false ? '✓ Actif' : '✗ Inactif'}
        </Badge>
      )
    },
    {
      key: 'created_date', label: 'Inscrit le', sortable: true,
      render: (v) => v ? format(new Date(v), 'dd/MM/yyyy') : '—'
    }
  ];

  const actions = [
    { label: 'Voir le Profil', icon: Eye, onClick: openDetails },
    { label: 'Modifier', icon: Pencil, onClick: openEdit },
    { label: 'Changer le Rôle', icon: UserCog, onClick: openRole },
    { label: 'Désactiver', icon: UserX, onClick: (row) => updateUser.mutate({ id: row.id, data: { is_active: false } }), disabled: (row) => row.is_active === false },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Utilisateurs"
        description="Invitez, gérez et configurez les accès de votre équipe"
        icon={Users}
        breadcrumbs={['Administration', 'Utilisateurs']}
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Inviter un Utilisateur
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Utilisateurs" value={totalUsers} icon={Users} color="sky" />
        <StatCard title="Administrateurs" value={admins} icon={Shield} color="purple" />
        <StatCard title="Comptes Actifs" value={active} icon={UserCheck} color="green" />
        <StatCard title="Rôles Personnalisés" value={withCustomRole} icon={UserCog} color="indigo" />
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list"><Users className="h-4 w-4 mr-2" />Liste</TabsTrigger>
          <TabsTrigger value="analytics"><TrendingUp className="h-4 w-4 mr-2" />Analytique</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <DataTable
            columns={columns}
            data={users}
            loading={isLoading}
            actions={actions}
            onRowClick={openDetails}
            emptyMessage="Aucun utilisateur trouvé"
            emptyIcon={Users}
            exportFileName="utilisateurs"
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
            filterOptions={{
              role: [
                { label: 'Administrateur', value: 'admin' },
                { label: 'Utilisateur', value: 'user' },
              ]
            }}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Répartition par Rôle Système</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={[
                      { name: 'Admins', value: admins, color: '#8b5cf6' },
                      { name: 'Utilisateurs', value: totalUsers - admins, color: '#0ea5e9' },
                    ].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {[{ color: '#8b5cf6' }, { color: '#0ea5e9' }].map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {deptData.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Répartition par Département</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={deptData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" label>
                        {deptData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* User directory */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetails(user)}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                      <AvatarFallback className={getAvatarColor(user.full_name)}>
                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.job_title || user.email}</p>
                      {user.department && <p className="text-xs text-slate-400">{user.department}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3 flex-wrap">
                    <Badge className={`${ROLE_COLORS[user.role]} text-xs`}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                    {user.custom_role_name && <Badge variant="outline" className="text-xs">{user.custom_role_name}</Badge>}
                    {user.is_active === false && <Badge className="bg-red-100 text-red-700 text-xs">Inactif</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Inviter un Utilisateur</DialogTitle>
            <DialogDescription>Un email d'invitation sera envoyé à l'adresse indiquée.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label>Adresse Email *</Label>
              <Input name="email" type="email" required placeholder="utilisateur@entreprise.com" />
            </div>
            <div className="space-y-2">
              <Label>Rôle Système *</Label>
              <Select name="role" defaultValue="user">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">👤 Utilisateur</SelectItem>
                  <SelectItem value="admin">🛡️ Administrateur</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">Les admins ont un accès complet. Vous pourrez assigner un rôle personnalisé après l'inscription.</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Annuler</Button>
              <Button type="submit">Envoyer l'Invitation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Profil Utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-16 w-16">
                  {selectedUser.avatar_url && <AvatarImage src={selectedUser.avatar_url} />}
                  <AvatarFallback className={`${getAvatarColor(selectedUser.full_name)} text-xl`}>
                    {selectedUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.full_name}</h3>
                  <p className="text-slate-500 text-sm">{selectedUser.job_title || '—'}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge className={ROLE_COLORS[selectedUser.role]}>
                      <Shield className="h-3 w-3 mr-1" />{selectedUser.role === 'admin' ? 'Admin' : 'Utilisateur'}
                    </Badge>
                    {selectedUser.custom_role_name && <Badge variant="outline" className="text-xs">{selectedUser.custom_role_name}</Badge>}
                    {selectedUser.is_active === false && <Badge className="bg-red-100 text-red-700 text-xs">Inactif</Badge>}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-1 gap-3">
                {[
                  { icon: Mail, label: 'Email', value: selectedUser.email },
                  { icon: Phone, label: 'Téléphone', value: selectedUser.phone },
                  { icon: Building2, label: 'Département', value: selectedUser.department },
                  { icon: MapPin, label: 'Site', value: selectedUser.site_name },
                  { icon: Calendar, label: 'Inscrit le', value: selectedUser.created_date ? format(new Date(selectedUser.created_date), 'dd/MM/yyyy') : null },
                ].filter(i => i.value).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <item.icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-500 w-24">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
                {selectedUser.notes && (
                  <div className="flex items-start gap-3 text-sm">
                    <StickyNote className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-500 w-24">Notes</span>
                    <span className="text-sm text-slate-600">{selectedUser.notes}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t flex-wrap">
                <Button variant="outline" size="sm" onClick={() => openEdit(selectedUser)}>
                  <Pencil className="h-4 w-4 mr-1" />Modifier
                </Button>
                <Button variant="outline" size="sm" onClick={() => openRole(selectedUser)}>
                  <UserCog className="h-4 w-4 mr-1" />Changer le Rôle
                </Button>
                {selectedUser.is_active !== false ? (
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700"
                    onClick={() => { updateUser.mutate({ id: selectedUser.id, data: { is_active: false } }); setDetailsOpen(false); }}>
                    <UserX className="h-4 w-4 mr-1" />Désactiver
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700"
                    onClick={() => { updateUser.mutate({ id: selectedUser.id, data: { is_active: true } }); setDetailsOpen(false); }}>
                    <CheckCircle className="h-4 w-4 mr-1" />Réactiver
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier l'Utilisateur — {selectedUser?.full_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Poste / Fonction</Label>
                <Input value={editForm.job_title || ''} onChange={e => setEditForm({...editForm, job_title: e.target.value})} placeholder="Chef de Projet" />
              </div>
              <div className="space-y-2">
                <Label>Département</Label>
                <Input value={editForm.department || ''} onChange={e => setEditForm({...editForm, department: e.target.value})} placeholder="Production" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="+33 6 00 00 00 00" />
              </div>
              <div className="space-y-2">
                <Label>Site</Label>
                <Select value={editForm.site_id || ''} onValueChange={v => setEditForm({...editForm, site_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Choisir un site" /></SelectTrigger>
                  <SelectContent>
                    {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL Avatar</Label>
              <Input value={editForm.avatar_url || ''} onChange={e => setEditForm({...editForm, avatar_url: e.target.value})} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Notes internes</Label>
              <Textarea value={editForm.notes || ''} onChange={e => setEditForm({...editForm, notes: e.target.value})} rows={2} placeholder="Notes visibles par les admins uniquement" />
            </div>
            <div className="flex items-center gap-3 py-2 border-t">
              <Switch checked={editForm.is_active !== false} onCheckedChange={v => setEditForm({...editForm, is_active: v})} />
              <Label>Compte actif</Label>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Changer le Rôle — {selectedUser?.full_name}</DialogTitle>
            <DialogDescription>Le rôle personnalisé définit les permissions d'accès aux modules.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRoleSubmit} className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300">
              <Shield className="h-4 w-4 inline mr-1" />
              Rôle système actuel : <strong>{selectedUser?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</strong> — inchangé.
            </div>
            <div className="space-y-2">
              <Label>Rôle Personnalisé</Label>
              <Select value={editingRoleId} onValueChange={setEditingRoleId}>
                <SelectTrigger><SelectValue placeholder="Aucun rôle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">— Aucun rôle personnalisé —</SelectItem>
                  {roles.filter(r => r.is_active).map(r => (
                    <SelectItem key={r.id} value={r.id}><Shield className="h-3 w-3 inline mr-1" />{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editingRoleId && editingRoleId.trim() && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 max-h-48 overflow-y-auto">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Permissions accordées :</p>
                {(() => {
                  const role = roles.find(r => r.id === editingRoleId);
                  const perms = Object.entries(role?.permissions || {})
                    .filter(([_, p]) => Object.values(p).some(v => v))
                    .map(([mod, p]) => ({ mod, actions: Object.entries(p).filter(([_, v]) => v).map(([a]) => a) }));
                  return perms.length > 0 ? perms.map(({ mod, actions }) => (
                    <div key={mod} className="flex items-center gap-2 text-xs mb-1">
                      <Badge variant="outline" className="text-xs">{mod}</Badge>
                      <span className="text-slate-500">{actions.join(', ')}</span>
                    </div>
                  )) : <p className="text-xs text-slate-400">Aucune permission définie</p>;
                })()}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setRoleOpen(false)}>Annuler</Button>
              <Button type="submit">Appliquer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withPermission(UserManagementPage, 'users', 'view');