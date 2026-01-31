import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Import markdown files as strings
import readmeMd from '@/components/docs/README.md?raw';
import architectureMd from '@/components/docs/ARCHITECTURE.md?raw';
import adminGuideMd from '@/components/docs/admin-guide.md?raw';
import productionGuideMd from '@/components/docs/production-manager-guide.md?raw';
import inventoryGuideMd from '@/components/docs/inventory-manager-guide.md?raw';
import buyerGuideMd from '@/components/docs/buyer-guide.md?raw';
import qualityGuideMd from '@/components/docs/quality-manager-guide.md?raw';
import maintenanceGuideMd from '@/components/docs/maintenance-manager-guide.md?raw';

export default function Documentation() {
  const { t } = useTranslation();
  const [selectedDoc, setSelectedDoc] = useState('readme');

  const docs = {
    readme: { content: readmeMd, icon: BookOpen, title: 'Vue d\'ensemble' },
    architecture: { content: architectureMd, icon: Code, title: 'Architecture Technique' },
    admin: { content: adminGuideMd, icon: Shield, title: 'Guide Administrateur' },
    production: { content: productionGuideMd, icon: Factory, title: 'Guide Production' },
    inventory: { content: inventoryGuideMd, icon: Package, title: 'Guide Inventaire' },
    buyer: { content: buyerGuideMd, icon: ShoppingCart, title: 'Guide Acheteur' },
    quality: { content: qualityGuideMd, icon: ClipboardCheck, title: 'Guide Qualité' },
    maintenance: { content: maintenanceGuideMd, icon: Wrench, title: 'Guide Maintenance' }
  };

  const currentDoc = docs[selectedDoc];
  const DocIcon = currentDoc.icon;

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
              <Button
                variant={selectedDoc === 'buyer' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sm"
                onClick={() => setSelectedDoc('buyer')}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Acheteur
              </Button>
              <Button
                variant={selectedDoc === 'quality' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sm"
                onClick={() => setSelectedDoc('quality')}
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Qualité
              </Button>
              <Button
                variant={selectedDoc === 'maintenance' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-sm"
                onClick={() => setSelectedDoc('maintenance')}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Maintenance
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
          <CardContent className="pt-6">
            <div className="prose prose-slate max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 pb-2 border-b">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>,
                  h4: ({ children }) => <h4 className="text-lg font-medium mt-3 mb-2">{children}</h4>,
                  p: ({ children }) => <p className="my-3 leading-7">{children}</p>,
                  ul: ({ children }) => <ul className="my-3 ml-6 list-disc space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="my-3 ml-6 list-decimal space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="leading-7">{children}</li>,
                  code: ({ inline, children }) => 
                    inline ? (
                      <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-slate-200">
                        {children}
                      </code>
                    ) : (
                      <code className="block p-4 rounded-lg bg-slate-900 text-slate-100 overflow-x-auto text-sm">
                        {children}
                      </code>
                    ),
                  pre: ({ children }) => <pre className="my-4 rounded-lg overflow-hidden">{children}</pre>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="my-4 overflow-x-auto">
                      <table className="min-w-full border-collapse border border-slate-300 dark:border-slate-700">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-slate-300 dark:border-slate-700 px-4 py-2 bg-slate-100 dark:bg-slate-800 font-semibold text-left">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-slate-300 dark:border-slate-700 px-4 py-2">
                      {children}
                    </td>
                  ),
                  hr: () => <hr className="my-8 border-slate-300 dark:border-slate-700" />,
                }}
              >
                {currentDoc.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}