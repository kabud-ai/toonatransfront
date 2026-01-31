# Entité : SupplierCatalog (Catalogue Fournisseur)

## Description

Définit les produits proposés par un fournisseur avec leurs conditions commerciales spécifiques : prix, quantités minimums, délais de livraison.

## Champs

### Fournisseur

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `supplier_id` | string | ✓ | ID du fournisseur |
| `supplier_name` | string | | Nom du fournisseur (copie) |

### Produit

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `product_id` | string | ✓ | ID du produit |
| `product_name` | string | | Nom du produit (copie) |

### Référencement

| Champ | Type | Description |
|-------|------|-------------|
| `supplier_sku` | string | Référence fournisseur du produit (SKU fournisseur) |

### Prix

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `unit_price` | number | ✓ | Prix unitaire |
| `currency` | string | | Devise (défaut: USD) |

### Conditions de Commande

| Champ | Type | Description |
|-------|------|-------------|
| `min_order_quantity` | number | Quantité minimum de commande (défaut: 1) |
| `lead_time_days` | number | Délai de livraison en jours (défaut: 7) |

### Préférences

| Champ | Type | Description |
|-------|------|-------------|
| `is_preferred` | boolean | Fournisseur préféré pour ce produit (défaut: false) |
| `is_active` | boolean | Référence active dans le catalogue (défaut: true) |

### Historique

| Champ | Type | Description |
|-------|------|-------------|
| `last_price_update` | date | Date de dernière mise à jour du prix |

### Notes

| Champ | Type | Description |
|-------|------|-------------|
| `notes` | string | Notes sur ce produit chez ce fournisseur |

## Contraintes

### Unicité
- La paire (`supplier_id`, `product_id`) doit être unique
- Un fournisseur ne peut pas avoir deux références pour le même produit

### Validation
- `supplier_id` doit référencer un fournisseur actif
- `product_id` doit référencer un produit existant
- `unit_price` > 0
- `min_order_quantity` > 0
- `lead_time_days` > 0
- `currency` : code devise ISO (USD, EUR, etc.)

### Règles Métier

1. **Fournisseur Préféré**
   - Un seul fournisseur préféré par produit recommandé
   - Si plusieurs `is_preferred` = true, le système choisit le meilleur prix

2. **Références Actives**
   - Seules les références `is_active` = true sont utilisées
   - Désactiver plutôt que supprimer (historique)

## Relations

### Le catalogue lie :
- **Fournisseur** → `Supplier` (via `supplier_id`)
- **Produit** → `Product` (via `product_id`)
- **Utilisé dans** :
  - `ReplenishmentSuggestion` (sélection fournisseur)
  - `PurchaseOrder` (création des lignes)
  - Comparaisons de prix

## Exemples

### Farine chez Fournisseur Principal

```json
{
  "supplier_id": "sup_mdf",
  "supplier_name": "Meunerie de France",
  "product_id": "mat_farine_t55",
  "product_name": "Farine T55",
  "supplier_sku": "FAR-T55-25KG",
  "unit_price": 0.85,
  "currency": "EUR",
  "min_order_quantity": 20,
  "lead_time_days": 3,
  "is_preferred": true,
  "is_active": true,
  "last_price_update": "2026-01-15",
  "notes": "Prix par kg, livré en sacs de 25kg. Franco de port à partir de 500kg."
}
```

### Même Produit chez Fournisseur Alternatif

```json
{
  "supplier_id": "sup_moulins",
  "supplier_name": "Les Grands Moulins",
  "product_id": "mat_farine_t55",
  "product_name": "Farine T55",
  "supplier_sku": "FART55-SACS",
  "unit_price": 0.88,
  "currency": "EUR",
  "min_order_quantity": 50,
  "lead_time_days": 5,
  "is_preferred": false,
  "is_active": true,
  "last_price_update": "2026-01-20",
  "notes": "Prix légèrement supérieur mais qualité premium. Sacs de 25kg."
}
```

## Bonnes Pratiques

1. **Plusieurs Fournisseurs**
   - Maintenez au moins 2 fournisseurs actifs par produit critique
   - Évitez la dépendance à un seul fournisseur
   - Fournisseur de secours en cas de rupture

2. **Mise à Jour des Prix**
   - Actualisez `unit_price` régulièrement
   - Renseignez `last_price_update`
   - Négociez les prix périodiquement

3. **Référencement**
   - Utilisez le SKU fournisseur exact
   - Facilite les commandes et évite les erreurs
   - Vérifiez correspondance produit

4. **Conditions Commerciales**
   - Respectez `min_order_quantity`
   - Tenez compte de `lead_time_days` dans planification
   - Négociez des conditions avantageuses (volume)

5. **Préférences**
   - Marquez `is_preferred` pour le meilleur rapport qualité/prix
   - Basez-vous sur l'historique (qualité, délais, service)
   - Revoyez périodiquement les préférences

## Utilisation

### Sélection Automatique du Fournisseur

```javascript
// Trouver le meilleur fournisseur pour un produit
function selectSupplier(product_id) {
  const catalog_entries = SupplierCatalog.filter({
    product_id: product_id,
    is_active: true
  })
  
  // Priorité 1 : Fournisseur préféré
  const preferred = catalog_entries.find(e => e.is_preferred)
  if (preferred) return preferred
  
  // Priorité 2 : Meilleur prix
  const cheapest = catalog_entries.sort((a, b) => 
    a.unit_price - b.unit_price
  )[0]
  
  return cheapest
}
```

