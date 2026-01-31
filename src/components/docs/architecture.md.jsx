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
- **Functions** : Deno Deploy
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
         △                        ▲
         │                        │
┌────────┴──────────┐    ┌───────┴──────────┐
│ ManufacturingOrder│    │ LotMovement      │
└───────────────────┘    └──────────────────┘
```

### Entités Principales

#### Produits et Matières

- **Product** : Produits finis, semi-finis, consommables
- **RawMaterial** : Matières premières
- **BillOfMaterials** : Nomenclatures de fabrication
- **Recipe** : Recettes avec étapes de production

#### Inventaire

- **StockLevel** : Niveaux de stock par entrepôt
- **ProductLot** : Lots avec traçabilité
- **StockMovement** : Historique des mouvements
- **LotMovement** : Mouvements spécifiques aux lots
- **Warehouse** : Entrepôts et sites

#### Production

- **ManufacturingOrder** : Ordres de fabrication
- **ProductionPlan** : Planification de production
- **Equipment** : Machines et équipements
- **MaintenanceOrder** : Ordres de maintenance

#### Achats

- **PurchaseOrder** : Bons de commande
- **GoodsReceipt** : Réceptions de marchandises
- **Supplier** : Fournisseurs
- **SupplierCatalog** : Catalogue fournisseurs
- **ReplenishmentSuggestion** : Suggestions de réappro

#### Qualité

- **QualityInspection** : Inspections qualité
- **NonConformity** : Non-conformités (implicite dans QualityInspection)

#### Administration

- **User** : Utilisateurs (entité système)
- **Role** : Rôles personnalisés
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
├── pages/               # Pages principales (flat structure)
│   ├── Dashboard.jsx
│   ├── Products.jsx
│   ├── ManufacturingOrders.jsx
│   └── ...
├── components/
│   ├── ui/             # Composants UI de base (shadcn)
│   ├── layout/         # Header, Sidebar
│   ├── common/         # Composants réutilisables
│   ├── dashboard/      # Widgets dashboard
│   ├── docs/           # Documentation intégrée
│   ├── i18n/           # Internationalisation
│   ├── permissions/    # Gestion des permissions
│   └── ...
├── functions/          # Backend functions (Deno)
├── entities/           # Schémas JSON des entités
├── Layout.js           # Layout global
└── globals.css         # Styles globaux
```

### Pattern de Composants

#### Pages

Les pages utilisent React Query pour la gestion des données :

```javascript
export default function ProductsPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => queryClient.invalidateQueries(['products']),
  });

  // Render...
}
```

#### Composants Réutilisables

- **DataTable** : Tableau avec tri, recherche, pagination
- **PageHeader** : En-tête de page standardisé
- **StatusBadge** : Badges de statut colorés
- **StatCard** : Cartes de statistiques
- **EmptyState** : États vides illustrés

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

## Architecture Backend

### Backend Functions

Les functions sont des handlers HTTP Deno :

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  // User-scoped operations
  const data = await base44.entities.Product.list();
  
  // Service role (admin privileges)
  const allData = await base44.asServiceRole.entities.Product.list();
  
  return Response.json({ data });
});
```

### Automations

Les automations déclenchent des functions automatiquement :

#### Entity Automations

```javascript
// Triggered on entity changes
{
  event: { type, entity_name, entity_id },
  data: currentData,
  old_data: previousData (pour updates)
}
```

#### Scheduled Automations

- Simple : Intervalle répété
- Cron : Expression cron
- One-time : Exécution unique

### Intégrations

#### Core Integrations

- **InvokeLLM** : Génération de contenu IA
- **SendEmail** : Envoi d'emails
- **UploadFile** : Upload de fichiers
- **GenerateImage** : Génération d'images IA
- **ExtractDataFromUploadedFile** : Extraction de données

## Flux de Données

### Flux de Production

```
1. Utilisateur crée Manufacturing Order
   ↓
2. Frontend → base44.entities.ManufacturingOrder.create()
   ↓
3. Backend Base44 crée l'enregistrement
   ↓
4. Entity automation déclenchée (si configurée)
   ↓
5. Notification envoyée (optionnel)
   ↓
6. Frontend reçoit confirmation via React Query
   ↓
7. UI mise à jour automatiquement
```

### Flux de Notification Email

```
1. Événement déclencheur (ex: stock bas)
   ↓
2. Automation entity triggered
   ↓
3. Backend function exécutée
   ↓
4. Function vérifie les conditions
   ↓
5. Récupère la liste des destinataires
   ↓
6. Envoie emails via base44.integrations.Core.SendEmail
   ↓
7. Retourne résultat (succès/erreur)
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
4. **Service Role** : Backend functions avec privilèges élevés

#### Vérification Frontend

```javascript
// Guard component
<PermissionGuard module="products" action="create">
  <CreateButton />
</PermissionGuard>

// HOC
const ProtectedPage = withPermission(Page, 'products', 'view');
```

#### Vérification Backend

```javascript
const user = await base44.auth.me();
if (!user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

// Check role
if (user.role !== 'admin') {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
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
- **Pagination** : Grandes listes
- **Lazy Loading** : Images et composants

### Optimisations Backend

- **Indexes** : Sur les champs fréquemment interrogés
- **Batch Operations** : Réduction des round-trips
- **Caching** : Données statiques en mémoire
- **Parallel Execution** : Appels indépendants simultanés

## Monitoring et Logs

### Logs Frontend

- Errors capturées et affichées (toast)
- Console logs en développement
- Erreurs React Query trackées

### Logs Backend

- Console.log dans les functions
- Visibles dans le dashboard Base44
- Filtrage par niveau (error, warn, info)

### Analytics

- Tracking d'événements custom via base44.analytics.track()
- Dashboard d'usage
- Métriques de performance

## Déploiement

### Pipeline

1. **Commit** : Code poussé sur Git
2. **Build** : Vite compile le frontend
3. **Deploy** : Base44 déploie automatiquement
4. **Functions** : Validation et déploiement automatique
5. **Live** : Application accessible immédiatement

### Environnements

- **Development** : Local avec hot reload
- **Preview** : Base44 preview automatique
- **Production** : Base44 production

### Rollback

- Retour à une version précédente possible
- Via dashboard Base44
- Instantané

## Extensibilité

### Ajouter une Entité

1. Créer `entities/NewEntity.json` avec le schéma
2. Utiliser `base44.entities.NewEntity` dans le code
3. Créer les pages et composants associés

### Ajouter une Function

1. Créer `functions/newFunction.js`
2. Déploiement automatique
3. Appeler via `base44.functions.invoke('newFunction', params)`

### Ajouter une Automation

1. Via code ou dashboard
2. Spécifier trigger (entity ou schedule)
3. Lier à une function existante

## Bonnes Pratiques

### Code

- ✓ Composants petits et focalisés
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

**Technologies** : React, Base44, Deno, Tailwind CSS  
**Version** : 1.0  
**Architecture** : Monolithe modulaire avec BaaS