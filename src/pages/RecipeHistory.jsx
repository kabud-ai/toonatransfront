import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  History,
  Plus,
  Pencil,
  Trash2,
  User,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function RecipeHistory() {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['recipeHistory'],
    queryFn: () => base44.entities.RecipeHistory.list('-changed_at', 100)
  });

  const getChangeTypeIcon = (type) => {
    const icons = {
      create: Plus,
      update: Pencil,
      delete: Trash2
    };
    return icons[type] || Pencil;
  };

  const getChangeTypeColor = (type) => {
    const colors = {
      create: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  const columns = [
    {
      key: 'changed_at',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="text-sm">
            {format(new Date(value), 'dd MMM yyyy HH:mm', { locale: fr })}
          </span>
        </div>
      )
    },
    {
      key: 'change_type',
      label: 'Action',
      render: (value) => {
        const Icon = getChangeTypeIcon(value);
        const labels = { create: 'Création', update: 'Modification', delete: 'Suppression' };
        return (
          <Badge className={getChangeTypeColor(value)}>
            <Icon className="h-3 w-3 mr-1" />
            {labels[value] || value}
          </Badge>
        );
      }
    },
    {
      key: 'recipe_title',
      label: 'Recette',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-slate-500 font-mono">{row.recipe_code}</p>
        </div>
      )
    },
    {
      key: 'recipe_version',
      label: 'Version',
      render: (value) => <Badge variant="outline">v{value}</Badge>
    },
    {
      key: 'changed_by',
      label: 'Utilisateur',
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="text-sm">{value}</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historique des Recettes"
        description="Traçabilité complète de toutes les modifications"
        icon={History}
        breadcrumbs={['Production', 'Recettes', 'Historique']}
      />

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <History className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-300">Audit Trail</p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Toutes les créations, modifications et suppressions de recettes sont enregistrées automatiquement pour assurer une traçabilité complète.
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={history}
        loading={isLoading}
        emptyMessage="Aucun historique disponible"
        emptyIcon={History}
      />
    </div>
  );
}