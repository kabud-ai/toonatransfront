# Architecture Technique et Fonctionnelle

## Vue d'Ensemble

Cette documentation présente l'architecture complète du système ERP de production, couvrant les aspects techniques (stack technologique, organisation du code) et fonctionnels (modules, flux de données, processus métier).

---

## 1. Architecture Globale

### 1.1 Vue Système

```
┌─────────────────────────────────────────────────────────────┐
│                      COUCHE PRÉSENTATION                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Dashboard │  │ Production │  │ Inventaire │  ...        │
│  └────────────┘  └────────────┘  └────────────┘            │
│         React + Tailwind CSS + shadcn/ui                    │
└─────────────────────────────────────────────────────────────┘
                            ↕ API REST
┌─────────────────────────────────────────────────────────────┐
│                   COUCHE LOGIQUE MÉTIER                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Base44 Backend as a Service               │  │
│  │  • Authentification  • Autorisations                 │  │
│  │  • Règles métier     • Validations                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Functions (Deno Deploy)                    │  │
│  │  • Notifications     • Rapports                       │  │
│  │  • Intégrations      • Workflows                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ Data Access
┌─────────────────────────────────────────────────────────────┐
│                      COUCHE DONNÉES                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Base de Données NoSQL                    │  │
│  │  • Collections d'entités                              │  │
│  │  • Index automatiques                                 │  │
│  │  • Validation par schémas JSON                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture en Couches

| Couche | Technologies | Responsabilités |
|--------|--------------|-----------------|
| **Présentation** | React, Tailwind, shadcn/ui | Interface utilisateur, interactions |
| **Logique Métier** | Base44 BaaS, Deno Functions | Règles métier, validations, workflows |
| **Données** | NoSQL (MongoDB-like) | Persistance, intégrité, requêtes |
| **Intégrations** | Functions, APIs externes | Email, fichiers, AI, services tiers |

---

## 2. Architecture Technique Frontend

### 2.1 Stack Technologique

```javascript
{
  "framework": "React 18",
  "styling": "Tailwind CSS",
  "ui_components": "shadcn/ui (Radix UI)",
  "routing": "React Router DOM",
  "state_management": "@tanstack/react-query",
  "forms": "React Hook Form + Zod",
  "icons": "Lucide React",
  "charts": "Recharts",
  "animations": "Framer Motion",
  "dates": "date-fns"
}
```

### 2.2 Structure des Dossiers

```
/
├── pages/                    # Pages de l'application
│   ├── Dashboard.jsx
│   ├── Products.jsx
│   ├── ManufacturingOrders.jsx
│   └── ...
│
├── components/              # Composants réutilisables
│   ├── ui/                  # Composants UI de base (shadcn)
│   │   ├── button.jsx
│   │   ├── dialog.jsx
│   │   └── ...
│   ├── common/              # Composants communs métier
│   │   ├── PageHeader.jsx
│   │   ├── DataTable.jsx
│   │   └── StatusBadge.jsx
│   ├── layout/              # Composants de layout
│   │   ├── Sidebar.jsx
│   │   └── Header.jsx
│   ├── i18n/                # Internationalisation
│   │   ├── LanguageContext.jsx
│   │   └── translations.js
│   └── docs/                # Documentation Markdown
│
├── entities/                # Schémas de données (JSON Schema)
│   ├── Product.json
│   ├── ManufacturingOrder.json
│   └── ...
│
├── functions/               # Backend functions (Deno)
│   ├── notifyLowStock.js
│   ├── notifyPurchaseOrder.js
│   └── ...
│
└── Layout.jsx              # Layout global de l'application
```

### 2.3 Patterns de Conception

#### 2.3.1 Container/Presenter Pattern

```javascript
// Page Container (logique)
export default function ProductsPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  })
  
  return <ProductsList products={products} loading={isLoading} />
}

