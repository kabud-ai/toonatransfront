# Entité : ReplenishmentSuggestion (Suggestion de Réapprovisionnement)

## Description

Suggestion automatique de réapprovisionnement générée par le système lorsqu'un produit atteint son seuil de commande ou stock minimum.

## Champs

### Produit et Entrepôt

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `product_id` | string | ✓ | ID du produit à réapprovisionner |
| `product_name` | string | | Nom du produit |
| `warehouse_id` | string | ✓ | ID de l'entrepôt concerné |
| `warehouse_name` | string | | Nom de l'entrepôt |

### Niveaux de Stock

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `current_stock` | number | ✓ | Stock actuel disponible |
| `min_stock` | number | | Seuil minimum configuré |
| `reorder_point` | number | | Point de réapprovisionnement |

### Suggestion

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `suggested_quantity` | number | ✓ | Quantité suggérée à commander |

### Fournisseur Suggéré

| Champ | Type | Description |
|-------|------|-------------|
| `suggested_supplier_id` | string | ID du fournisseur suggéré |
| `suggested_supplier_name` | string | Nom du fournisseur |

### Coût

| Champ | Type | Description |
|-------|------|-------------|
| `estimated_cost` | number | Coût estimé de la commande |

### Priorité

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `priority` | enum | `low`, `medium`, `high`, `critical` | Niveau de priorité (défaut: `medium`) |

### Statut

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `status` | enum | `pending`, `approved`, `ordered`, `rejected` | Statut de la suggestion (défaut: `pending`) |

### Bon de Commande

| Champ | Type | Description |
|-------|------|-------------|
| `purchase_order_id` | string | ID du bon de commande créé (si approuvé) |

### Dates

| Champ | Type | Description |
|-------|------|-------------|
| `generated_at` | datetime | Date de génération de la suggestion |

## Niveaux de Priorité

| Priorité | Condition | Description | Action |
|-----------|-----------|-------------|--------|
| `critical` | current_stock = 0 | Rupture de stock | **Commander immédiatement** |
| `high` | current_stock < min_stock | Stock bas | Commander sous 24h |
| `medium` | current_stock < reorder_point | Point de commande atteint | Commander sous 48h |
| `low` | Prévisionnel | Anticipation besoin futur | Commander quand opportun |

## Statuts

| Statut | Description | Workflow |
|--------|-------------|----------|
| `pending` | En attente de décision | Révision par acheteur |
| `approved` | Approuvée, prête à commander | Création bon de commande |
| `ordered` | Bon de commande créé | Attente livraison |
| `rejected` | Rejetée | Archivée avec motif |

## Contraintes

### Validation
- `product_id` doit référencer un produit existant
- `warehouse_id` doit référencer un entrepôt existant
- `current_stock` >= 0
- `suggested_quantity` > 0
- `priority` : une des valeurs de l'enum
- `status` : une des valeurs de l'enum

## Génération Automatique

### Déclencheurs

Le système génère automatiquement des suggestions lors :

1. **Vérification Quotidienne**
   - Analyse de tous les niveaux de stock
   - Comparaison avec seuils configurés
   - Génération si nécessaire

2. **Après Mouvement de Stock**
   - Consommation importante
   - Stock passe sous seuil
   - Génération immédiate

3. **Planification Production**
   - Analyse des besoins futurs
   - Ordres de fabrication planifiés
   - Suggestions prévisionnelles

### Algorithme de Calcul

```javascript
// Détermination de la priorité
if (current_stock === 0) {
  priority = "critical"
} else if (current_stock < min_stock) {
  priority = "high"
} else if (current_stock < reorder_point) {
  priority = "medium"
} else {
  priority = "low"
}

// Calcul de la quantité suggérée
const consumption_rate = calculate_consumption_rate(product_id, warehouse_id)
const lead_time_days = supplier.lead_time_days
const safety_stock = min_stock

suggested_quantity = (consumption_rate × lead_time_days) + safety_stock - current_stock

// Arrondir à la quantité minimum de commande
if (suggested_quantity < supplier.min_order_quantity) {
  suggested_quantity = supplier.min_order_quantity
}

// Coût estimé
estimated_cost = suggested_quantity × supplier_catalog.unit_price
```

### Sélection du Fournisseur

Le système suggère un fournisseur basé sur :

1. **Fournisseur préféré** (is_preferred = true)
2. **Meilleur prix** (min unit_price)
3. **Délai de livraison** (min lead_time_days)
4. **Historique qualité** (max quality_score)
5. **Disponibilité** (is_active = true)

## Relations

### La suggestion concerne :
- **Produit** → `Product` (via `product_id`)
- **Entrepôt** → `Warehouse` (via `warehouse_id`)
- **Fournisseur** → `Supplier` (via `suggested_supplier_id`)
- **Niveau de Stock** → `StockLevel` (source des données)
- **Génère** → `PurchaseOrder` (si approuvée)

## Exemples

### Suggestion Critique - Rupture

