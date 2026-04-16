# Entité : StockLevel (Niveau de Stock)

## Description

Représente le niveau de stock d'un produit dans un entrepôt spécifique. Un produit peut avoir plusieurs niveaux de stock (un par entrepôt).

## Champs

### Identifiants

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `product_id` | string | ✓ | ID du produit |
| `product_name` | string | | Nom du produit (copie) |
| `product_sku` | string | | SKU du produit (copie) |
| `warehouse_id` | string | ✓ | ID de l'entrepôt |
| `warehouse_name` | string | | Nom de l'entrepôt (copie) |

### Quantités

| Champ | Type | Description |
|-------|------|-------------|
| `quantity` | number | Quantité totale physique en stock (défaut: 0) |
| `reserved_quantity` | number | Quantité réservée pour ordres (défaut: 0) |
| `available_quantity` | number | Quantité disponible = quantity - reserved_quantity (défaut: 0) |

### Valorisation

| Champ | Type | Description |
|-------|------|-------------|
| `unit_cost` | number | Coût unitaire moyen (défaut: 0) |
| `total_value` | number | Valeur totale = quantity × unit_cost (défaut: 0) |

### Seuils d'Alerte

| Champ | Type | Description |
|-------|------|-------------|
| `min_stock_alert` | number | Seuil minimum d'alerte stock bas (défaut: 10) |
| `max_stock_alert` | number | Seuil maximum d'alerte surstock |
| `reorder_point` | number | Point de réapprovisionnement |
| `reorder_quantity` | number | Quantité de réapprovisionnement suggérée |

### Dernière Activité

| Champ | Type | Description |
|-------|------|-------------|
| `last_movement_date` | datetime | Date du dernier mouvement de stock |

## Contraintes

### Unicité
- La paire (`product_id`, `warehouse_id`) doit être unique
- Un produit ne peut avoir qu'un seul niveau de stock par entrepôt

### Validation
- `quantity` >= 0 (ne peut pas être négatif)
- `reserved_quantity` >= 0
- `reserved_quantity` <= `quantity` (impossible de réserver plus que disponible)
- `available_quantity` = `quantity` - `reserved_quantity` (calculé automatiquement)
- `unit_cost` >= 0
- `min_stock_alert` >= 0
- `reorder_point` >= `min_stock_alert` (recommandé)

### Calculs Automatiques

```javascript
available_quantity = quantity - reserved_quantity
total_value = quantity × unit_cost
```

## États d'Alerte

| Condition | Niveau | Icône | Couleur |
|-----------|--------|-------|---------|
| `available_quantity` = 0 | Rupture | 🔴 | Rouge |
| `available_quantity` < `min_stock_alert` | Stock bas | 🟠 | Orange |
| `available_quantity` < `reorder_point` | À réapprovisionner | 🟡 | Jaune |
| `quantity` > `max_stock_alert` | Surstock | 🟣 | Violet |
| Sinon | Normal | 🟢 | Vert |

## Mouvements de Stock

Les niveaux de stock sont mis à jour automatiquement lors des :

### Entrées (quantity ↑)
- Réception de bon de commande (`GoodsReceipt`)
- Production terminée (`ManufacturingOrder`)
- Ajustement d'inventaire positif
- Transfert entrant d'un autre entrepôt

### Sorties (quantity ↓)
- Consommation en production
- Vente / Expédition
- Ajustement d'inventaire négatif
- Transfert sortant vers un autre entrepôt
- Mise au rebut (expiration, qualité)

### Réservations (reserved_quantity ↑)
- Création d'ordre de fabrication planifié
- Ordre de vente confirmé

### Libérations (reserved_quantity ↓)
- Annulation d'ordre
- Consommation effective des réservations

## Relations

### Le niveau de stock :
- **Produit** → `Product` (via `product_id`)
- **Entrepôt** → `Warehouse` (via `warehouse_id`)
- **Détails** → `ProductLot` (lots individuels du produit dans cet entrepôt)
- **Mouvements** → `StockMovement` (historique des changements)

## Exemple

```json
{
  "product_id": "prod_farine_t55",
  "product_name": "Farine T55",
  "product_sku": "FAR-T55",
  "warehouse_id": "wh_principal",
  "warehouse_name": "Entrepôt Principal",
  "quantity": 450.5,
  "reserved_quantity": 150.0,
  "available_quantity": 300.5,
  "unit_cost": 0.85,
  "total_value": 382.93,
  "min_stock_alert": 100,
  "max_stock_alert": 1000,
  "reorder_point": 150,
  "reorder_quantity": 500,
  "last_movement_date": "2026-01-31T14:30:00Z"
}
```

## Bonnes Pratiques

1. **Configuration des Seuils**
   - Basez-vous sur l'historique de consommation
   - `min_stock_alert` = 7-15 jours de consommation moyenne
   - `reorder_point` = délai de livraison + stock de sécurité
   - `reorder_quantity` = lot économique

2. **Surveillance**
   - Consultez les alertes quotidiennement
   - Configurez des notifications email automatiques
   - Analysez les tendances de consommation

3. **Précision**
   - Effectuez des inventaires physiques réguliers
   - Ajustez `unit_cost` à chaque réception
   - Investiguer les écarts > 5%

4. **Réapprovisionnement**
   - Réagissez rapidement aux alertes
   - Anticipez les pics de consommation
   - Vérifiez disponibilité fournisseur

## Calculs Avancés

### Coût Unitaire Moyen Pondéré (CUMP)

Lors d'une entrée de stock :
```javascript
nouveau_unit_cost = (
  (quantity_avant × unit_cost_avant) + 
  (quantity_entrée × coût_entrée)
) / (quantity_avant + quantity_entrée)
```

### Taux de Rotation

```javascript
taux_rotation = quantité_sortie_annuelle / quantity_moyenne
```

### Couverture de Stock

```javascript
jours_couverture = available_quantity / consommation_quotidienne_moyenne
```

## Indicateurs Tableau de Bord

- **Valeur totale du stock** = Σ(total_value) tous produits
- **Nombre d'alertes actives** = Count(available_quantity < min_stock_alert)
- **Taux de disponibilité** = (produits avec stock / total produits) × 100%
- **Stock dormant** = Produits sans mouvement depuis > 90 jours

## Notifications Email Automatiques

Le système envoie des emails lorsque :
- ⚠️ **Stock critique** : available_quantity = 0
- 🟠 **Stock bas** : available_quantity < min_stock_alert
- 🟡 **Point de commande** : available_quantity < reorder_point
- 🟣 **Surstock** : quantity > max_stock_alert

Configuration dans : Paramètres → Notifications → Inventaire

## Multi-Entrepôts

Un même produit peut exister dans plusieurs entrepôts :

```
Produit "Farine T55":
  ├── Entrepôt Principal: 450 kg
  ├── Entrepôt Secondaire: 200 kg
  └── Entrepôt Usine: 50 kg
  Total global: 700 kg
```

Pour obtenir le stock total d'un produit :
```javascript
stock_total = Σ(quantity) WHERE product_id = "prod_farine_t55"
``