// Presenter Component (UI pure)
function ProductsList({ products, loading }) {
  if (loading) return <Skeleton />
  return <DataTable data={products} columns={columns} />
}
```

#### 2.3.2 Custom Hooks Pattern

```javascript
// Hook réutilisable pour gestion d'entités
function useEntity(entityName) {
  const queryClient = useQueryClient()
  
  const { data, isLoading } = useQuery({
    queryKey: [entityName],
    queryFn: () => base44.entities[entityName].list()
  })
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities[entityName].create(data),
    onSuccess: () => queryClient.invalidateQueries([entityName])
  })
  
  return { data, isLoading, create: createMutation.mutate }
}
```

#### 2.3.3 Composition Pattern

```javascript
// Composition de composants
<Dialog>
  <DialogTrigger asChild>
    <Button>Créer Produit</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Nouveau Produit</DialogTitle>
    </DialogHeader>
    <ProductForm onSubmit={handleCreate} />
  </DialogContent>
</Dialog>
```

### 2.4 Gestion d'État

```javascript
// État serveur (react-query)
const { data } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => base44.entities.Product.filter(filters),
  staleTime: 5 * 60 * 1000 // 5 minutes
})

// État local (useState)
const [selectedProduct, setSelectedProduct] = useState(null)
const [dialogOpen, setDialogOpen] = useState(false)

// État global (Context)
const { language, setLanguage } = useTranslation()
```

---

## 3. Architecture Backend

### 3.1 Base44 Backend as a Service

```javascript
// Authentification automatique
const user = await base44.auth.me()

// Gestion des permissions par rôle
if (!user.role === 'admin') {
  return Response.json({ error: 'Forbidden' }, { status: 403 })
}

// CRUD automatique sur entités
await base44.entities.Product.create(data)
await base44.entities.Product.update(id, data)
await base44.entities.Product.delete(id)
const products = await base44.entities.Product.list()
```

### 3.2 Backend Functions (Deno)

```javascript
// Structure standard d'une function
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6'

