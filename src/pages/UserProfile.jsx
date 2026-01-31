import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Shield,
  Save,
  LogOut,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function UserProfile() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      toast.error(t('userProfile.loadError') || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.target);
    
    try {
      await base44.auth.updateMe({
        full_name: formData.get('full_name'),
        phone: formData.get('phone'),
        job_title: formData.get('job_title'),
        department: formData.get('department')
      });
      
      await loadUser();
      toast.success(t('userProfile.saved') || 'Profil mis à jour');
    } catch (error) {
      toast.error(t('common.error') || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ avatar_url: file_url });
      await loadUser();
      toast.success(t('userProfile.avatarUpdated') || 'Photo mise à jour');
    } catch (error) {
      toast.error(t('common.error') || 'Erreur');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={t('userProfile.title') || 'Mon Profil'}
        description={t('userProfile.description') || 'Gérer vos informations personnelles'}
        icon={User}
        actions={
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            {t('userProfile.logout') || 'Déconnexion'}
          </Button>
        }
      />

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="text-2xl bg-sky-100 text-sky-600">
                  {user.full_name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6 text-white" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{user.full_name || user.email}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="h-4 w-4 text-slate-400" />
                <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                  {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('userProfile.editInfo') || 'Informations personnelles'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('userProfile.fullName') || 'Nom complet'}</Label>
              <Input 
                name="full_name" 
                defaultValue={user.full_name}
                placeholder="Jean Dupont"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('userProfile.email') || 'Email'}</Label>
              <Input 
                value={user.email}
                disabled
                className="bg-slate-50 dark:bg-slate-800"
              />
              <p className="text-xs text-slate-500">
                {t('userProfile.emailNotEditable') || 'L\'email ne peut pas être modifié'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('userProfile.phone') || 'Téléphone'}</Label>
                <Input 
                  name="phone" 
                  defaultValue={user.phone}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('userProfile.jobTitle') || 'Poste'}</Label>
                <Input 
                  name="job_title" 
                  defaultValue={user.job_title}
                  placeholder="Responsable Production"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('userProfile.department') || 'Département'}</Label>
              <Input 
                name="department" 
                defaultValue={user.department}
                placeholder="Production"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? t('common.saving') || 'Enregistrement...' : t('common.save') || 'Enregistrer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('userProfile.accountInfo') || 'Informations du compte'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">{t('userProfile.accountCreated') || 'Compte créé le'}</span>
            <span className="font-medium">
              {user.created_date ? new Date(user.created_date).toLocaleDateString() : '-'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">{t('userProfile.lastUpdate') || 'Dernière modification'}</span>
            <span className="font-medium">
              {user.updated_date ? new Date(user.updated_date).toLocaleDateString() : '-'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}