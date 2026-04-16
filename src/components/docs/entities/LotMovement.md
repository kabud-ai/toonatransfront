# Entité : LotMovement (Mouvement de Lot)

## Description

Enregistre tous les mouvements d'un lot spécifique : entrées, sorties, transferts, consommations. Assure la traçabilité complète du lot.

## Champs

### Identification du Lot

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `lot_number` | string | ✓ | Numéro du lot concerné |
| `product_id` | string | ✓ | ID du produit |
| `product_name` | string | | Nom du produit |

### Localisation

| Champ | Type | Description |
|-------|------|-------------|
| `warehouse_id` | string | ID de l'entrepôt actuel |

### Type de Mouvement

| Champ | Type | Obligatoire | Valeurs | Description |
|-------|------|-------------|---------|-------------|
| `movement_type` | enum | ✓ | Voir ci-dessous | Type de mouvement |

**Types disponibles :**
- `in` : Entrée en stock
- `out` : Sortie de stock
- `transfer` : Transfert entre entrepôts
- `adjustment` : Ajustement d'inventaire
- `production` : Création par production
- `consumption` : Consommation en production
- `quarantine` : Mise en quarantaine
- `release` : Libération de quarantaine

### Quantités

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `quantity` | number | ✓ | Quantité déplacée (positive pour entrée, négative pour sortie) |
| `quantity_before` | number | | Quantité avant le mouvement |
| `quantity_after` | number | | Quantité après le mouvement |

### Référence

| Champ | Type | Description |
|-------|------|-------------|
| `reference_type` | enum | Type de document source |
| `reference_id` | string | ID du document source |

**Types de référence :**
- `purchase_order` : Bon de commande
- `manufacturing_order` : Ordre de fabrication
- `sales_order` : Commande client
- `quality_inspection` : Inspection qualité
- `adjustment` : Ajustement manuel
- `transfer` : Transfert inter-entrepôts

### Transfert (si applicable)

| Champ | Type | Description |
|-------|------|-------------|
| `from_warehouse_id` | string | ID de l'entrepôt d'origine |
| `to_warehouse_id` | string | ID de l'entrepôt de destination |

### Coût

| Champ | Type | Description |
|-------|------|-------------|
| `unit_cost` | number | Coût unitaire au moment du mouvement |

### Utilisateur et Date

| Champ | Type | Description |
|-------|------|-------------|
| `performed_by` | string | Email de l'utilisateur ayant effectué le mouvement |
| `created_date` | datetime | Date et heure du mouvement (automatique) |

### Notes

| Champ | Type | Description |
|-------|------|-------------|
| `notes` | string | Notes et observations |

## Types de Mouvements Détaillés

### Entrée (in)
- **Contexte** : Réception de marchandise
- **Référence** : `purchase_order`, `goods_receipt`
- **Quantité** : Positive
- **Effet** : Augmente le stock du lot

### Sortie (out)
- **Contexte** : Expédition, vente
- **Référence** : `sales_order`
- **Quantité** : Négative
- **Effet** : Diminue le stock du lot

### Transfert (transfer)
- **Contexte** : Déplacement entre entrepôts
- **Référence** : `transfer`
- **Quantité** : Zéro (ou montant transféré)
- **Champs requis** : `from_warehouse_id`, `to_warehouse_id`
- **Effet** : Change la localisation du lot

### Ajustement (adjustment)
- **Contexte** : Correction d'inventaire, casse, perte
- **Référence** : `adjustment`
- **Quantité** : Positive ou négative
- **Effet** : Corrige le stock théorique

### Production (production)
- **Contexte** : Création du lot par fabrication
- **Référence** : `manufacturing_order`
- **Quantité** : Positive (quantité produite)
- **Effet** : Crée le lot initial

### Consommation (consumption)
- **Contexte** : Utilisation en production
- **Référence** : `manufacturing_order`
- **Quantité** : Négative
- **Effet** : Réduit le stock (matière consommée)

### Quarantaine (quarantine)
- **Contexte** : Problème qualité détecté
- **Référence** : `quality_inspection`
- **Quantité** : Zéro
- **Effet** : Change statut du lot

### Libération (release)
- **Contexte** : Résolution du problème qualité
- **Référence** : `quality_inspection`
- **Quantité** : Zéro
- **Effet** : Rend le lot disponible

## Contraintes

### Validation
- `lot_number` doit référencer un lot existant
- `product_id` doit correspondre au produit du lot
- `movement_type` : une des valeurs de l'enum
- `quantity` != 0 (sauf pour quarantine, release, transfer)
- `reference_type` et `reference_id` : cohérents
- Pour `transfer` : `from_warehouse_id` et `to_warehouse_id` obligatoires et différents