Deno.serve(async (req) => {
  try {
    // 1. Initialisation client
    const base44 = createClientFromRequest(req)
    
    // 2. Authentification
    const user = await base44.auth.me()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 3. Logique métier
    const result = await performBusinessLogic(base44, user)
    
    // 4. Réponse
    return Response.json({ success: true, result })
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
})
```

### 3.3 Intégrations Backend

```javascript
// Envoi d'email
await base44.integrations.Core.SendEmail({
  to: user.email,
  subject: 'Alerte Stock Bas',
  body: `Le produit ${product.name} a un stock bas`
})

// Génération d'image AI
const { url } = await base44.integrations.Core.GenerateImage({
  prompt: 'Product packaging design'
})

// Upload de fichier
const { file_url } = await base44.integrations.Core.UploadFile({
  file: fileData
})

// Appel LLM avec contexte web
const response = await base44.integrations.Core.InvokeLLM({
  prompt: 'Analyze production trends',
  add_context_from_internet: true
})
```

---

## 4. Architecture Fonctionnelle

### 4.1 Modules Métier

```
ERP PRODUCTION
├── MODULE PRODUCTION
│   ├── Produits (Products)
│   ├── Recettes (Recipes)
│   ├── Nomenclatures (BOM)
│   ├── Ordres de Fabrication (ManufacturingOrders)
│   └── Planification (ProductionPlans)
│
├── MODULE INVENTAIRE
│   ├── Entrepôts (Warehouses)
│   ├── Niveaux de Stock (StockLevels)
│   ├── Lots (ProductLots)
│   ├── Mouvements (StockMovements)
│   └── Réapprovisionnement (ReplenishmentSuggestions)
│
├── MODULE ACHATS
│   ├── Fournisseurs (Suppliers)
│   ├── Bons de Commande (PurchaseOrders)
│   ├── Réceptions (GoodsReceipts)
│   └── Catalogue Fournisseurs (SupplierCatalog)
│
├── MODULE QUALITÉ
│   ├── Inspections (QualityInspections)
│   ├── Contrôles Qualité
│   └── Non-Conformités
│
├── MODULE MAINTENANCE
│   ├── Équipements (Equipment)
│   ├── Ordres de Maintenance (MaintenanceOrders)
│   └── Planification Maintenance
│
└── MODULE ADMINISTRATION
    ├── Utilisateurs (Users)
    ├── Rôles (Roles)
    ├── Sites (Sites)
    ├── Entreprises (Companies)
    └── Paramètres (Settings)
```

### 4.2 Flux de Données Principaux

#### 4.2.1 Flux Production

```
1. PLANIFICATION
   Recipe → BillOfMaterials → ProductionPlan → ManufacturingOrder
   
2. VÉRIFICATION STOCK
   Check StockLevels for required components
   → If low: ReplenishmentSuggestion → PurchaseOrder
   
3. FABRICATION
   ManufacturingOrder.status = 'in_progress'
   → Consume raw materials (StockMovements)
   → ProductLot creation
   → QualityInspection
   
4. FINALISATION
   QualityInspection.status = 'passed'
   → Stock product (StockMovements IN)
   → ManufacturingOrder.status = 'completed'
```

#### 4.2.2 Flux Achats

```
1. DÉTECTION BESOIN
   StockLevel < reorder_point
   → ReplenishmentSuggestion (automatique ou manuel)
   
2. COMMANDE
   ReplenishmentSuggestion → PurchaseOrder
   → Approval workflow (si requis)
   → Send to Supplier
   
3. RÉCEPTION
   Goods delivery → GoodsReceipt
   → QualityInspection (incoming)
   
4. MISE EN STOCK
   QualityInspection.status = 'passed'
   → StockMovements IN
   → ProductLot creation
   → Update StockLevels
```

#### 4.2.3 Flux Qualité

```
1. DÉCLENCHEMENT
   Incoming: GoodsReceipt
   In-Process: ManufacturingOrder (checkpoints)
   Final: ManufacturingOrder completed
   Periodic: Scheduled inspections
   
2. INSPECTION
   QualityInspection created
   → Checkpoints validation
   → Measurements recording
   
3. DÉCISION
   Passed: Release lot → Stock
   Failed: Lot → Quarantine
   Conditional: Investigation needed
   
4. ACTIONS
   Passed: Continue flow
   Failed: Reject + create NonConformity
   Conditional: Wait for decision
```

### 4.3 Entités Centrales et Relations

```
Product
  ↓ has many
Recipe
  ↓ defines
BillOfMaterials
  ↓ used in
ManufacturingOrder
  ↓ consumes
StockLevel ← ProductLot
  ↑ replenished by
GoodsReceipt ← PurchaseOrder ← Supplier
  ↓ inspected via
QualityInspection
```

---

## 5. Patterns Métier

### 5.1 Traçabilité (Traceability)

```javascript
// Traçabilité complète d'un lot
async function traceLot(lot_number) {
  // 1. Informations du lot
  const lot = await base44.entities.ProductLot.filter({ lot_number })[0]
  
  // 2. Origine
  const origin = lot.manufacturing_order_id
    ? await base44.entities.ManufacturingOrder.get(lot.manufacturing_order_id)
    : await base44.entities.GoodsReceipt.filter({ 
        'lines.lot_number': lot_number 
      })[0]
  
  // 3. Mouvements
  const movements = await base44.entities.LotMovement.filter({
    lot_number,
    sort: 'created_date'
  })
  
  // 4. Inspections
  const inspections = await base44.entities.QualityInspection.filter({
    lot_number
  })
  
  // 5. Consommation (si utilisé dans production)
  const consumed_in = await base44.entities.ManufacturingOrder.filter({
    'consumed_materials.lot_number': lot_number
  })
  
  return {
    lot,
    origin,
    movements,
    inspections,
    consumed_in
  }
}
```

### 5.2 Calculs de Besoins (MRP)

```javascript
// Material Requirements Planning
async function calculateMRP(product_id, quantity, target_date) {
  // 1. BOM du produit
  const bom = await base44.entities.BillOfMaterials.filter({
    product_id,
    is_active: true
  })[0]
  
  // 2. Pour chaque composant
  const requirements = []
  for (const component of bom.components) {
    const required_qty = quantity × component.quantity
    
    // 3. Stock disponible
    const stock = await base44.entities.StockLevel.filter({
      product_id: component.product_id
    })
    const available = stock.reduce((sum, s) => 
      sum + s.available_quantity, 0
    )
    
    // 4. Quantité à commander
    const to_order = Math.max(0, required_qty - available)
    
    if (to_order > 0) {
      requirements.push({
        product_id: component.product_id,
        product_name: component.product_name,
        required: required_qty,
        available,
        to_order,
        target_date
      })
    }
  }
  
  return requirements
}
```

### 5.3 Coûts de Production

```javascript
// Calcul du coût réel de production
function calculateProductionCost(manufacturing_order) {
  // 1. Coût matières premières
  const material_cost = manufacturing_order.consumed_materials
    .reduce((sum, mat) => sum + (mat.quantity × mat.unit_cost), 0)
  
  // 2. Coût main d'œuvre
  const labor_hours = manufacturing_order.actual_duration_hours || 
                      manufacturing_order.estimated_duration_hours
  const labor_cost = labor_hours × HOURLY_LABOR_RATE
  
  // 3. Coût machine (amortissement)
  const equipment_cost = manufacturing_order.equipment_ids
    .map(id => getEquipmentHourlyCost(id))
    .reduce((sum, cost) => sum + (cost × labor_hours), 0)
  
  // 4. Coûts indirects (overhead)
  const overhead_cost = (material_cost + labor_cost) × OVERHEAD_RATE
  
  // Total
  const total_cost = material_cost + labor_cost + 
                     equipment_cost + overhead_cost
  
  // Coût unitaire
  const unit_cost = total_cost / manufacturing_order.quantity_produced
  
  return {
    material_cost,
    labor_cost,
    equipment_cost,
    overhead_cost,
    total_cost,
    unit_cost
  }
}
```

---

## 6. Sécurité et Permissions

### 6.1 Modèle de Sécurité

```javascript
// Hiérarchie des rôles
const ROLE_HIERARCHY = {
  'admin': ['*'],  // Tous les droits
  'production_manager': [
    'products.*',
    'recipes.*',
    'manufacturing_orders.*',
    'bom.*'
  ],
  'warehouse_manager': [
    'inventory.*',
    'warehouses.*',
    'stock_levels.*',
    'lots.*'
  ],
  'operator': [
    'manufacturing_orders.view',
    'manufacturing_orders.execute',
    'quality_inspections.create'
  ],
  'viewer': [
    '*.view'
  ]
}
```

### 6.2 Contrôle d'Accès Basé sur les Rôles (RBAC)

```javascript
// PermissionGuard Component
function PermissionGuard({ permission, children, fallback }) {
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  
  if (!user || !hasPermission(permission)) {
    return fallback || null
  }
  
  return children
}

// Usage
<PermissionGuard permission="manufacturing_orders.create">
  <Button onClick={createOrder}>Créer Ordre</Button>
</PermissionGuard>
```

### 6.3 Audit Trail

```javascript
// Automatique via entités Base44
{
  id: "...",
  created_date: "2026-01-31T10:30:00Z",
  updated_date: "2026-01-31T14:45:00Z",
  created_by: "user@example.com",
  // ... données métier
}

// Historique des modifications (RecipeHistory)
await base44.entities.RecipeHistory.create({
  recipe_id: recipe.id,
  change_type: 'update',
  changed_by: user.email,
  previous_data: old_recipe,
  new_data: updated_recipe
})
```

---

## 7. Performance et Optimisation

### 7.1 Stratégies de Cache

```javascript
// React Query - Cache intelligent
const { data } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => base44.entities.Product.filter(filters),
  staleTime: 5 × 60 × 1000,      // 5 min avant considéré stale
  cacheTime: 30 × 60 × 1000,      // 30 min avant garbage collection
  refetchOnWindowFocus: false,    // Pas de refetch au focus
})

