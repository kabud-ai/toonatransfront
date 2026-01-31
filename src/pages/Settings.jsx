import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Building2,
  Palette,
  Globe,
  Bell,
  Shield,
  Save,
  Package,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/components/i18n/LanguageContext';

export default function Settings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.Company.list()
  });

  const company = companies[0] || null;

  const updateCompany = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Company.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Settings saved successfully');
    }
  });

  const createCompany = useMutation({
    mutationFn: (data) => base44.entities.Company.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company created successfully');
    }
  });

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      name: formData.get('name'),
      industry: formData.get('industry'),
      timezone: formData.get('timezone'),
      currency: formData.get('currency'),
      date_format: formData.get('date_format')
    };

    if (company) {
      updateCompany.mutate({ id: company.id, data });
    } else {
      createCompany.mutate(data);
    }
  };

  const handleSaveModules = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const modules = [];
    formData.forEach((value, key) => {
      if (value === 'on') modules.push(key);
    });

    if (company) {
      updateCompany.mutate({ 
        id: company.id, 
        data: { enabled_modules: modules }
      });
    }
  };

  const handleSaveTheme = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      primary_color: formData.get('primary_color')
    };

    if (company) {
      updateCompany.mutate({ id: company.id, data });
    }
  };

  const allModules = [
    { id: 'dashboard', name: 'Dashboard', icon: SettingsIcon, description: 'Overview and analytics' },
    { id: 'bom', name: 'Bill of Materials', icon: Layers, description: 'Product structures' },
    { id: 'inventory', name: 'Inventory', icon: Package, description: 'Stock management' },
    { id: 'manufacturing', name: 'Manufacturing', icon: Building2, description: 'Production orders' },
    { id: 'quality', name: 'Quality Control', icon: Shield, description: 'Quality inspections' },
    { id: 'purchasing', name: 'Purchasing', icon: Package, description: 'Supplier orders' },
    { id: 'maintenance', name: 'Maintenance', icon: SettingsIcon, description: 'Equipment maintenance' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('settings.title') || t('nav.settings')}
        description={t('settings.description')}
        icon={SettingsIcon}
        breadcrumbs={[t('settings.administration') || 'Administration', t('nav.settings')]}
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            {t('settings.general')}
          </TabsTrigger>
          <TabsTrigger value="modules">
            <Package className="h-4 w-4 mr-2" />
            {t('settings.modules')}
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            {t('settings.appearance')}
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.companyInfo')}</CardTitle>
              <CardDescription>
                {t('settings.companyInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGeneral} className="space-y-6">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input 
                    name="name" 
                    defaultValue={company?.name}
                    placeholder="Your Company Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select name="industry" defaultValue={company?.industry || 'general'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Manufacturing</SelectItem>
                        <SelectItem value="agro_food">Agro-Food</SelectItem>
                        <SelectItem value="textile">Textile</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="chemical">Chemical</SelectItem>
                        <SelectItem value="cosmetic">Cosmetic</SelectItem>
                        <SelectItem value="mechanical">Mechanical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select name="currency" defaultValue={company?.currency || 'USD'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select name="timezone" defaultValue={company?.timezone || 'UTC'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                        <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select name="date_format" defaultValue={company?.date_format || 'YYYY-MM-DD'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="h-4 w-4 mr-2" />
                    {t('settings.saveChanges')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Settings */}
        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.moduleConfig')}</CardTitle>
              <CardDescription>
                {t('settings.moduleConfigDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveModules}>
                <div className="space-y-4">
                  {allModules.map((module) => {
                    const isEnabled = company?.enabled_modules?.includes(module.id) ?? true;
                    return (
                      <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <module.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium">{module.name}</p>
                            <p className="text-sm text-slate-500">{module.description}</p>
                          </div>
                        </div>
                        <Switch name={module.id} defaultChecked={isEnabled} />
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-6">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="h-4 w-4 mr-2" />
                    {t('settings.saveModules')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.themeCustomization')}</CardTitle>
              <CardDescription>
                {t('settings.themeCustomizationDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveTheme} className="space-y-6">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      name="primary_color" 
                      type="color"
                      defaultValue={company?.primary_color || '#4F46E5'}
                      className="w-24 h-10"
                    />
                    <span className="text-sm text-slate-500">
                      Choose the main color for buttons and highlights
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="h-4 w-4 mr-2" />
                    {t('settings.saveTheme')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}