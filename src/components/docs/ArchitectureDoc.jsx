import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Code } from 'lucide-react';

export default function ArchitectureDoc() {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <h1>Architecture Technique - Système ERP</h1>

      <h2>📐 Structure Globale</h2>
      <p>Le système est construit sur la plateforme Base44 avec une architecture modulaire. Les fichiers sont organisés par fonction technique (pages, components, entities).</p>

      <h2>🗂️ Organisation des Dossiers</h2>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
{`/
├── pages/              # Pages de l'application (routes)
├── components/         # Composants React réutilisables
│   ├── ui/            # Composants UI de base (shadcn)
│   ├── common/        # Composants communs
│   ├── dashboard/     # Widgets du tableau de bord
│   ├── i18n/          # Internationalisation
│   ├── layout/        # Layout (Sidebar, Header)
│   ├── permissions/   # Gestion des permissions
│   └── [module]/      # Composants par module
├── entities/          # Schémas de données (JSON Schema)
├── Layout.js          # Layout principal
└── globals.css        # Styles globaux`}
      </pre>

      <h2>🎯 Modules Fonctionnels</h2>

      <h3>1. Module Dashboard</h3>
      <p><strong>Fichiers principaux</strong> :</p>
      <ul>
        <li><code>pages/Dashboard.jsx</code> - Page principale</li>
        <li><code>components/dashboard/WidgetLibrary.jsx</code> - Widgets KPI</li>
        <li><code>components/dashboard/WidgetCustomizer.jsx</code> - Personnalisation</li>
      </ul>
      <p><strong>Entités</strong> : <code>DashboardPreference</code></p>

      <h3>2. Module Production</h3>
      <p><strong>Ordres de Fabrication</strong> :</p>
      <ul>
        <li><code>pages/ManufacturingOrders.jsx</code></li>
        <li><code>entities/ManufacturingOrder.json</code></li>
      </ul>
      <p><strong>Recettes</strong> :</p>
      <ul>
        <li><code>pages/Recipes.jsx</code></li>
        <li><code>pages/RecipeHistory.jsx</code></li>
        <li><code>entities/Recipe.json</code></li>
      </ul>

      <h3>3. Module Inventaire</h3>
      <p><strong>Gestion des Stocks</strong> :</p>
      <ul>
        <li><code>pages/Inventory.jsx</code></li>
        <li><code>pages/StockAlerts.jsx</code></li>
        <li><code>entities/StockLevel.json</code></li>
        <li><code>entities/StockMovement.json</code></li>
      </ul>
      <p><strong>Traçabilité des Lots</strong> :</p>
      <ul>
        <li><code>pages/LotTracking.jsx</code></li>
        <li><code>entities/ProductLot.json</code></li>
        <li><code>entities/LotMovement.json</code></li>
      </ul>

      <h3>4. Module Achats</h3>
      <ul>
        <li><code>pages/PurchaseOrders.jsx</code> - Bons de commande</li>
        <li><code>pages/Suppliers.jsx</code> - Fournisseurs</li>
        <li><code>pages/GoodsReceipts.jsx</code> - Réceptions</li>
        <li><code>pages/AutoReplenishment.jsx</code> - Réappro auto</li>
      </ul>

      <h3>5. Module Qualité</h3>
      <ul>
        <li><code>pages/QualityInspections.jsx</code></li>
        <li><code>entities/QualityInspection.json</code></li>
      </ul>

      <h3>6. Module Maintenance</h3>
      <ul>
        <li><code>pages/MaintenanceOrders.jsx</code></li>
        <li><code>pages/Equipment.jsx</code></li>
      </ul>

      <h3>7. Module Administration</h3>
      <ul>
        <li><code>pages/UserManagement.jsx</code> - Gestion utilisateurs</li>
        <li><code>pages/RolesManagement.jsx</code> - Gestion rôles</li>
        <li><code>entities/Role.json</code> - Schéma rôles</li>
        <li><code>components/permissions/PermissionGuard.jsx</code></li>
      </ul>

      <h2>🧩 Composants Partagés</h2>

      <h3>UI de Base (components/ui/)</h3>
      <p>Composants Shadcn/ui : button, input, select, dialog, etc.</p>

      <h3>Composants Communs (components/common/)</h3>
      <ul>
        <li><strong>DataTable.jsx</strong> - Table réutilisable avec tri, filtrage, pagination</li>
        <li><strong>PageHeader.jsx</strong> - En-tête standardisé</li>
        <li><strong>StatusBadge.jsx</strong> - Badges de statut</li>
        <li><strong>StatCard.jsx</strong> - Cartes statistiques</li>
      </ul>

      <h2>🔄 Flux de Données</h2>

      <Alert className="my-4">
        <Code className="h-4 w-4" />
        <AlertDescription>
          <strong>Frontend → Backend</strong>
          <pre className="mt-2 text-xs bg-slate-900 text-slate-100 p-2 rounded">
{`import { base44 } from '@/api/base44Client';

// Lecture
const products = await base44.entities.Product.list();
const product = await base44.entities.Product.get(id);

// Écriture
await base44.entities.Product.create(data);
await base44.entities.Product.update(id, data);
await base44.entities.Product.delete(id);

// Auth
const user = await base44.auth.me();
await base44.auth.updateMe(data);`}
          </pre>
        </AlertDescription>
      </Alert>

      <h2>🔐 Sécurité & Permissions</h2>
      
      <h3>Garde de Permissions</h3>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg">
{`import { withPermission } from '@/components/permissions/PermissionGuard';

function MyPage() { ... }

export default withPermission(MyPage, 'products', 'view');`}
      </pre>

      <h3>Permissions Disponibles</h3>
      <p>18 modules avec 4-5 permissions chacun :</p>
      <ul>
        <li><strong>view</strong> - Consulter</li>
        <li><strong>create</strong> - Créer</li>
        <li><strong>edit</strong> - Modifier</li>
        <li><strong>delete</strong> - Supprimer</li>
        <li><strong>execute/approve/adjust</strong> - Actions spéciales</li>
      </ul>

      <h2>🎯 Bonnes Pratiques</h2>
      
      <h3>1. Structure des Fichiers</h3>
      <ul>
        <li>✅ Composants petits et focalisés (≤ 300 lignes)</li>
        <li>✅ Extraction des sous-composants</li>
        <li>✅ Un composant = une responsabilité</li>
      </ul>

      <h3>2. État et Données</h3>
      <ul>
        <li>✅ TanStack Query pour données serveur</li>
        <li>✅ useState pour UI locale uniquement</li>
        <li>✅ Cache automatique, invalidation intelligente</li>
      </ul>

      <h3>3. Traductions</h3>
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg">
{`const { t } = useTranslation();
{t('products.title')} // ✅
"Products" // ❌`}
      </pre>

      <h2>📦 Dépendances Principales</h2>
      <ul>
        <li>react: ^18.2.0</li>
        <li>@tanstack/react-query: ^5.84.1</li>
        <li>tailwindcss + shadcn/ui</li>
        <li>recharts: ^2.15.4</li>
        <li>framer-motion: ^11.16.4</li>
        <li>@base44/sdk: ^0.8.3</li>
      </ul>

      <h2>🔄 Cycle de Développement</h2>
      <p><strong>Ajout d'une nouvelle fonctionnalité</strong> :</p>
      <ol>
        <li>Définir l'entité (<code>entities/MyEntity.json</code>)</li>
        <li>Créer la page (<code>pages/MyPage.jsx</code>)</li>
        <li>Extraire les composants (<code>components/mymodule/</code>)</li>
        <li>Ajouter les traductions</li>
        <li>Configurer les permissions</li>
        <li>Ajouter au sidebar</li>
        <li>Tester</li>
      </ol>

      <hr />
      <p className="text-sm text-muted-foreground">Pour plus de détails sur un module spécifique, consultez les guides utilisateur correspondants.</p>
    </div>
  );
}