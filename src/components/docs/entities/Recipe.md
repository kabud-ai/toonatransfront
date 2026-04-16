# Entité : Recipe (Recette)

## Description

Définit les étapes de production et les composants nécessaires pour fabriquer un produit. Une recette est un guide détaillé pour les opérateurs de production.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `title` | string | ✓ | Titre de la recette |
| `code` | string | ✓ | Code unique de la recette |
| `description` | string | | Description détaillée |
| `slug` | string | | Identifiant URL-friendly (généré automatiquement) |

### Versioning

| Champ | Type | Description |
|-------|------|-------------|
| `version` | string | Version de la recette (défaut: "1.0") |
| `status` | enum | Statut : `draft`, `active`, `obsolete` (défaut: `draft`) |

### Classification

| Champ | Type | Description |
|-------|------|-------------|
| `type_id` | string | ID du type de recette |
| `type_name` | string | Nom du type de recette |

### Coût

| Champ | Type | Description |
|-------|------|-------------|
| `cost` | number | Coût total de la recette (calculé automatiquement, défaut: 0) |

### Étapes de Production

| Champ | Type | Description |
|-------|------|-------------|
| `steps` | array | Liste ordonnée des étapes de production |

**Structure d'une étape :**
```json
{
  "lineorder": "integer",        // Ordre d'exécution (1, 2, 3...)
  "description": "string",        // Instructions détaillées
  "components": [                 // Composants utilisés dans cette étape
    {
      "rawmaterial_id": "string",
      "rawmaterial_name": "string",
      "quantity": "number",
      "unity": "string"
    }
  ]
}
```

## Statuts

| Statut | Description | Utilisation |
|--------|-------------|-------------|
| `draft` | Brouillon, en cours d'élaboration | Modification libre, pas utilisée en production |
| `active` | Active et validée | Utilisée pour ordres de fabrication |
| `obsolete` | Obsolète, remplacée | Consultation uniquement, historique |

## Contraintes

### Unicité
- `code` doit être unique dans tout le système

### Validation
- `title` non vide
- `code` non vide, format alphanumérique recommandé
- `status` doit être l'une des valeurs : draft, active, obsolete
- `steps` : array non vide (au moins une étape)
- Chaque étape :
  - `lineorder` : entier positif unique dans la recette
  - `description` : non vide
  - `components` : peut être vide (étape sans matières)
  - Chaque composant :
    - `rawmaterial_id` : doit référencer un produit existant
    - `quantity` : nombre positif
    - `unity` : chaîne non vide

### Règles Métier

1. **Une seule version active**
   - Un même produit peut avoir plusieurs recettes
   - Mais une seule recette peut être `active` à la fois pour un produit donné

2. **Modification de recette active**
   - Si une recette `active` est modifiée :
     - Créer une nouvelle version
     - Incrémenter le numéro de version
     - Ancienne version → `obsolete`
     - Nouvelle version → `active`

3. **Historique complet**
   - Toutes les modifications sont enregistrées dans `RecipeHistory`
   - Les anciennes versions restent consultables

## Calcul Automatique du Coût

```javascript
cost = Σ (
  pour chaque étape
    pour chaque composant
      composant.quantity × produit.cost_price
)
```

Le coût est recalculé automatiquement :
- À la création/modification de la recette
- Lorsque le prix d'un composant change

## Cycle de Vie

### 1. Création (draft)

```
Nouvelle Recette
↓
Statut = "draft"
↓
Ajout des étapes et composants
↓
Tests et validations
```

### 2. Activation (active)

```
Validation complète
↓
Changement statut → "active"
↓
Utilisable pour ordres de fabrication
↓
Enregistrement dans RecipeHistory
```

### 3. Modification

```
Besoin de modification
↓
Duplication de la recette
↓
Version incrémentée (v1.0 → v2.0)
↓
Modifications appliquées
↓
Nouvelle version → "active"
↓
Ancienne version → "obsolete"
```

### 4. Retrait (obsolete)

```
Recette remplacée ou abandonnée
↓
Statut → "obsolete"
↓
Consultation uniquement
↓
Conservée pour traçabilité historique
```

## Relations

### La recette :
- **Type** → `RecipeType` (via `type_id`)
- **Composants** → `Product` ou `RawMaterial` (via `steps[].components[].rawmaterial_id`)
- **Utilisée dans** → `ManufacturingOrder` (pour production)
- **Historique** → `RecipeHistory` (toutes modifications)

## Exemples

### Recette Simple - Gâteau au Chocolat