// Invalidation sélective
const queryClient = useQueryClient()
queryClient.invalidateQueries({ queryKey: ['products'] })
```

### 7.2 Pagination et Lazy Loading

```javascript
// Pagination côté serveur
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['products'],
  queryFn: ({ pageParam = 0 }) => 
    base44.entities.Product.list('-created_date', 50, pageParam),
  getNextPageParam: (lastPage, pages) => 
    lastPage.length === 50 ? pages.length × 50 : undefined
})

// Virtual scrolling pour grandes listes
import { useVirtualizer } from '@tanstack/react-virtual'
```

### 7.3 Optimistic Updates

```javascript
// Mise à jour optimiste pour UX fluide
const updateMutation = useMutation({
  mutationFn: (data) => base44.entities.Product.update(id, data),
  
  onMutate: async (newData) => {
    // Annuler les requêtes en cours
    await queryClient.cancelQueries(['products'])
    
    // Snapshot de l'ancien état
    const previous = queryClient.getQueryData(['products'])
    
    // Update optimiste
    queryClient.setQueryData(['products'], (old) => 
      old.map(p => p.id === id ? { ...p, ...newData } : p)
    )
    
    return { previous }
  },
  
  onError: (err, newData, context) => {
    // Rollback en cas d'erreur
    queryClient.setQueryData(['products'], context.previous)
  }
})
```

---

## 8. Monitoring et Observabilité

### 8.1 Événements Personnalisés

```javascript
// Tracking d'événements métier
base44.analytics.track({
  eventName: 'manufacturing_order_completed',
  properties: {
    order_id: order.id,
    duration_hours: order.actual_duration_hours,
    efficiency: order.efficiency_rate,
    success: true
  }
})
```

### 8.2 Logging Structuré

```javascript
// Backend function logging
console.log(JSON.stringify({
  level: 'info',
  timestamp: new Date().toISOString(),
  function: 'notifyLowStock',
  user: user.email,
  product_id: product.id,
  stock_level: stock.quantity,
  threshold: stock.min_stock_alert
}))
```

---

## 9. Scalabilité

### 9.1 Architecture Multi-Tenant

```javascript
// Isolation par Group
const products = await base44.entities.Product.filter({
  group_id: user.group_id
})

