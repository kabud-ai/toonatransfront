# Architecture Technique

## Vue d'ensemble

Ce document décrit l'architecture technique de l'ERP, les technologies utilisées, la structure des données et les principes de conception.

## Stack Technologique

### Frontend

- **Framework** : React 18.2
- **Routing** : React Router DOM
- **State Management** : React Query (TanStack Query)
- **UI Components** : Shadcn/ui (Radix UI)
- **Styling** : Tailwind CSS
- **Icons** : Lucide React
- **Forms** : React Hook Form + Zod
- **Charts** : Recharts
- **i18n** : Custom Context-based solution

### Backend (BaaS)

- **Platform** : Base44
- **Database** : Base44 Entities (NoSQL)
- **Authentication** : Base44 Auth
- **File Storage** : Base44 Storage
- **Integrations** : Base44 Core (LLM, Email, Upload)

### Déploiement

- **Hosting** : Base44 Platform
- **CDN** : Automatique
- **SSL** : Automatique
- **Build** : Vite

## Architecture des Données

### Modèle d'Entités

```
┌─────────────────┐      ┌──────────────────┐
│    Product      │◄─────┤ StockLevel       │
└─────────────────┘      └──────────────────┘
         △                        ▲
         │                        │
         │                        │
┌────────┴─────────┐     ┌───────┴──────────┐
│ BillOfMaterials  │     │  ProductLot      │
└──────────────────┘     └──────────────────┘
         △                        ▲
         │                        │
         │                        │
┌────────┴──────────┐    ┌───────┴──────────┐
│     Recipe        │    │ StockMovement    │
└───────────────────┘    └──────────────────┘
         △
         │
┌────────┴──────────┐    ┌──────────────────┐
│ ManufacturingOrder│    │  SalesOrder      │
└───────────────────┘    └──────────────────┘
```

### Entités Principales

#### Produits et Matières

- **Product** : Produits finis, semi-finis, consommables
- **RawMaterial** : Matières premières
- **BillOfMaterials** : Nomenclatures de fabrication
- **Recipe** : Recettes avec étapes de production
- **RecipeType** : Types et catégories de recettes

#### Inventaire

- **StockLevel** : Niveaux de stock par entrepôt
- **ProductLot** : Lots avec traçabilité complète
- **StockMovement** : Historique des mouvements
- **LotMovement** : Mouvements spécifiques aux lots
- **Warehouse** : Entrepôts et sites
- **ReplenishmentSuggestion** : Suggestions de réapprovisionnement

#### Production

- **ManufacturingOrder** : Ordres de fabrication
- **ProductionPlan** : Planification de production
- **Routing** : Gammes opératoires
- **Workstation** : Postes de travail
- **JobCard** : Fiches de fabrication
- **ScrapEntry** : Entrées de rebut
- **SubcontractingOrder** : Ordres de sous-traitance
- **Equipment** : Machines et équipements
- **MaintenanceOrder** : Ordres de maintenance

#### Ventes

- **SalesOrder** : Commandes de vente clients
  - Statuts : `draft` → `confirmed` → `shipped` → `delivered` / `cancelled`
  - Lignes de commande avec produit, quantité, prix, remise
  - Calcul automatique : sous-total, taxes, total TTC
  - Modes de paiement : espèces, virement, chèque, carte, autre
  - Déduction automatique du stock à l'expédition

#### Achats

- **PurchaseOrder** : Bons de commande
- **GoodsReceipt** : Réceptions de marchandises
- **Supplier** : Fournisseurs
- **SupplierCatalog** : Catalogue fournisseurs

#### Qualité

- **QualityInspection** : Inspections qualité

#### Administration

- **User** : Utilisateurs (entité système)
- **Role** : Rôles personnalisés avec permissions granulaires
- **Group** : Groupes/entreprises
- **Site** : Sites physiques
- **DashboardPreference** : Préférences de tableau de bord

### Relations Clés

```
Product ──┬── has many → StockLevel (par entrepôt)
          ├── has many → ProductLot
          ├── has many → BillOfMaterials (composants)
          └── used in → Recipe (comme composant)

ManufacturingOrder ──┬── produces → Product
                     ├── uses → Recipe
                     ├── creates → ProductLot
                     └── consumes → ProductLot (matières)

SalesOrder ──┬── contains → Product lines
             ├── deducts → StockLevel (à l'expédition)
             └── generates → StockMovement (type: out)

PurchaseOrder ──┬── from → Supplier
                ├── creates → GoodsReceipt
                └── creates → ProductLot (upon receipt)

ProductLot ──┬── belongs to → Product
             ├── stored in → Warehouse
             ├── has many → LotMovement
             └── has → QualityInspection
```

## Architecture Frontend

### Structure des Dossiers

```
src/
├── pages/               # Pages principales
│   ├── Dashboard.jsx
│   ├── Products.jsx
│   ├── ManufacturingOrders.jsx
│   ├── SalesOrders.jsx
│   └── ...
├── components/
│   ├── ui/             # Composants UI de base (shadcn)
│   ├── layout/         # Header, Sidebar
│   ├── common/         # DataTable, PageHeader, StatCard...
│   ├── dashboard/      # Widgets dashboard
│   ├── sales/          # InvoicePrint et composants ventes
│   ├── docs/           # Documentation intégrée
│   ├── i18n/           # Internationalisation
│   ├── permissions/    # Gestion des permissions
│   └── ...
├── entities/           # Schémas JSON des entités
├── Layout.js           # Layout global
└── index.css           # Styles globaux (design tokens)
```

