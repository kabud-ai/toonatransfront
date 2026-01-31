import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Code, 
  Users, 
  Factory, 
  Package, 
  ShoppingCart, 
  ClipboardCheck,
  Wrench,
  Shield,
  FileText
} from 'lucide-react';
import { useTranslation } from '@/components/i18n/LanguageContext';
import OverviewDoc from '@/components/docs/OverviewDoc';
import ArchitectureDoc from '@/components/docs/ArchitectureDoc';
import AdminGuideDoc from '@/components/docs/AdminGuideDoc';
import ProductionGuideDoc from '@/components/docs/ProductionGuideDoc';
import InventoryGuideDoc from '@/components/docs/InventoryGuideDoc';

export default function Documentation() {
  const { t } = useTranslation();
  const [selectedDoc, setSelectedDoc] = useState('readme');

  const docs = {
    readme: { component: OverviewDoc, icon: BookOpen, title: 'Vue d\'ensemble' },
    architecture: { component: ArchitectureDoc, icon: Code, title: 'Architecture Technique' },
    admin: { component: AdminGuideDoc, icon: Shield, title: 'Guide Administrateur' },
    production: { component: ProductionGuideDoc, icon: Factory, title: 'Guide Production' },
    inventory: { component: InventoryGuideDoc, icon: Package, title: 'Guide Inventaire' }
  };

  const currentDoc = docs[selectedDoc];
  const DocIcon = currentDoc.icon;
  const DocComponent = currentDoc.component;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentation"
        description="Documentation complète du système ERP"
        icon={FileText}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase px-2 py-1">
                Général
              </p>
              <Button
                variant={selectedDoc === 'readme' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sm"
                onClick={() => setSelectedDoc('readme')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Vue d'ensemble
              </Button>
              <Button
                variant={selectedDoc === 'architecture' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sm"
                onClick={() => setSelectedDoc('architecture')}
              >
                <Code className="h-4 w-4 mr-2" />
                Architecture
              </Button>
            </div>

            <div className="space-y-1 pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase px-2 py-1">
                Guides Utilisateur
              </p>
              <Button
                variant={selectedDoc === 'admin' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sm"
                onClick={() => setSelectedDoc('admin')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Administrateur
              </Button>
              <Button
                variant={selectedDoc === 'production' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sm"
                onClick={() => setSelectedDoc('production')}
              >
                <Factory className="h-4 w-4 mr-2" />
                Production
              </Button>
              <Button
                variant={selectedDoc === 'inventory' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sm"
                onClick={() => setSelectedDoc('inventory')}
              >
                <Package className="h-4 w-4 mr-2" />
                Inventaire
              </Button>

            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="lg:col-span-3">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DocIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{currentDoc.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Documentation {selectedDoc === 'architecture' || selectedDoc === 'readme' ? 'technique' : 'utilisateur'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="p-6">
                <DocComponent />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}