### Calculs Automatiques
```javascript
quantity_after = quantity_before + quantity

// Pour un lot
current_quantity = initial_quantity + Σ(movements.quantity)
```

## Relations

### Le mouvement concerne :
- **Lot** → `ProductLot` (via `lot_number`)
- **Produit** → `Product` (via `product_id`)
- **Entrepôt** → `Warehouse` (via `warehouse_id`)
- **Référence** :
  - `PurchaseOrder` (si reference_type = purchase_order)
  - `ManufacturingOrder` (si production/consumption)
  - `QualityInspection` (si quarantine/release)

## Exemples

### Entrée - Réception Achat

```json
{
  "lot_number": "FAR-T55-20260131-001",
  "product_id": "mat_farine",
  "product_name": "Farine T55",
  "warehouse_id": "wh_principal",
  "movement_type": "in",
  "quantity": 1000,
  "quantity_before": 0,
  "quantity_after": 1000,
  "reference_type": "purchase_order",
  "reference_id": "po_2026_042",
  "unit_cost": 0.82,
  "performed_by": "magasinier@example.com",
  "notes": "Réception bon de commande PO-2026-042. Sacs de 25kg."
}
```

### Consommation - Production

```json
{
  "lot_number": "FAR-T55-20260131-001",
  "product_id": "mat_farine",
  "product_name": "Farine T55",
  "warehouse_id": "wh_principal",
  "movement_type": "consumption",
  "quantity": -25,
  "quantity_before": 1000,
  "quantity_after": 975,
  "reference_type": "manufacturing_order",
  "reference_id": "mo_2026_042",
  "unit_cost": 0.82,
  "performed_by": "system",
  "notes": "Consommé pour ordre de fabrication MO-2026-042 (100 gâteaux)"
}
```

### Transfert Inter-Entrepôts

```json
{
  "lot_number": "FAR-T55-20260131-001",
  "product_id": "mat_farine",
  "product_name": "Farine T55",
  "movement_type": "transfer",
  "quantity": -200,
  "quantity_before": 975,
  "quantity_after": 775,
  "reference_type": "transfer",
  "reference_id": "tr_2026_050",
  "from_warehouse_id": "wh_principal",
  "to_warehouse_id": "wh_usine",
  "unit_cost": 0.82,
  "performed_by": "logistique@example.com",
  "notes": "Transfert vers entrepôt usine pour production locale"
}
```

### Mise en Quarantaine

```json
{
  "lot_number": "SUC-20260201-003",
  "product_id": "mat_sucre",
  "product_name": "Sucre cristallisé",
  "warehouse_id": "wh_principal",
  "movement_type": "quarantine",
  "quantity": 0,
  "quantity_before": 500,
  "quantity_after": 500,
  "reference_type": "quality_inspection",
  "reference_id": "qi_2026_201",
  "performed_by": "qualite@example.com",
  "notes": "Mise en quarantaine suite inspection. Humidité excessive détectée."
}
```

### Ajustement - Correction Inventaire

```json
{
  "lot_number": "FAR-T55-20260131-001",
  "product_id": "mat_farine",
  "product_name": "Farine T55",
  "warehouse_id": "wh_principal",
  "movement_type": "adjustment",
  "quantity": -10,
  "quantity_before": 775,
  "quantity_after": 765,
  "reference_type": "adjustment",
  "reference_id": "adj_2026_015",
  "unit_cost": 0.82,
  "performed_by": "inventaire@example.com",
  "notes": "Ajustement suite inventaire physique. Écart de 10kg (sacs endommagés)."
}
```

## Traçabilité Complète

### Historique d'un Lot

```javascript
// Récupérer tous les mouvements d'un lot
const movements = LotMovement.filter({
  lot_number: "FAR-T55-20260131-001"
}).sort('-created_date')

// Afficher l'historique
movements.forEach(m => {
  console.log(`${m.created_date}: ${m.movement_type} - ${m.quantity} (${m.notes})`)
})
```

Résultat :
```
2026-02-05: adjustment - -10 (Ajustement suite inventaire...)
2026-02-03: transfer - -200 (Transfert vers entrepôt usine...)
2026-02-01: consumption - -25 (Consommé pour ordre MO-2026-042...)
2026-01-31: in - 1000 (Réception bon de commande PO-2026-042...)
```

### Traçabilité Amont

