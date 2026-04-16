# Entité : Unity (Unité de Mesure)

## Description

Définit les unités de mesure utilisées dans l'application pour les produits, matières premières et quantités (kg, L, pcs, m, etc.).

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `name` | string | ✓ | Nom complet de l'unité (ex: Kilogramme) |
| `symbol` | string | ✓ | Symbole court (ex: kg, L, pcs) |

### Informations

| Champ | Type | Description |
|-------|------|-------------|
| `description` | string | Description de l'unité |

### Classification

| Champ | Type | Description |
|-------|------|-------------|
| `type` | enum | Type : `mass`, `volume`, `length`, `quantity`, `time`, `other` |
| `system` | enum | Système : `metric`, `imperial`, `custom` |

### Conversion

| Champ | Type | Description |
|-------|------|-------------|
| `base_unit` | string | Unité de base pour conversions (ex: kg pour grammes) |
| `conversion_factor` | number | Facteur de conversion vers l'unité de base |

## Contraintes

### Unicité
- `symbol` doit être unique (sensible à la casse)

### Validation
- `name` non vide
- `symbol` non vide, généralement 1-5 caractères
- `conversion_factor` > 0 si spécifié

## Unités Standards Recommandées

### Masse
- `g` : Gramme
- `kg` : Kilogramme
- `t` : Tonne
- `mg` : Milligramme

### Volume
- `ml` : Millilitre
- `L` : Litre
- `m³` : Mètre cube
- `cl` : Centilitre

### Longueur
- `mm` : Millimètre
- `cm` : Centimètre
- `m` : Mètre
- `km` : Kilomètre

### Quantité
- `pcs` : Pièces (unités)
- `dz` : Douzaine (12 pièces)
- `box` : Boîte
- `pallet` : Palette

### Temps
- `s` : Seconde
- `min` : Minute
- `h` : Heure
- `day` : Jour

## Exemples

### Kilogramme

```json
{
  "name": "Kilogramme",
  "symbol": "kg",
  "description": "Unité de masse du système international",
  "type": "mass",
  "system": "metric",
  "base_unit": "kg",
  "conversion_factor": 1
}
```

### Gramme

```json
{
  "name": "Gramme",
  "symbol": "g",
  "description": "Unité de masse, 1/1000 de kilogramme",
  "type": "mass",
  "system": "metric",
  "base_unit": "kg",
  "conversion_factor": 0.001
}
```

### Litre

```json
{
  "name": "Litre",
  "symbol": "L",
  "description": "Unité de volume du système métrique",
  "type": "volume",
  "system": "metric",
  "base_unit": "L",
  "conversion_factor": 1
}
```

### Pièce

```json
{
  "name": "Pièce",
  "symbol": "pcs",
  "description": "Unité de comptage",
  "type": "quantity",
  "system": "custom"
}
```

### Boîte

```json
{
  "name": "Boîte",
  "symbol": "box",
  "description": "Unité d'emballage",
  "type": "quantity",
  "system": "custom"
}
```

## Conversion d'Unités

### Système de Conversion

```javascript
function convertUnits(value, from_symbol, to_symbol) {
  const from_unit = Unity.findOne({ symbol: from_symbol })
  const to_unit = Unity.findOne({ symbol: to_symbol })
  
  // Vérifier compatibilité (même type)
  if (from_unit.type !== to_unit.type) {
    throw new Error('Conversion impossible entre types différents')
  }
  
  // Vérifier même unité de base
  if (from_unit.base_unit !== to_unit.base_unit) {
    throw new Error('Unités non compatibles')
  }
  
  // Conversion via l'unité de base
  const in_base = value × from_unit.conversion_factor
  const result = in_base / to_unit.conversion_factor
  
  return result
}

// Exemples
convertUnits(1000, 'g', 'kg')  // 1000g = 1kg
convertUnits(2.5, 'kg', 'g')   // 2.5kg = 2500g
convertUnits(500, 'ml', 'L')   // 500ml = 0.5L
```

## Relations

### L'unité est utilisée dans :
- **Product** → Champ `unity`
- **RawMaterial** → Champ `unity`
- **Recipe** → Composants (`steps[].components[].unity`)
- **BillOfMaterials** → Composants (`components[].unity`)
- **StockLevel** → Quantités (implicite)
- **PurchaseOrder** → Lignes de commande
- **GoodsReceipt** → Lignes de réception

## Bonnes Pratiques

1. **Standardisation**
   - Utilisez les symboles standards SI
   - Évitez les doublons (kg vs Kg)
   - Cohérence dans toute l'application

2. **Symboles Courts**
   - Maximum 5 caractères
   - Lisibles et reconnaissables
   - Pas d'espaces

3. **Conversion**
   - Définissez `base_unit` et `conversion_factor`
   - Permet calculs automatiques
   - Évite les erreurs de conversion

4. **Types Cohérents**
   - Ne mélangez pas les types
   - kg avec g (OK), kg avec L (NON)

5. **Liste Minimale**
   - N'ajoutez que les unités réellement utilisées
   - 10-20 unités suffisent généralement
   - Évitez la prolifération

## Utilisation dans l'Interface

### Sélection d'Unité

```javascript
// Dropdown dans formulaire produit
<Select name="unity">
  {unities.map(unity => (
    <SelectItem key={unity.id} value={unity.symbol}>
      {unity.symbol} - {unity.name}
    </SelectItem>
  ))}
</Select>
```

### Affichage avec Unité

```javascript
// Afficher une quantité avec son unité
function formatQuantity(quantity, unity_symbol) {
  return `${quantity} ${unity_symbol}`
}

// Exemples
formatQuantity(2.5, 'kg')    // "2.5 kg"
formatQuantity(150, 'pcs')   // "150 pcs"
formatQuantity(1.5, 'L')     // "1.5 L"
```

## Set d'Unités de Démarrage

### Agroalimentaire

```javascript
const default_unities = [
  { name: "Kilogramme", symbol: "kg", type: "mass" },
  { name: "Gramme", symbol: "g", type: "mass" },
  { name: "Litre", symbol: "L", type: "volume" },
  { name: "Millilitre", symbol: "ml", type: "volume" },
  { name: "Pièce", symbol: "pcs", type: "quantity" },
  { name: "Douzaine", symbol: "dz", type: "quantity" },
  { name: "Boîte", symbol: "box", type: "quantity" },
  { name: "Carton", symbol: "ctn", type: "quantity" }
]
```

### Électronique

```javascript
const electronics_unities = [
  { name: "Pièce", symbol: "pcs", type: "quantity" },
  { name: "Kit", symbol: "kit", type: "quantity" },
  { name: "Rouleau", symbol: "roll", type: "quantity" },
  { name: "Mètre", symbol: "m", type: "length" },
  { name: "Millimètre", symbol: "mm", type: "length" }
]
```

### Textile

```javascript
const textile_unities = [
  { name: "Mètre", symbol: "m", type: "length" },
  { name: "Mètre carré", symbol: "m²", type: "area" },
  { name: "Kilogramme", symbol: "kg", type: "mass" },
  { name: "Rouleau", symbol: "roll", type: "quantity" },
  { name: "Bobine", symbol: "spool", type: "quantity" }
]
```

## Indicateurs

- **Nombre d'unités configurées**
- **Unité la plus utilisée** = Count produits par unité
- **Types d'unités** = Répartition par type
- **Unités sans usage** = Unités non utilisées dans produits