# Entité : StockMovement (Mouvement de Stock)

## Description

Enregistre tous les mouvements de stock au niveau produit/entrepôt (pas spécifique à un lot). Version simplifiée de `LotMovement`, utilisée pour la vue d'ensemble des flux de stock.

## Champs

### Produit et Entrepôt

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `product_id` | string | ✓ | ID du produit |
| `product_name` | string | | Nom du produit |
| `warehouse_id` | string | ✓ | ID de l'entrepôt |
| `warehouse_name` | string | | Nom de l'entrepôt |

### Type de Mouvement

| Champ | Type | Obligatoire | Valeurs | Description |
|-------|------|-------------|---------|-------------|
| `type` | enum | ✓ | `in`, `out`, `transfer`, `adjustment`, `production`, `consumption` | Type de mouvement (défaut: `in`) |

### Quantité

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `quantity` | number | ✓ | Quantité déplacée (positive pour entrée, négative pour sortie) |

### Lot

| Champ | Type | Description |
|-------|------|-------------|
| `lot_number` | string | Numéro du lot concerné (optionnel) |

### Référence

| Champ | Type | Description |
|-------|------|-------------|
| `reference` | string | Référence du document source |
| `reference_type` | enum | Type : `purchase_order`, `manufacturing_order`, `sales_order`, `adjustment`, `transfer` |

### Coût

| Champ | Type | Description |
|-------|------|-------------|
| `unit_cost` | number | Coût unitaire au moment du mouvement |

### Notes

| Champ | Type | Description |
|-------|------|-------------|
| `notes` | string | Notes sur le mouvement |

## Types de Mouvements

| Type | Description | Quantité | Usage |
|------|-------------|----------|-------|
| `in` | Entrée en stock | Positive | Réception, production |
| `out` | Sortie de stock | Négative | Vente, expédition |
| `transfer` | Transfert entre entrepôts | Positive (destination) ou négative (source) | Réorganisation stock |
| `adjustment` | Ajustement d'inventaire | Positive ou négative | Correction, casse, perte |
| `production` | Production de produit fini | Positive | Ordre de fabrication terminé |
| `consumption` | Consommation en production | Négative | Utilisation matières |

## Contraintes

### Validation
- `product_id` doit référencer un produit existant
- `warehouse_id` doit référencer un entrepôt existant
- `type` : une des valeurs de l'enum
- `quantity` != 0
- `unit_cost` >= 0

### Impact sur StockLevel

Chaque mouvement met à jour automatiquement le `StockLevel` :

```javascript
// Mouvement d'entrée (type = in, production)
StockLevel.quantity += Math.abs(movement.quantity)

// Mouvement de sortie (type = out, consumption)
StockLevel.quantity -= Math.abs(movement.quantity)

// Recalcul des valeurs
StockLevel.total_value = StockLevel.quantity × StockLevel.unit_cost
StockLevel.last_movement_date = movement.created_date
```

## Relation avec LotMovement

| Aspect | StockMovement | LotMovement |
|--------|---------------|-------------|
| **Niveau** | Produit/Entrepôt | Lot spécifique |
| **Granularité** | Vue d'ensemble | Détail précis |
| **Utilisation** | Rapports généraux | Traçabilité complète |
| **Obligatoire** | Non (peut être calculé) | Oui (audit trail) |

## Relations

### Le mouvement concerne :
- **Produit** → `Product` (via `product_id`)
- **Entrepôt** → `Warehouse` (via `warehouse_id`)
- **Lot** → `ProductLot` (via `lot_number`, optionnel)
- **Met à jour** → `StockLevel`

## Exemples

### Entrée - Réception

```json
{
  "product_id": "mat_farine",
  "product_name": "Farine T55",
  "warehouse_id": "wh_principal",
  "warehouse_name": "Entrepôt Principal",
  "type": "in",
  "quantity": 1000,
  "lot_number": "FAR-T55-20260131-001",
  "reference": "PO-2026-042",
  "reference_type": "purchase_order",
  "unit_cost": 0.82,
  "notes": "Réception bon de commande"
}
```

### Sortie - Consommation Production

```json
{
  "product_id": "mat_farine",
  "product_name": "Farine T55",
  "warehouse_id": "wh_principal",
  "type": "consumption",
  "quantity": -25,
  "lot_number": "FAR-T55-20260131-001",
  "reference": "MO-2026-042",
  "reference_type": "manufacturing_order",
  "unit_cost": 0.82,
  "notes": "Consommé pour fabrication 100 gâteaux"
}
```

### Transfert

```json
{
  "product_id": "mat_sucre",
  "product_name": "Sucre cristallisé",
  "warehouse_id": "wh_principal",
  "type": "transfer",
  "quantity": -200,
  "reference": "TR-2026-050",
  "reference_type": "transfer",
  "notes": "Transfert vers WH-USINE"
}
```

### Ajustement

```json
{
  "product_id": "mat_farine",
  "product_name": "Farine T55",
  "warehouse_id": "wh_principal",
  "type": "adjustment",
  "quantity": -10,
  "reference": "ADJ-2026-015",
  "reference_type": "adjustment",
  "unit_cost": 0.82,
  "notes": "Ajustement inventaire physique - sacs endommagés"
}
```

## Bonnes Pratiques

1. **Complémentarité**
   - Utilisez `StockMovement` pour vue globale
   - Utilisez `LotMovement` pour traçabilité détaillée
   - Les deux peuvent coexister

2. **Rapports**
   - Préférez `StockMovement` pour rapports d'activité
   - Analyse des flux par entrepôt
   - Statistiques de consommation

3. **Performance**
   - `StockMovement` plus léger que `LotMovement`
   - Requêtes plus rapides pour vues d'ensemble
   - Moins de jointures nécessaires

## Rapports

### Activité par Entrepôt

```javascript
const warehouse_activity = StockMovement
  .filter({ 
    warehouse_id: "wh_principal",
    created_date: { $gte: '2026-01-01' }
  })
  .groupBy('type')
  .map(group => ({
    type: group[0].type,
    count: group.length,
    total_quantity: group.reduce((sum, m) => sum + Math.abs(m.quantity), 0)
  }))
```

### Entrées vs Sorties

```javascript
const movements = StockMovement.filter({
  created_date: { $gte: start_date, $lte: end_date }
})

const ins = movements.filter(m => ['in', 'production'].includes(m.type))
const outs = movements.filter(m => ['out', 'consumption'].includes(m.type))

const balance = {
  total_in: ins.reduce((sum, m) => sum + m.quantity, 0),
  total_out: Math.abs(outs.reduce((sum, m) => sum + m.quantity, 0)),
  net: ins.reduce((sum, m) => sum + m.quantity, 0) + 
       outs.reduce((sum, m) => sum + m.quantity, 0)
}
```

### Top Produits Mouvementés

```javascript
const top_products = StockMovement
  .groupBy('product_id')
  .map(group => ({
    product_name: group[0].product_name,
    movements_count: group.length,
    total_quantity_moved: group.reduce((sum, m) => sum + Math.abs(m.quantity), 0)
  }))
  .sort((a, b) => b.total_quantity_moved - a.total_quantity_moved)
  .slice(0, 20)
```

## Indicateurs

- **Mouvements par jour** = Count / jours
- **Volume quotidien** = Σ|quantity| / jours
- **Ratio entrées/sorties** = Total in / Total out
- **Taux d'ajustement** = (Ajustements / Total) × 100%