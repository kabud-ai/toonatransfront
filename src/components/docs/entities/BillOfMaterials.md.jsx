# Entité : BillOfMaterials (Nomenclature / BOM)

## Description

La nomenclature (Bill of Materials ou BOM) définit tous les composants et matières premières nécessaires pour fabriquer une unité d'un produit fini, avec les quantités exactes requises.

## Différence avec Recipe

| Aspect | Recipe (Recette) | BOM (Nomenclature) |
|--------|------------------|-------------------|
| **Focus** | Instructions de fabrication | Liste des composants |
| **Contenu** | Étapes + Composants | Composants uniquement |
| **Utilisation** | Guide pour opérateurs | Calcul des besoins matières |
| **Détail** | Procédures détaillées | Quantités précises |

💡 **Conseil** : Une recette contient un BOM + les instructions de fabrication

## Champs

### Produit Principal

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `product_id` | string | ✓ | ID du produit fini |
| `product_name` | string | | Nom du produit (copie) |
| `product_code` | string | | Code du produit (copie) |

### Métadonnées

| Champ | Type | Description |
|-------|------|-------------|
| `version` | string | Version de la nomenclature (défaut: "1.0") |
| `status` | enum | Statut : `draft`, `active`, `obsolete` (défaut: `draft`) |
| `effective_date` | date | Date d'entrée en vigueur |
| `notes` | string | Notes et commentaires |

### Composants

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `components` | array | ✓ | Liste des composants nécessaires |

**Structure d'un composant :**
```json
{
  "component_id": "string",      // ID du produit/matière première
  "component_name": "string",     // Nom du composant
  "component_type": "string",     // Type : raw_material, semi_finished
  "quantity": "number",           // Quantité requise
  "unity": "string",              // Unité de mesure
  "unit_cost": "number",          // Coût unitaire
  "total_cost": "number",         // Coût total (quantity × unit_cost)
  "is_optional": "boolean",       // Composant optionnel ?
  "notes": "string"               // Notes spécifiques au composant
}
```

### Coûts Calculés

| Champ | Type | Description |
|-------|------|-------------|
| `total_material_cost` | number | Coût total des matières |
| `overhead_cost` | number | Frais généraux |
| `total_cost` | number | Coût total de fabrication |

## Statuts

| Statut | Description | Utilisation |
|--------|-------------|-------------|
| `draft` | Brouillon, en élaboration | Modification libre |
| `active` | Active et validée | Utilisée pour calculs de production |
| `obsolete` | Obsolète, remplacée | Consultation uniquement |

## Contraintes

### Unicité
- Un produit ne peut avoir qu'une seule BOM active à la fois
- Plusieurs versions peuvent exister (historique)

### Validation
- `product_id` doit référencer un produit existant de type `finished_product` ou `semi_finished`
- `components` : array non vide (au moins un composant)
- Chaque composant :
  - `component_id` : doit référencer un produit existant
  - `quantity` : nombre positif
  - `unity` : cohérente avec le produit composant
  - Pas de référence circulaire (A contient B, B contient A)

### Calculs Automatiques

```javascript
// Pour chaque composant
total_cost = quantity × unit_cost

// Pour la BOM complète
total_material_cost = Σ(composant.total_cost)
total_cost = total_material_cost + overhead_cost
```

## Types de Nomenclatures

### 1. Mono-niveau (Single-level)
Liste uniquement les composants directs du produit.

```
Gâteau au Chocolat
├── Farine (250g)
├── Cacao (50g)
├── Sucre (200g)
└── Œufs (4 pcs)
```

### 2. Multi-niveaux (Multi-level)
Inclut les sous-assemblages et leurs composants.

```
Ordinateur
├── Carte Mère
│   ├── PCB
│   ├── Processeur
│   └── Mémoire RAM
├── Boîtier
│   ├── Châssis métallique
│   └── Panneaux plastique
└── Alimentation
```

### 3. Variantes
Plusieurs BOM pour un même produit selon options/configurations.

```
Smartphone Model X
├── BOM Standard (64GB)
├── BOM Premium (128GB)
└── BOM Ultimate (256GB + 5G)
```

## Relations

### La nomenclature :
- **Produit fini** → `Product` (via `product_id`)
- **Composants** → `Product` ou `RawMaterial` (via `components[].component_id`)
- **Utilisée pour** :
  - Planification de production (`ProductionPlan`)
  - Calcul des besoins matières (MRP)
  - Suggestions de réapprovisionnement
  - Estimation des coûts

## Exemples

### BOM Simple - Gâteau au Chocolat