// Multi-sites
const stock = await base44.entities.StockLevel.filter({
  warehouse_id: { $in: user.accessible_warehouses }
})
```

### 9.2 Sharding Horizontal

```
Group A → Database Shard 1
Group B → Database Shard 1
Group C → Database Shard 2
Group D → Database Shard 2
```

---

## 10. Déploiement et CI/CD

### 10.1 Pipeline de Déploiement

```
1. Développement Local
   ↓
2. Git Push
   ↓
3. Base44 Platform
   ↓ Auto-build
4. Preview Environment
   ↓ Tests
5. Production Deployment
```

### 10.2 Environnements

| Environnement | Usage | Données |
|---------------|-------|---------|
| **Dev** | Développement local | Données de test |
| **Preview** | Test et démo | Données de test |
| **Production** | Utilisateurs réels | Données réelles |

---

## 11. Bonnes Pratiques

### 11.1 Code Quality

```javascript
// ✅ Bon: Composants petits et focalisés
function ProductCard({ product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{product.description}</p>
      </CardContent>
    </Card>
  )
}

// ❌ Mauvais: Composant trop gros et complexe
function ProductManagement() {
  // 500 lignes de code...
}
```

### 11.2 Error Handling

```javascript
// ✅ Bon: Gestion d'erreurs explicite
try {
  const result = await base44.entities.Product.create(data)
  toast.success('Produit créé')
  return result
} catch (error) {
  toast.error(`Erreur: ${error.message}`)
  console.error('Product creation failed:', error)
}

// ❌ Mauvais: Ignorer les erreurs
await base44.entities.Product.create(data)
```

### 11.3 Performance

```javascript
// ✅ Bon: Charger seulement ce qui est nécessaire
const { data } = useQuery({
  queryKey: ['products', 'active'],
  queryFn: () => base44.entities.Product.filter({ is_active: true })
})

// ❌ Mauvais: Charger toutes les données
const all_products = await base44.entities.Product.list()
const active = all_products.filter(p => p.is_active)
```

---

## 12. Évolutions Futures

### 12.1 Roadmap Technique

- [ ] Real-time collaboration (WebSockets)
- [ ] Progressive Web App (PWA)
- [ ] Offline-first capabilities
- [ ] Machine Learning pour prédictions
- [ ] API GraphQL en complément REST
- [ ] Microservices pour modules spécifiques

### 12.2 Roadmap Fonctionnelle

- [ ] Module Ventes et CRM
- [ ] Module Comptabilité
- [ ] Module RH et Paie
- [ ] Planning avancé (APS)
- [ ] IoT Integration (capteurs production)
- [ ] BI et Analytics avancés

---

## Conclusion

Cette architecture combine:
- **Simplicité**: Base44 BaaS élimine la complexité infrastructure
- **Flexibilité**: Extensions via Functions pour besoins spécifiques
- **Scalabilité**: Architecture cloud-native et multi-tenant
- **Maintenabilité**: Code organisé, patterns cohérents
- **Performance**: Optimisations et caching intelligents

Le système est conçu pour évoluer avec les besoins métier tout en maintenant une base de code propre et maintenable.