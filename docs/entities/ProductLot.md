# Entité : ProductLot (Lot Produit)

## Description

Représente un lot spécifique de produit avec traçabilité complète : origine, dates, mouvements et statut qualité.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `lot_number` | string | ✓ | Numéro unique du lot (ex: FAR-T55-20260131-001) |
| `product_id` | string | ✓ | ID du produit |
| `product_name` | string | | Nom du produit (copie) |

### Localisation

| Champ | Type | Description |
|-------|------|-------------|
| `warehouse_id` | string | ID de l'entrepôt actuel |
| `warehouse_name` | string | Nom de l'entrepôt |

### Quantités

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `initial_quantity` | number | ✓ | Quantité initiale du lot |
| `current_quantity` | number | | Quantité actuelle disponible |
| `reserved_quantity` | number | | Quantité réservée (défaut: 0) |

### Coût

| Champ | Type | Description |
|-------|------|-------------|
| `unit_cost` | number | Coût unitaire du lot |

### Dates

| Champ | Type | Description |
|-------|------|-------------|
| `manufacturing_date` | date | Date de fabrication |
| `expiry_date` | date | Date d'expiration |
| `received_date` | date | Date de réception (pour achats) |

### Origine

#### Si Acheté (Matière Première)

| Champ | Type | Description |
|-------|------|-------------|
| `supplier_id` | string | ID du fournisseur |
| `supplier_name` | string | Nom du fournisseur |

#### Si Fabriqué (Produit Fini)

| Champ | Type | Description |
|-------|------|-------------|
| `manufacturing_order_id` | string | ID de l'ordre de fabrication |

### Statut

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `status` | enum | `available`, `reserved`, `quarantine`, `expired`, `depleted` | Statut du lot (défaut: `available`) |

### Qualité

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `quality_status` | enum | `pending`, `approved`, `rejected`, `conditional` | Statut qualité |
| `quality_inspection_id` | string | | ID de l'inspection qualité |

### Informations Additionnelles

| Champ | Type | Description |
|-------|------|-------------|
| `notes` | string | Notes sur le lot |
| `traceability_data` | object | Données de traçabilité additionnelles (JSON) |

## Statuts

### Statut Général

| Statut | Description | Utilisable |
|--------|-------------|------------|
| `available` | Disponible pour production/vente | ✅ |
| `reserved` | Réservé pour un ordre | ✅ (pour cet ordre) |
| `quarantine` | En quarantaine suite problème qualité | ❌ |
| `expired` | Date d'expiration dépassée | ❌ |
| `depleted` | Quantité épuisée (current_quantity = 0) | ❌ |

### Statut Qualité

| Statut | Description | Action |
|--------|-------------|--------|
| `pending` | Inspection en attente | Bloquer utilisation |
| `approved` | Inspection réussie | Libérer pour utilisation |
| `rejected` | Inspection échouée | Quarantaine ou mise au rebut |
| `conditional` | Approuvé avec conditions | Utilisation restreinte |

## Contraintes

### Unicité
- `lot_number` doit être unique dans tout le système

### Validation
- `initial_quantity` > 0
- `current_quantity` >= 0
- `current_quantity` <= `initial_quantity`
- `reserved_quantity` >= 0
- `reserved_quantity` <= `current_quantity`
- `expiry_date` > `manufacturing_date` (si les deux sont définis)
- Si `quality_status` = `rejected` → `status` doit être `quarantine`

### Règles Métier

1. **FEFO (First Expired, First Out)**
   - Les lots avec expiry_date proche doivent être utilisés en priorité

2. **Traçabilité Obligatoire**
   - Pour produits avec `requires_lot_tracking` = true
   - Matières premières critiques
   - Produits alimentaires et pharmaceutiques

3. **Gestion Expiration**
   - Alertes à J-30, J-15, J-7
   - Statut automatique → `expired` après expiry_date

## Cycle de Vie

### 1. Création

**Par Réception d'Achat :**
```
GoodsReceipt → Crée ProductLot
- lot_number généré
- supplier_id renseigné
- status = "pending" (si inspection requise)
- ou "available" (si pas d'inspection)
```

**Par Production :**
```
ManufacturingOrder (completed) → Crée ProductLot
- lot_number généré
- manufacturing_order_id renseigné
- expiry_date calculée (manufacturing_date + lot_expiry_days)
- status = "pending" ou "available"
```

### 2. Inspection Qualité (optionnel)

