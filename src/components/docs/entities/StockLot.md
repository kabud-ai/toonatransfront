# Entité : StockLot (Lot de Stock - Ancien Système)

## Description

⚠️ **Note de Dépréciation** : Cette entité fait partie de l'ancien système de gestion des lots. Il est recommandé d'utiliser `ProductLot` et `LotMovement` pour les nouvelles implémentations.

Représente un lot de matière première acheté, avec suivi des quantités achetées, utilisées et restantes.

## Champs

### Matière Première

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `rawmaterial_id` | string | ✓ | ID de la matière première |
| `rawmaterial_name` | string | | Nom de la matière première |

### Quantités

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `bought_quantity` | number | ✓ | Quantité achetée initialement |
| `remaining_quantity` | number | | Quantité restante actuellement |
| `used_quantity` | number | | Quantité utilisée (défaut: 0) |

### Unité

| Champ | Type | Description |
|-------|------|-------------|
| `unity` | string | Unité de mesure |

### Prix

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `price` | number | ✓ | Prix total d'achat du lot |

### Date

| Champ | Type | Description |
|-------|------|-------------|
| `bought_at` | datetime | Date et heure d'achat |

## Contraintes

### Validation
- `bought_quantity` > 0
- `remaining_quantity` >= 0
- `used_quantity` >= 0
- `bought_quantity` = `remaining_quantity` + `used_quantity`
- `price` > 0

### Calculs Automatiques

```javascript
used_quantity = bought_quantity - remaining_quantity

// Prix unitaire
unit_price = price / bought_quantity
```

## Migration vers ProductLot

### Différences Clés

| Aspect | StockLot (ancien) | ProductLot (nouveau) |
|--------|-------------------|----------------------|
| Scope | Matières premières uniquement | Tous types de produits |
| Traçabilité | Limitée | Complète (origine, destination) |
| Mouvements | Calcul simple | Historique détaillé (LotMovement) |
| Qualité | Non intégré | Statut qualité intégré |
| Multi-entrepôts | Non supporté | Supporté nativement |

### Script de Migration

```javascript
async function migrateStockLotToProductLot() {
  const old_lots = await base44.entities.StockLot.list()
  
  for (const old_lot of old_lots) {
    // Créer le nouveau lot
    const new_lot = await base44.entities.ProductLot.create({
      lot_number: `MIGRATED-${old_lot.id}`,
      product_id: old_lot.rawmaterial_id,
      product_name: old_lot.rawmaterial_name,
      warehouse_id: "default_warehouse",  // À définir
      initial_quantity: old_lot.bought_quantity,
      current_quantity: old_lot.remaining_quantity,
      unit_cost: old_lot.price / old_lot.bought_quantity,
      received_date: old_lot.bought_at,
      status: old_lot.remaining_quantity > 0 ? "available" : "depleted"
    })
    
    // Créer le mouvement d'entrée
    await base44.entities.LotMovement.create({
      lot_number: new_lot.lot_number,
      product_id: old_lot.rawmaterial_id,
      movement_type: "in",
      quantity: old_lot.bought_quantity,
      quantity_before: 0,
      quantity_after: old_lot.bought_quantity,
      reference_type: "adjustment",
      notes: "Migré depuis ancien système StockLot"
    })
    
    // Si utilisé, créer le mouvement de consommation
    if (old_lot.used_quantity > 0) {
      await base44.entities.LotMovement.create({
        lot_number: new_lot.lot_number,
        product_id: old_lot.rawmaterial_id,
        movement_type: "consumption",
        quantity: -old_lot.used_quantity,
        quantity_before: old_lot.bought_quantity,
        quantity_after: old_lot.remaining_quantity,
        reference_type: "adjustment",
        notes: "Consommation historique migrée"
      })
    }
  }
}
```

## Exemple

```json
{
  "rawmaterial_id": "mat_farine_t55",
  "rawmaterial_name": "Farine T55",
  "bought_quantity": 1000,
  "remaining_quantity": 450,
  "used_quantity": 550,
  "unity": "kg",
  "price": 850,
  "bought_at": "2026-01-15T08:00:00Z"
}
```

## Limitations

1. **Pas de Numéro de Lot Unique**
   - Impossible de tracer précisément
   - Confusion si plusieurs achats même jour

2. **Pas de Multi-Entrepôts**
   - Impossible de savoir où est le stock
   - Problème pour entreprises multi-sites

3. **Pas de Traçabilité Détaillée**
   - Consommation globale uniquement
   - Impossible de savoir dans quels ordres utilisé

4. **Pas d'Intégration Qualité**
   - Statut qualité absent
   - Quarantaine non supportée

5. **Calcul Simple**
   - used_quantity calculé, pas enregistré par mouvement
   - Perte de précision et détails

## Recommandation

✅ **Pour tout nouveau développement, utilisez :**
- `ProductLot` pour les lots
- `LotMovement` pour les mouvements
- `StockLevel` pour les niveaux de stock

❌ **N'utilisez StockLot que pour :**
- Compatibilité avec données historiques
- Migration en cours
- Systèmes legacy