```javascript
// D'où vient ce lot ?
const lot = ProductLot.get({ lot_number: "FAR-T55-20260131-001" })

if (lot.supplier_id) {
  // Matière première achetée
  console.log(`Fournisseur: ${lot.supplier_name}`)
  
  const creation_movement = LotMovement.findOne({
    lot_number: lot.lot_number,
    movement_type: "in"
  })
  
  const purchase_order = PurchaseOrder.get(creation_movement.reference_id)
  console.log(`Bon de commande: ${purchase_order.order_number}`)
  
} else if (lot.manufacturing_order_id) {
  // Produit fini fabriqué
  const mo = ManufacturingOrder.get(lot.manufacturing_order_id)
  console.log(`Fabriqué selon ordre: ${mo.order_number}`)
  console.log(`Recette utilisée: ${mo.recipe_title}`)
  
  // Quelles matières ont été consommées ?
  const consumed_materials = LotMovement.filter({
    reference_type: "manufacturing_order",
    reference_id: mo.id,
    movement_type: "consumption"
  })
  
  console.log("Matières consommées:")
  consumed_materials.forEach(m => {
    console.log(`  - ${m.product_name} (lot: ${m.lot_number}): ${Math.abs(m.quantity)}`)
  })
}
```

### Traçabilité Aval

```javascript
// Où est allé ce lot ?
const usages = LotMovement.filter({
  lot_number: "FAR-T55-20260131-001",
  movement_type: "consumption"
})

console.log("Ce lot a été utilisé dans:")
usages.forEach(u => {
  const mo = ManufacturingOrder.get(u.reference_id)
  console.log(`  - OF ${mo.order_number}: ${mo.product_name}`)
  console.log(`    Lot produit: ${mo.lot_number}`)
})
```

## Bonnes Pratiques

1. **Enregistrement Systématique**
   - Chaque mouvement physique → enregistrement informatique
   - Pas de mouvement manuel sans trace
   - Temps réel ou quasi temps réel

2. **Notes Explicites**
   - Documentez le contexte
   - Raison du mouvement
   - Personne responsable

3. **Références**
   - Liez toujours à un document source
   - Facilite les investigations
   - Assure la traçabilité

4. **Vérifications**
   - Contrôlez cohérence quantity_before/after
   - Alertes si écarts importants
   - Investigations systématiques

5. **Archivage**
   - Conservez l'historique complet
   - Jamais de suppression
   - Période de rétention conforme réglementation

## Rapports et Analyses

### Analyse des Mouvements

```javascript
// Mouvements par type sur une période
const movements_by_type = LotMovement
  .filter({ 
    created_date: { $gte: '2026-01-01', $lte: '2026-01-31' }
  })
  .groupBy('movement_type')
  .map(group => ({
    type: group[0].movement_type,
    count: group.length,
    total_quantity: group.reduce((sum, m) => sum + Math.abs(m.quantity), 0)
  }))
```

### Lots les Plus Utilisés

```javascript
// Lots avec le plus de mouvements
const active_lots = LotMovement
  .groupBy('lot_number')
  .map(group => ({
    lot_number: group[0].lot_number,
    product_name: group[0].product_name,
    movement_count: group.length,
    total_consumed: group
      .filter(m => m.movement_type === 'consumption')
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0)
  }))
  .sort((a, b) => b.movement_count - a.movement_count)
  .slice(0, 10)
```

### Taux de Rotation

```javascript
// Vitesse d'écoulement d'un lot
function calculateRotation(lot_number) {
  const movements = LotMovement.filter({ lot_number })
  const creation = movements.find(m => m.movement_type === 'in' || m.movement_type === 'production')
  const depletion = movements.find(m => m.quantity_after === 0)
  
  if (creation && depletion) {
    const days = (depletion.created_date - creation.created_date) / 86400000
    return {
      lot_number,
      days_in_stock: days,
      initial_quantity: creation.quantity,
      rotation_rate: creation.quantity / days  // quantité/jour
    }
  }
}
```

## Indicateurs

- **Mouvements par jour** = Count(movements) / jours
- **Taux d'ajustements** = (ajustements / total mouvements) × 100%
- **Délai moyen d'utilisation** = Moyenne(date sortie - date entrée)
- **Taux de consommation** = (mouvements consumption / total) × 100%

## Audit et Conformité

### Traçabilité Réglementaire

Pour industries réglementées (alimentaire, pharma, etc.) :

```javascript
// Générer rapport de traçabilité pour audit
function generateTraceabilityReport(lot_number) {
  const lot = ProductLot.get({ lot_number })
  const movements = LotMovement.filter({ lot_number }).sort('created_date')
  
  return {
    lot_info: {
      lot_number: lot.lot_number,
      product: lot.product_name,
      manufacturing_date: lot.manufacturing_date,
      expiry_date: lot.expiry_date,
      initial_quantity: lot.initial_quantity
    },
    origin: getOrigin(lot),
    movements: movements.map(m => ({
      date: m.created_date,
      type: m.movement_type,
      quantity: m.quantity,
      user: m.performed_by,
      reference: m.reference_id,
      notes: m.notes
    })),
    current_status: lot.status,
    current_location: lot.warehouse_name,
    current_quantity: lot.current_quantity
  }
}
``