```json
{
  "product_id": "prod_gateau_chocolat",
  "product_name": "Gâteau au Chocolat 500g",
  "product_code": "GCH-500",
  "version": "1.0",
  "status": "active",
  "effective_date": "2026-01-01",
  "components": [
    {
      "component_id": "mat_farine",
      "component_name": "Farine T55",
      "component_type": "raw_material",
      "quantity": 0.25,
      "unity": "kg",
      "unit_cost": 0.85,
      "total_cost": 0.21,
      "is_optional": false
    },
    {
      "component_id": "mat_cacao",
      "component_name": "Cacao en poudre",
      "component_type": "raw_material",
      "quantity": 0.05,
      "unity": "kg",
      "unit_cost": 12.00,
      "total_cost": 0.60,
      "is_optional": false
    },
    {
      "component_id": "mat_sucre",
      "component_name": "Sucre",
      "component_type": "raw_material",
      "quantity": 0.20,
      "unity": "kg",
      "unit_cost": 1.20,
      "total_cost": 0.24,
      "is_optional": false
    },
    {
      "component_id": "mat_oeufs",
      "component_name": "Œufs",
      "component_type": "raw_material",
      "quantity": 4,
      "unity": "pcs",
      "unit_cost": 0.30,
      "total_cost": 1.20,
      "is_optional": false
    }
  ],
  "total_material_cost": 2.25,
  "overhead_cost": 0.50,
  "total_cost": 2.75
}
```

### BOM Multi-niveaux - Produit Électronique

```json
{
  "product_id": "prod_smartphone",
  "product_name": "Smartphone Model X",
  "version": "2.0",
  "status": "active",
  "components": [
    {
      "component_id": "semi_ecran",
      "component_name": "Écran OLED 6.5\"",
      "component_type": "semi_finished",
      "quantity": 1,
      "unity": "pcs",
      "unit_cost": 45.00,
      "total_cost": 45.00
    },
    {
      "component_id": "semi_carte_mere",
      "component_name": "Carte Mère Assemblée",
      "component_type": "semi_finished",
      "quantity": 1,
      "unity": "pcs",
      "unit_cost": 120.00,
      "total_cost": 120.00
    },
    {
      "component_id": "mat_batterie",
      "component_name": "Batterie Li-Ion 4000mAh",
      "component_type": "raw_material",
      "quantity": 1,
      "unity": "pcs",
      "unit_cost": 15.00,
      "total_cost": 15.00
    }
  ],
  "total_material_cost": 180.00,
  "overhead_cost": 20.00,
  "total_cost": 200.00
}
```

## Bonnes Pratiques

1. **Précision des Quantités**
   - Quantités exactes basées sur tests réels
   - Incluez les pertes/chutes normales
   - Unités cohérentes (conversions correctes)

2. **Maintenance**
   - Revue trimestrielle des BOM actives
   - Mise à jour si changement de process
   - Versioning lors de modifications majeures

3. **Coûts**
   - Maintenez les `unit_cost` à jour
   - Recalculez après changement prix fournisseur
   - Incluez les frais généraux (`overhead_cost`)

4. **Documentation**
   - Notes claires sur composants spéciaux
   - Référencez les normes/certifications
   - Indiquez les fournisseurs alternatifs

5. **Validation**
   - Vérifiez disponibilité des composants
   - Testez la nomenclature en production
   - Confirmez les unités de mesure

## Utilisation

### Calcul des Besoins Matières (MRP)

Pour produire **100 unités** de Gâteau au Chocolat :

```javascript
Besoins = BOM.components.map(comp => ({
  product: comp.component_name,
  quantity_needed: comp.quantity × 100,
  unity: comp.unity
}))

Résultat :
- Farine : 0.25 kg × 100 = 25 kg
- Cacao : 0.05 kg × 100 = 5 kg
- Sucre : 0.20 kg × 100 = 20 kg
- Œufs : 4 pcs × 100 = 400 pcs
```

### Vérification Disponibilité

```javascript
for (composant of BOM.components) {
  stock_disponible = StockLevel.get(composant.component_id)
  besoin = composant.quantity × quantity_to_produce
  
  if (stock_disponible < besoin) {
    alert(`Manque ${besoin - stock_disponible} ${composant.unity} de ${composant.component_name}`)
  }
}
```

### Explosion de Nomenclature (Multi-niveau)

Pour un produit avec sous-assemblages, calculez tous les besoins en matières premières finales :

```
Ordinateur (1 unité)
└── Explosion complète :
    ├── PCB : 1 pcs
    ├── Processeur : 1 pcs
    ├── Mémoire RAM : 2 pcs
    ├── Châssis métallique : 1 pcs
    └── etc.
```

## Indicateurs

- **Coût matières / Produit** = total_material_cost
- **Marge brute** = Prix vente - total_cost
- **Nombre de composants** = components.length
- **Complexité** = Profondeur de l'arbre (niveaux)

## Impact sur Autres Modules

### Production
- Calcul automatique des besoins matières
- Vérification disponibilité avant ordre
- Réservation des composants

### Achats
- Génération suggestions de réapprovisionnement
- Calcul des quantités à commander
- Planification des livraisons

### Coûts
- Calcul du coût de revient
- Analyse de rentabilité
- Prix de vente recommandés

### Inventaire
- MRP (Material Requirements Planning)
- Prévision des besoins
- Optimisation des stocks