### Comparaison Multi-Fournisseurs

```javascript
// Comparer les offres pour un produit
const product_id = "mat_farine_t55"
const quantity = 500 // kg

const comparisons = SupplierCatalog
  .filter({ product_id, is_active: true })
  .map(entry => ({
    supplier: entry.supplier_name,
    unit_price: entry.unit_price,
    total_cost: entry.unit_price × quantity,
    min_order: entry.min_order_quantity,
    lead_time: entry.lead_time_days,
    delivery_date: new Date(Date.now() + entry.lead_time_days × 86400000),
    is_preferred: entry.is_preferred
  }))
  .sort((a, b) => a.total_cost - b.total_cost)

console.table(comparisons)
```

Résultat :
```
┌─────────────────────────┬────────────┬────────────┬───────────┬───────────┬──────────────┐
│ Supplier                │ unit_price │ total_cost │ min_order │ lead_time │ is_preferred │
├─────────────────────────┼────────────┼────────────┼───────────┼───────────┼──────────────┤
│ Meunerie de France      │ 0.85       │ 425.00     │ 20        │ 3         │ true         │
│ Les Grands Moulins      │ 0.88       │ 440.00     │ 50        │ 5         │ false        │
└─────────────────────────┴────────────┴────────────┴───────────┴───────────┴──────────────┘
```

### Création de Bon de Commande

```javascript
// Utiliser le catalogue pour créer une ligne de commande
const catalog_entry = SupplierCatalog.get({
  supplier_id: "sup_mdf",
  product_id: "mat_farine_t55"
})

const purchase_line = {
  product_id: catalog_entry.product_id,
  product_name: catalog_entry.product_name,
  quantity: 500,
  unit_price: catalog_entry.unit_price,
  total_price: 500 × catalog_entry.unit_price,
  notes: `Réf. fournisseur: ${catalog_entry.supplier_sku}`
}
```

## Gestion Multi-Devises

```javascript
// Conversion de devises (exemple simplifié)
const exchange_rates = {
  'EUR': 1.0,
  'USD': 1.10,
  'GBP': 0.85
}

function convertToEUR(amount, currency) {
  return amount / exchange_rates[currency]
}

// Comparer des prix en devises différentes
const price_eur = catalog_entry_1.unit_price // EUR
const price_usd = catalog_entry_2.unit_price // USD
const price_usd_in_eur = convertToEUR(price_usd, 'USD')

if (price_eur < price_usd_in_eur) {
  console.log("Offre EUR plus avantageuse")
}
```

## Historique des Prix

Pour suivre l'évolution des prix, vous pouvez :

1. **Créer une nouvelle entrée** lors d'un changement de prix :
```json
{
  "supplier_id": "sup_mdf",
  "product_id": "mat_farine_t55",
  "unit_price": 0.90,  // Nouveau prix
  "is_active": true,
  "last_price_update": "2026-02-01"
}
```

2. **Désactiver l'ancienne** :
```json
{
  "supplier_id": "sup_mdf",
  "product_id": "mat_farine_t55",
  "unit_price": 0.85,  // Ancien prix
  "is_active": false,
  "last_price_update": "2026-01-15"
}
```

## Rapports et Analyses

### Analyse Comparative

```javascript
// Produits avec plusieurs fournisseurs
const products_with_multiple_suppliers = SupplierCatalog
  .groupBy('product_id')
  .filter(group => group.length > 1)

// Écart de prix min/max
for (product_group of products_with_multiple_suppliers) {
  const prices = product_group.map(e => e.unit_price)
  const min_price = Math.min(...prices)
  const max_price = Math.max(...prices)
  const price_variance = ((max_price - min_price) / min_price) × 100
  
  console.log(`${product_group[0].product_name}: ${price_variance}% écart`)
}
```

### Fournisseurs par Produit

```javascript
// Combien de fournisseurs par produit ?
const supplier_count_by_product = SupplierCatalog
  .filter({ is_active: true })
  .groupBy('product_id')
  .map(group => ({
    product_name: group[0].product_name,
    supplier_count: group.length,
    cheapest_price: Math.min(...group.map(e => e.unit_price)),
    avg_lead_time: group.reduce((sum, e) => sum + e.lead_time_days, 0) / group.length
  }))
```

## Indicateurs

- **Taux de couverture** = (Produits avec fournisseur / Total produits) × 100%
- **Fournisseurs moyens par produit** = Total références / Produits uniques
- **Prix moyen** par catégorie de produit
- **Délai moyen de livraison** par fournisseur
- **Taux de préférence** = (Références préférées / Total références) × 100%

## Intégration avec Réapprovisionnement

```javascript
// Suggestion automatique utilise le catalogue
function generateReplenishmentSuggestion(product_id, warehouse_id) {
  // Sélectionne le fournisseur
  const catalog_entry = selectSupplier(product_id)
  
  // Calcule la quantité
  const stock_level = StockLevel.get({ product_id, warehouse_id })
  const suggested_quantity = Math.max(
    stock_level.reorder_quantity,
    catalog_entry.min_order_quantity
  )
  
  // Crée la suggestion
  return {
    product_id,
    warehouse_id,
    suggested_quantity,
    suggested_supplier_id: catalog_entry.supplier_id,
    estimated_cost: suggested_quantity × catalog_entry.unit_price,
    estimated_delivery: Date.now() + catalog_entry.lead_time_days × 86400000
  }
}
``