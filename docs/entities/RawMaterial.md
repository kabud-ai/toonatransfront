# Entité : RawMaterial (Matière Première)

## Description

Représente une matière première utilisée dans la production. Peut être considérée comme un type spécialisé de `Product`.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `name` | string | ✓ | Nom de la matière première |
| `code` | string | ✓ | Code unique de la matière première |
| `slug` | string | | Identifiant URL-friendly (généré automatiquement) |

### Caractéristiques Physiques

| Champ | Type | Description |
|-------|------|-------------|
| `density` | number | Densité de la matière première (kg/L ou g/cm³) |
| `unity` | string | Unité de mesure (kg, L, g, ml, pcs, etc.) |

### Stock

| Champ | Type | Description |
|-------|------|-------------|
| `instock` | number | Quantité totale en stock (défaut: 0) |

### Informations

| Champ | Type | Description |
|-------|------|-------------|
| `description` | string | Description de la matière première |

## Contraintes

### Unicité
- `code` doit être unique

### Validation
- `name` non vide
- `code` non vide
- `density` > 0 si spécifiée
- `instock` >= 0
- `unity` : chaîne non vide

## Note sur la Relation avec Product

**Important :** Dans un système ERP complet, les matières premières sont généralement des `Product` avec `type` = `raw_material`.

L'entité `RawMaterial` est conservée pour compatibilité avec l'historique du système, mais il est recommandé d'utiliser l'entité `Product` pour toutes les nouvelles matières premières.

### Migration Recommandée

```javascript
// Créer un produit au lieu d'une matière première
const product = {
  name: "Farine T55",
  code: "FAR-T55",
  type: "raw_material",
  unity: "kg",
  density: 0.6,  // stocké dans description ou champ custom
  description: "Farine de blé type 55, densité 0.6 kg/L",
  requires_lot_tracking: true,
  lot_expiry_days: 365
}
```

## Exemples

### Matière Première Liquide

```json
{
  "name": "Huile de Tournesol",
  "code": "HUIL-TOUR",
  "slug": "huile-tournesol",
  "density": 0.92,
  "unity": "L",
  "instock": 500,
  "description": "Huile de tournesol raffinée pour pâtisserie"
}
```

### Matière Première Solide

```json
{
  "name": "Sucre Cristallisé",
  "code": "SUC-CRIST",
  "density": 0.85,
  "unity": "kg",
  "instock": 1200,
  "description": "Sucre cristallisé blanc pur saccharose"
}
```

### Matière Première par Pièce

```json
{
  "name": "Œufs Frais Calibre M",
  "code": "OEUF-M",
  "unity": "pcs",
  "instock": 2400,
  "description": "Œufs frais de poules élevées en plein air, calibre moyen"
}
```

## Conversion d'Unités

La densité permet de convertir entre unités :

```javascript
// kg → L
function kgToLiters(kg, density) {
  return kg / density
}

// L → kg
function litersToKg(liters, density) {
  return liters × density
}

// Exemple
const huile = RawMaterial.get({ code: "HUIL-TOUR" })
const liters = kgToLiters(100, huile.density)  // 100kg = 108.7L
```

## Relations

### La matière première :
- **Utilisée dans** → `Recipe` (comme composant)
- **Stock** → `StockLot` (lots de stock - ancien système)
- **Équivalent** → `Product` (type = raw_material)

## Bonnes Pratiques

1. **Transition vers Product**
   - Créez de nouvelles matières comme `Product`
   - Type = `raw_material`
   - Profitez des fonctionnalités avancées (lots, BOM, etc.)

2. **Densité**
   - Renseignez pour produits liquides/poudres
   - Permet conversions kg ↔ L
   - Utile pour recettes et stockage

3. **Unités Standards**
   - kg pour solides
   - L pour liquides
   - pcs pour unitaires
   - Cohérence dans tout le système

4. **Code Mnémonique**
   - Facilite identification
   - Format : {TYPE}-{DESCRIPTION}
   - Exemples : FAR-T55, SUC-CRIST, HUIL-TOUR

## Indicateurs

- **Nombre de matières premières actives**
- **Valeur totale du stock** = Σ(instock × coût unitaire)
- **Matières en rupture** = Count(instock = 0)
- **Consommation mensuelle** par matière