```json
{
  "title": "Gâteau au Chocolat 500g",
  "code": "REC-GCH-500",
  "description": "Recette standard pour gâteau au chocolat de 500g",
  "version": "2.1",
  "status": "active",
  "type_id": "type_patisserie",
  "type_name": "Pâtisserie",
  "cost": 8.50,
  "steps": [
    {
      "lineorder": 1,
      "description": "Préchauffer le four à 180°C. Mélanger les ingrédients secs.",
      "components": [
        {
          "rawmaterial_id": "mat_farine",
          "rawmaterial_name": "Farine T55",
          "quantity": 250,
          "unity": "g"
        },
        {
          "rawmaterial_id": "mat_cacao",
          "rawmaterial_name": "Cacao en poudre",
          "quantity": 50,
          "unity": "g"
        },
        {
          "rawmaterial_id": "mat_sucre",
          "rawmaterial_name": "Sucre",
          "quantity": 200,
          "unity": "g"
        }
      ]
    },
    {
      "lineorder": 2,
      "description": "Mélanger les ingrédients liquides séparément.",
      "components": [
        {
          "rawmaterial_id": "mat_oeufs",
          "rawmaterial_name": "Œufs",
          "quantity": 4,
          "unity": "pcs"
        },
        {
          "rawmaterial_id": "mat_huile",
          "rawmaterial_name": "Huile végétale",
          "quantity": 100,
          "unity": "ml"
        },
        {
          "rawmaterial_id": "mat_lait",
          "rawmaterial_name": "Lait",
          "quantity": 150,
          "unity": "ml"
        }
      ]
    },
    {
      "lineorder": 3,
      "description": "Incorporer progressivement les liquides aux secs. Verser dans le moule.",
      "components": []
    },
    {
      "lineorder": 4,
      "description": "Cuire 35-40 minutes. Laisser refroidir avant démoulage.",
      "components": []
    }
  ]
}
```

### Recette Multi-Étapes - Produit Électronique

```json
{
  "title": "Assemblage Circuit Principal v3",
  "code": "REC-ELEC-CP-V3",
  "version": "3.0",
  "status": "active",
  "type_id": "type_electronique",
  "type_name": "Électronique",
  "steps": [
    {
      "lineorder": 1,
      "description": "Préparation du PCB: Nettoyage et inspection visuelle",
      "components": [
        {
          "rawmaterial_id": "comp_pcb",
          "rawmaterial_name": "PCB Principal",
          "quantity": 1,
          "unity": "pcs"
        }
      ]
    },
    {
      "lineorder": 2,
      "description": "Soudure des composants CMS par machine pick & place",
      "components": [
        {
          "rawmaterial_id": "comp_resistances",
          "rawmaterial_name": "Kit Résistances",
          "quantity": 1,
          "unity": "kit"
        },
        {
          "rawmaterial_id": "comp_capacitors",
          "rawmaterial_name": "Kit Condensateurs",
          "quantity": 1,
          "unity": "kit"
        }
      ]
    },
    {
      "lineorder": 3,
      "description": "Passage au four de refusion",
      "components": []
    }
  ]
}
```

## Bonnes Pratiques

1. **Nommage**
   - Titre explicite et descriptif
   - Code structuré : REC-{catégorie}-{produit}
   - Version sémantique : major.minor (ex: 2.1)

2. **Étapes**
   - Descriptions claires et précises
   - Une action par étape (séparer si complexe)
   - Ordre logique et chronologique
   - Instructions compréhensibles par opérateurs

3. **Composants**
   - Unités cohérentes avec produits
   - Quantités précises et testées
   - Vérifiez disponibilité des matières

4. **Versioning**
   - Version mineure (+0.1) : petits ajustements
   - Version majeure (+1.0) : changements significatifs
   - Documentez les changements dans notes

5. **Validation**
   - Testez la recette avant activation
   - Vérifiez le coût calculé
   - Formez les opérateurs si nouveauté

6. **Maintenance**
   - Revue périodique des recettes actives
   - Mise à jour si amélioration du processus
   - Marquage obsolete des recettes abandonnées

## Historique des Modifications

Toutes les modifications sont automatiquement enregistrées dans `RecipeHistory` :

```json
{
  "recipe_id": "rec_123",
  "recipe_code": "REC-GCH-500",
  "recipe_version": "2.1",
  "changed_at": "2026-01-31T14:30:00Z",
  "changed_by": "chef@example.com",
  "change_type": "update",
  "previous_data": { /* ancienne recette */ },
  "new_data": { /* nouvelle recette */ }
}
```

## Utilisation

### Dans un Ordre de Fabrication

```javascript
// Création d'un ordre avec une recette
{
  "order_number": "MO-2026-042",
  "product_id": "prod_gateau",
  "quantity": 100,
  "recipe_id": "rec_gch_500",  // ← Recette utilisée
  "recipe_title": "Gâteau au Chocolat 500g v2.1"
}
```

### Calcul des Besoins

Pour produire 100 unités avec la recette exemple :
- Farine : 250g × 100 = 25 kg
- Cacao : 50g × 100 = 5 kg
- Sucre : 200g × 100 = 20 kg
- etc.

## Indicateurs

- **Nombre de recettes actives** par type
- **Coût moyen** des recettes par catégorie
- **Fréquence d'utilisation** (nb ordres utilisant la recette)
- **Taux de succès** (ordres réussis / total ordres)