### Pattern de Composants

#### Pages

Les pages utilisent React Query pour la gestion des données :

```javascript
export default function SalesOrders() {
  const { data: orders } = useQuery({
    queryKey: ['salesOrders'],
    queryFn: () => base44.entities.SalesOrder.list('-created_date', 50),
  });

  const shipMutation = useMutation({
    mutationFn: (id) => base44.entities.SalesOrder.update(id, { status: 'shipped' }),
    onSuccess: () => queryClient.invalidateQueries(['salesOrders']),
  });
}
```

#### Composants Réutilisables

- **DataTable** : Tableau avec tri, recherche, pagination, export CSV
- **PageHeader** : En-tête de page standardisé
- **StatusBadge** : Badges de statut colorés
- **StatCard** : Cartes de statistiques avec tendances
- **EmptyState** : États vides illustrés
- **InvoicePrint** : Impression de factures (module Ventes)

### Gestion de l'État

- **Server State** : React Query (données backend)
- **Local State** : useState (UI temporaire)
- **Global State** : Context API (langue, thème, user)

### Permissions

```javascript
const { hasPermission, canCreate, canEdit } = usePermissions();

if (!hasPermission('products', 'view')) {
  return <AccessDenied />;
}

// ou HOC
export default withPermission(ProductsPage, 'products', 'view');
```

### Internationalisation

```javascript
const { t, language, setLanguage } = useTranslation();

<h1>{t('products.title')}</h1>
<p>{t('products.description', { count: 5 })}</p>
```

Langues supportées : FR (défaut), EN, AR (RTL)

## Flux de Données

### Flux de Production

```
1. Utilisateur crée Manufacturing Order
   ↓
2. Frontend → base44.entities.ManufacturingOrder.create()
   ↓
3. Backend Base44 crée l'enregistrement
   ↓
4. Consommation des matières premières (StockMovement)
   ↓
5. Création du lot produit fini (ProductLot)
   ↓
6. Mise à jour du stock (StockLevel)
   ↓
7. UI mise à jour automatiquement via React Query
```

### Flux de Commande de Vente

```
1. Création commande (draft)
   ↓
2. Confirmation (confirmed)
   ↓
3. Expédition (shipped)
   ├── Déduction automatique du stock
   └── Création de mouvements de sortie
   ↓
4. Livraison (delivered)
   ↓
5. Impression de la facture (PDF / impression navigateur)
```

## Sécurité

### Authentification

- Sessions sécurisées Base44
- Token JWT automatique
- Expiration et renouvellement
- Logout côté serveur

### Autorisations

#### Niveaux

1. **Non authentifié** : Aucun accès
2. **Utilisateur** : Accès selon rôle
3. **Admin** : Accès complet

#### Vérification Frontend

```javascript
// Guard component
<PermissionGuard module="products" action="create">
  <CreateButton />
</PermissionGuard>

// HOC
const ProtectedPage = withPermission(Page, 'products', 'view');
```

### Validation

- **Frontend** : React Hook Form + Zod
- **Backend** : JSON Schema validation automatique
- **Entity Schema** : Définition stricte des types

## Performance

### Optimisations Frontend

- **Code Splitting** : Pages chargées à la demande
- **React Query Cache** : Réduction des appels API
- **Debouncing** : Recherche et filtres
- **Pagination** : Grandes listes (DataTable)
- **Lazy Loading** : Images et composants

### Optimisations Backend

- **Batch Operations** : Réduction des round-trips
- **Parallel Execution** : Appels indépendants simultanés

## Monitoring et Logs

### Logs Frontend

- Errors capturées et affichées (toast/sonner)
- Console logs en développement
- Erreurs React Query trackées

### Analytics

- Tracking d'événements custom via `base44.analytics.track()`
- Dashboard d'usage
- Métriques de performance

## Déploiement

### Pipeline

1. **Commit** : Code modifié via l'éditeur Base44
2. **Build** : Vite compile le frontend
3. **Deploy** : Base44 déploie automatiquement
4. **Live** : Application accessible immédiatement

### Environnements

- **Preview** : Base44 preview automatique
- **Production** : Base44 production

## Extensibilité

### Ajouter une Entité

1. Créer `entities/NewEntity.json` avec le schéma
2. Utiliser `base44.entities.NewEntity` dans le code
3. Créer les pages et composants associés

### Ajouter une Page

1. Créer `pages/NewPage.jsx`
2. Ajouter la route dans `App.jsx`
3. Ajouter la navigation dans `components/layout/Sidebar.jsx`

## Bonnes Pratiques

### Code

- ✓ Composants petits et focalisés (< 150 lignes)
- ✓ Réutilisation maximale
- ✓ Nommage explicite
- ✓ Commentaires pour logique complexe
- ✓ Gestion d'erreurs systématique

### Performance

- ✓ Éviter les re-renders inutiles
- ✓ Utiliser React.memo si nécessaire
- ✓ Optimiser les requêtes (filtres, pagination)
- ✓ Batch les opérations multiples

### Sécurité

- ✓ Valider toutes les entrées
- ✓ Vérifier les permissions
- ✓ Échapper les données utilisateur
- ✓ Utiliser HTTPS (automatique)

### Maintenance

- ✓ Documentation à jour
- ✓ Tests des fonctionnalités critiques
- ✓ Monitoring des erreurs
- ✓ Backup régulier

---

**Technologies** : React, Base44, Tailwind CSS  
**Version** : 1.1  
**Architecture** : Monolithe modulaire avec BaaS  
**Dernière MAJ** : Avril 2026