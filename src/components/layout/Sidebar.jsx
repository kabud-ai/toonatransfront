import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  FileText,
  BarChart3,
  Layers,
  ClipboardCheck,
  Factory
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const modules = [
  {
    id: 'main',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    ]
  },
  {
    id: 'production',
    label: 'Production',
    items: [
      { name: 'Recettes', icon: Layers, page: 'Recipes' },
      { name: 'Planification', icon: BarChart3, page: 'ProductionPlans' },
      { name: 'Produits Finis', icon: Package, page: 'Products' },
    ]
  },
  {
    id: 'inventory',
    label: 'Inventaire',
    items: [
      { name: 'Matières Premières', icon: Boxes, page: 'RawMaterials' },
      { name: 'Entrepôts', icon: Building2, page: 'Warehouses' },
    ]
  },
  {
    id: 'config',
    label: 'Configuration',
    items: [
      { name: 'Unités de Mesure', icon: Settings, page: 'Unities' },
      { name: 'Types de Recettes', icon: FileText, page: 'RecipeTypes' },
      { name: 'Historique Recettes', icon: ClipboardCheck, page: 'RecipeHistory' },
    ]
  },
  {
    id: 'admin',
    label: 'Administration',
    items: [
      { name: 'Utilisateurs', icon: Users, page: 'UserManagement' },
      { name: 'Paramètres', icon: Settings, page: 'Settings' },
    ]
  }
];

export default function Sidebar({ currentPage, collapsed, onToggle }) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300 flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Factory className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight">ProducFlow</span>
            </div>
          )}
          {collapsed && (
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center mx-auto">
              <Factory className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-2 space-y-6">
            {modules.map((module) => (
              <div key={module.id}>
                {!collapsed && module.label && (
                  <p className="px-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                    {module.label}
                  </p>
                )}
                <div className="space-y-1">
                  {module.items.map((item) => {
                    const isActive = currentPage === item.page;
                    const Icon = item.icon;
                    
                    const linkContent = (
                      <Link
                        to={createPageUrl(item.page)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                          isActive 
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                        )}
                      >
                        <Icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
                        {!collapsed && (
                          <span className="text-sm font-medium">{item.name}</span>
                        )}
                      </Link>
                    );

                    if (collapsed) {
                      return (
                        <Tooltip key={item.name}>
                          <TooltipTrigger asChild>
                            {linkContent}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-slate-800 text-white border-slate-700">
                            {item.name}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return <div key={item.name}>{linkContent}</div>;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-slate-800">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}