```json
{
  "product_id": "mat_farine",
  "product_name": "Farine T55",
  "warehouse_id": "wh_principal",
  "warehouse_name": "Entrepôt Principal",
  "current_stock": 0,
  "min_stock": 100,
  "reorder_point": 150,
  "suggested_quantity": 500,
  "suggested_supplier_id": "sup_mdf",
  "suggested_supplier_name": "Meunerie de France",
  "estimated_cost": 425.00,
  "priority": "critical",
  "status": "pending",
  "generated_at": "2026-01-31T08:00:00Z"
}
```

### Suggestion Haute Priorité

```json
{
  "product_id": "mat_sucre",
  "product_name": "Sucre cristallisé",
  "warehouse_id": "wh_principal",
  "current_stock": 75,
  "min_stock": 100,
  "reorder_point": 150,
  "suggested_quantity": 300,
  "suggested_supplier_id": "sup_sucre",
  "suggested_supplier_name": "Sucrerie du Nord",
  "estimated_cost": 360.00,
  "priority": "high",
  "status": "pending",
  "generated_at": "2026-01-31T08:00:00Z"
}
```

### Suggestion Prévisionnelle

```json
{
  "product_id": "mat_chocolat",
  "product_name": "Chocolat noir 70%",
  "warehouse_id": "wh_principal",
  "current_stock": 180,
  "min_stock": 50,
  "reorder_point": 100,
  "suggested_quantity": 200,
  "suggested_supplier_id": "sup_cacao",
  "estimated_cost": 2400.00,
  "priority": "low",
  "status": "pending",
  "generated_at": "2026-01-31T08:00:00Z"
}
```

## Workflow

### 1. Génération Automatique
```
Système analyse les stocks
↓
Détecte stock < seuil
↓
Calcule quantité suggérée
↓
Sélectionne fournisseur
↓
Crée suggestion (status = pending)
↓
Notification envoyée à l'acheteur
```

### 2. Révision par Acheteur
```
Acheteur consulte les suggestions
↓
Trie par priorité (critical → low)
↓
Révise chaque suggestion :
  - Vérifie quantité
  - Confirme fournisseur
  - Ajuste si nécessaire
```

### 3. Approbation
```
Acheteur approuve la suggestion
↓
Status → approved
↓
Création automatique du bon de commande
↓
purchase_order_id renseigné
↓
Status → ordered
```

### 4. Rejet
```
Acheteur rejette la suggestion
↓
Status → rejected
↓
Optionnel : ajout d'un motif
↓
Archivage de la suggestion
```

## Bonnes Pratiques

1. **Révision Quotidienne**
   - Consultez les suggestions chaque matin
   - Traitez les critiques en priorité
   - Validez ou rejetez rapidement

2. **Ajustements**
   - Modifiez la quantité si besoin
   - Changez de fournisseur si opportunité
   - Regroupez plusieurs suggestions pour un même fournisseur

3. **Configuration des Seuils**
   - Basez-vous sur l'historique de consommation
   - Ajustez selon la saisonnalité
   - Tenez compte des délais fournisseurs

4. **Groupage des Commandes**
   - Regroupez les suggestions d'un même fournisseur
   - Optimisez les frais de port
   - Respectez les montants minimums

5. **Anticipation**
   - Ne attendez pas les suggestions critiques
   - Commandez aux suggestions high/medium
   - Planifiez selon les ordres de fabrication futurs

## Rapports et Analyses

### Tableau de Bord Réapprovisionnement

```javascript
// Suggestions par priorité
{
  critical: 5,
  high: 12,
  medium: 23,
  low: 8
}

// Valeur totale des suggestions
total_value = Σ(estimated_cost WHERE status = 'pending')

// Suggestions en retard
overdue = suggestions WHERE (
  priority = 'critical' AND 
  generated_at < (now - 24h)
)
```

### Indicateurs

- **Taux de réapprovisionnement** = Suggestions générées / Total produits
- **Taux d'approbation** = Suggestions approved / Total suggestions
- **Délai moyen de traitement** = Moyenne(approved_at - generated_at)
- **Valeur moyenne des suggestions** = Moyenne(estimated_cost)

## Notifications Email Automatiques

Le système envoie des emails :

- 🔴 **Critique** : Immédiatement lors de rupture
  → Acheteur + Responsable achats
  
- 🟠 **Haute priorité** : Quotidien (matin)
  → Acheteur

- 🟡 **Moyenne/Basse** : Hebdomadaire (lundi)
  → Acheteur

## Optimisations

### Regroupement Intelligent

```javascript
// Suggérer un bon de commande groupé
const suggestions_mdf = suggestions.filter(s => 
  s.suggested_supplier_id === 'sup_mdf' &&
  s.status === 'pending'
)

if (suggestions_mdf.length > 1) {
  alert(`${suggestions_mdf.length} suggestions disponibles pour Meunerie de France. Créer un bon groupé ?`)
}
```

### Suggestions Prévisionnelles

```javascript
// Analyse des ordres de fabrication futurs
const future_needs = manufacturing_orders
  .filter(mo => mo.status === 'planned')
  .flatMap(mo => mo.recipe.components)

// Génère suggestions avant rupture
for (component of future_needs) {
  if (stock + ordered - future_consumption < reorder_point) {
    generate_suggestion(component)
  }
}
``