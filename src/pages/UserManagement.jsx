import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
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
  Users, 
  Plus, 
  Eye,
  Shield,
  Mail,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function UserManagement() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date', 100)
  });

  const handleInvite = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await base44.users.inviteUser(
        formData.get('email'),
        formData.get('role')
      );
      toast.success('User invited successfully');
      setInviteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to invite user');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      user: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    };
    return colors[role] || 'bg-slate-100 text-slate-700';
  };

  const columns = [
    {
      key: 'full_name',
      label: 'User',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30">
              {value?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <Badge className={getRoleColor(value)}>
          <Shield className="h-3 w-3 mr-1" />
          {value === 'admin' ? 'Administrator' : 'User'}
        </Badge>
      )
    },
    {
      key: 'created_date',
      label: 'Joined',
      sortable: true,
      render: (value) => value ? format(new Date(value), 'MMM d, yyyy') : '-'
    }
  ];

  const actions = [
    { label: 'View Details', icon: Eye, onClick: (row) => { setSelectedUser(row); setDetailsOpen(true); } }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage team members and access control"
        icon={Users}
        breadcrumbs={['Administration', 'Users']}
        actions={
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setInviteDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        }
      />

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-300">Access Control</p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Only admin users can invite others and manage roles. Regular users can only view and update their own profile.
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        actions={actions}
        onRowClick={(row) => { setSelectedUser(row); setDetailsOpen(true); }}
        emptyMessage="No users found"
        emptyIcon={Users}
      />

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation email to add a new team member
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input 
                name="email" 
                type="email"
                required 
                placeholder="user@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select name="role" defaultValue="user" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Admins have full access. Users have limited permissions.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                Send Invitation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xl">
                    {selectedUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.full_name}</h3>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {selectedUser.role === 'admin' ? 'Administrator' : 'User'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">Email:</span>
                  <span className="font-medium">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">Joined:</span>
                  <span className="font-medium">
                    {selectedUser.created_date ? format(new Date(selectedUser.created_date), 'MMMM d, yyyy') : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}