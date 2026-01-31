# Entité : Product (Produit)

## Description

Représente un produit dans le système : produit fini, semi-fini, matière première ou consommable.

## Champs

### Informations de Base

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `name` | string | ✓ | Nom du produit |
| `code` | string | ✓ | Code unique du produit (SKU interne) |
| `sku` | string | | Stock Keeping Unit (référence commerciale) |
| `description` | string | | Description détaillée du produit |
| `slug` | string | | Identifiant URL-friendly (généré automatiquement) |

### Classification

| Champ | Type | Obligatoire | Valeurs | Description |
|-------|------|-------------|---------|-------------|
| `type` | enum | | `raw_material`, `semi_finished`, `finished_product`, `consumable` | Type de produit (défaut: `finished_product`) |
| `unity` | string | | | Unité de mesure (kg, L, pcs, m, etc.) |

### Traçabilité

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `requires_lot_tracking` | boolean | | Nécessite un suivi par lot (défaut: `true`) |
| `lot_expiry_days` | number | | Durée de validité du lot en jours |

### Prix

| Champ | Type | Description |
|-------|------|-------------|
| `cost_price` | number | Prix de revient unitaire |
| `selling_price` | number | Prix de vente unitaire |

### Organisation

| Champ | Type | Description |
|-------|------|-------------|
| `group_id` | string | ID du groupe/entreprise propriétaire |
| `image_url` | string | URL de l'image du produit |

### Champs Système (automatiques)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string | Identifiant unique (UUID) |
| `created_date` | datetime | Date de création |
| `updated_date` | datetime | Date de dernière modification |
| `created_by` | string | Email de l'utilisateur créateur |

## Contraintes

### Unicité
- Le champ `code` doit être unique dans tout le système
- Recommandé : `sku` unique si utilisé

### Validation
- `name` : Non vide, longueur maximale recommandée 200 caractères
- `code` : Non vide, format alphanumérique recommandé (ex: PRD-001)
- `type` : Doit être l'une des valeurs de l'enum
- `cost_price`, `selling_price` : Nombres positifs ou zéro
- `lot_expiry_days` : Nombre entier positif si spécifié

## Types de Produits

### `raw_material` (Matière Première)
- Produit acheté auprès de fournisseurs
- Utilisé dans la production
- Exemple : Farine, Sucre, Plastique

### `semi_finished` (Semi-Fini)
- Produit intermédiaire de fabrication
- Peut être composant d'autres produits
- Exemple : Pâte à gâteau, Circuit imprimé

### `finished_product` (Produit Fini)
- Produit final vendable
- Résultat de la production
- Exemple : Gâteau emballé, Smartphone

### `consumable` (Consommable)
- Produit utilisé mais non incorporé
- Exemple : Emballage, Étiquettes, Lubrifiants

## Relations

### Le produit est utilisé dans :
- `StockLevel` : Niveaux de stock par entrepôt
- `ProductLot` : Lots de traçabilité
- `BillOfMaterials` : Nomenclatures (comme produit fini ou composant)
- `Recipe` : Recettes de fabrication
- `ManufacturingOrder` : Ordres de fabrication
- `PurchaseOrder` : Bons de commande
- `SupplierCatalog` : Catalogues fournisseurs

## Exemples

### Produit Fini
```json
{
  "name": "Gâteau au Chocolat 500g",
  "code": "GCH-500",
  "sku": "CAKE-CHOC-500",
  "description": "Gâteau au chocolat artisanal, 500g",
  "type": "finished_product",
  "unity": "pcs",
  "requires_lot_tracking": true,
  "lot_expiry_days": 30,
  "cost_price": 8.50,
  "selling_price": 15.00,
  "image_url": "https://..."
}
```

### Matière Première
```json
{
  "name": "Farine T55",
  "code": "FAR-T55",
  "description": "Farine de blé type 55",
  "type": "raw_material",
  "unity": "kg",
  "requires_lot_tracking": true,
  "lot_expiry_days": 365,
  "cost_price": 0.85
}
```

## Bonnes Pratiques

1. **Codes Produits**
   - Utilisez des préfixes par catégorie (ex: GCH- pour gâteaux chocolat)
   - Format cohérent dans toute l'organisation
   - Évitez les caractères spéciaux

2. **Traçabilité**
   - Activez `requires_lot_tracking` pour les produits périssables
   - Définissez `lot_expiry_days` pour la gestion FEFO
   - Produits critiques : traçabilité obligatoire

3. **Prix**
   - Maintenez `cost_price` à jour pour calculs précis
   - `selling_price` pour analyses de marge

4. **Unités**
   - Standardisez les unités (kg, L, pcs, m)
   - Cohérence avec les fournisseurs et recettes

## Impact de Suppression

⚠️ **Attention** : La suppression d'un produit peut affecter :
- Les ordres de fabrication existants
- Les stocks en entrepôt
- Les recettes et nomenclatures
- Les commandes fournisseurs

Recommandation : Désactiver plutôt que supprimer (ajoutez un champ `is_active`).