```
QualityInspection créée
↓
Si réussite → quality_status = "approved", status = "available"
Si échec → quality_status = "rejected", status = "quarantine"
```

### 3. Utilisation

```
Consommation (production, vente)
↓
current_quantity diminue
↓
Si current_quantity = 0 → status = "depleted"
```

### 4. Expiration

```
expiry_date dépassée
↓
Vérification automatique quotidienne
↓
status = "expired"
↓
Alerte envoyée
↓
Mise au rebut ou destruction
```

## Relations

### Le lot :
- **Produit** → `Product` (via `product_id`)
- **Entrepôt** → `Warehouse` (via `warehouse_id`)
- **Fournisseur** → `Supplier` (via `supplier_id`, si acheté)
- **Ordre de Fabrication** → `ManufacturingOrder` (via `manufacturing_order_id`, si fabriqué)
- **Inspection** → `QualityInspection` (via `quality_inspection_id`)
- **Mouvements** → `LotMovement` (historique détaillé)

## Exemple

### Lot de Matière Première Achetée

```json
{
  "lot_number": "FAR-T55-20260131-001",
  "product_id": "prod_farine_t55",
  "product_name": "Farine T55",
  "warehouse_id": "wh_principal",
  "warehouse_name": "Entrepôt Principal",
  "initial_quantity": 1000,
  "current_quantity": 750,
  "reserved_quantity": 200,
  "unit_cost": 0.82,
  "manufacturing_date": "2026-01-15",
  "expiry_date": "2027-01-15",
  "received_date": "2026-01-31",
  "supplier_id": "sup_meunerie_france",
  "supplier_name": "Meunerie de France",
  "status": "available",
  "quality_status": "approved",
  "notes": "Certificat bio joint"
}
```

### Lot de Produit Fini Fabriqué

```json
{
  "lot_number": "GCH-500-20260201-003",
  "product_id": "prod_gateau_chocolat",
  "product_name": "Gâteau au Chocolat 500g",
  "warehouse_id": "wh_principal",
  "initial_quantity": 100,
  "current_quantity": 100,
  "reserved_quantity": 0,
  "unit_cost": 8.50,
  "manufacturing_date": "2026-02-01",
  "expiry_date": "2026-03-03",
  "manufacturing_order_id": "mo_2026_042",
  "status": "available",
  "quality_status": "approved",
  "quality_inspection_id": "qi_2026_156"
}
```

## Bonnes Pratiques

1. **Génération du Numéro de Lot**
   - Format : `{code_produit}-{date_YYYYMMDD}-{séquence}`
   - Exemple : FAR-T55-20260131-001
   - Lisible et traçable

2. **Gestion FEFO**
   - Affichez toujours expiry_date lors du picking
   - Utilisez les lots les plus proches expiration
   - Bloquez automatiquement les lots expirés

3. **Traçabilité**
   - Documentez l'origine (fournisseur ou OF)
   - Conservez les certificats qualité
   - Utilisez `traceability_data` pour infos additionnelles

4. **Inspection Qualité**
   - Matières premières critiques → inspection systématique
   - Produits finis → contrôle par échantillonnage
   - Bloquez le lot jusqu'à résultat

5. **Alertes Expiration**
   - Configurez des alertes à J-30, J-15, J-7
   - Priorisez l'utilisation des lots proches expiration
   - Planifiez promotions/déstockage si nécessaire

## Traçabilité Complète

### Traçabilité Amont (d'où vient ce lot ?)

```
Lot Produit Fini
↓
Manufacturing Order
↓
Composants (lots matières premières)
↓
Fournisseurs
```

### Traçabilité Aval (où est allé ce lot ?)

```
Lot Matière Première
↓
Consommé dans Manufacturing Orders
↓
Produit Fini (lots)
↓
Ventes / Clients
```

## Mouvements de Lot

Tous les changements sont enregistrés dans `LotMovement` :
- Entrée (création du lot)
- Réservation
- Consommation
- Transfert d'entrepôt
- Mise en quarantaine
- Libération de quarantaine
- Ajustement
- Mise au rebut

Voir documentation `LotMovement` pour détails.

## Indicateurs

- **Valeur du lot** = current_quantity × unit_cost
- **Taux d'utilisation** = (initial_quantity - current_quantity) / initial_quantity
- **Jours avant expiration** = expiry_date - aujourd'hui
- **Age du lot** = aujourd'hui - manufacturing_date