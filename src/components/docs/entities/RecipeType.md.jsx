# Entité : RecipeType (Type de Recette)

## Description

Catégorise les recettes par type de production (pâtisserie, plats cuisinés, électronique, etc.). Facilite l'organisation et le filtrage des recettes.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `name` | string | ✓ | Nom du type de recette |
| `slug` | string | | Identifiant URL-friendly (généré automatiquement) |
| `description` | string | | Description du type de recette |

## Contraintes

### Unicité
- `name` doit être unique

### Validation
- `name` non vide
- `slug` généré automatiquement depuis `name` (minuscules, sans espaces)

## Relations

### Le type de recette :
- **Utilisé par** → `Recipe` (via `type_id`)

## Exemples

### Pâtisserie

```json
{
  "name": "Pâtisserie",
  "slug": "patisserie",
  "description": "Recettes de gâteaux, tartes, viennoiseries et desserts"
}
```

### Plats Cuisinés

```json
{
  "name": "Plats Cuisinés",
  "slug": "plats-cuisines",
  "description": "Recettes de plats préparés, soupes et sauces"
}
```

### Boulangerie

```json
{
  "name": "Boulangerie",
  "slug": "boulangerie",
  "description": "Recettes de pains, baguettes et spécialités boulangères"
}
```

### Électronique

```json
{
  "name": "Assemblage Électronique",
  "slug": "assemblage-electronique",
  "description": "Procédures d'assemblage de circuits et composants électroniques"
}
```

### Métallurgie

```json
{
  "name": "Usinage Métallurgie",
  "slug": "usinage-metallurgie",
  "description": "Processus d'usinage, découpe et assemblage de pièces métalliques"
}
```

## Bonnes Pratiques

1. **Classification Logique**
   - Créez des types par famille de produits
   - Évitez trop de granularité
   - 5-15 types maximum recommandé

2. **Noms Clairs**
   - Explicites et compréhensibles
   - Reflètent le métier de l'entreprise
   - Évitez acronymes obscurs

3. **Organisation**
   - Facilite filtrage et recherche
   - Groupement dans les rapports
   - Navigation dans l'interface

4. **Cohérence**
   - Maintenez la liste stable
   - Évitez les doublons sémantiques
   - Fusionnez les types similaires

## Utilisation

### Filtrer les Recettes par Type

```javascript
const recipes_patisserie = Recipe.filter({
  type_id: "type_patisserie",
  status: "active"
})
```

### Statistiques par Type

```javascript
const stats_by_type = RecipeType.list().map(type => {
  const recipes = Recipe.filter({ type_id: type.id })
  
  return {
    type_name: type.name,
    recipes_count: recipes.length,
    active_count: recipes.filter(r => r.status === 'active').length,
    avg_cost: recipes.reduce((sum, r) => sum + r.cost, 0) / recipes.length
  }
})
```

### Sélection dans Formulaire

```javascript
// Dropdown pour sélection du type
<Select>
  {recipeTypes.map(type => (
    <SelectItem key={type.id} value={type.id}>
      {type.name}
    </SelectItem>
  ))}
</Select>
```

## Indicateurs

- **Nombre de types de recettes**
- **Type le plus utilisé** = Type avec le plus de recettes
- **Répartition** = % de recettes par type
- **Types sans recettes** = Types non utilisés (à supprimer ?)

## Organisation dans l'Interface

### Menu de Navigation

```
Recettes
├── Toutes
├── Par Type
│   ├── Pâtisserie (42)
│   ├── Boulangerie (18)
│   ├── Plats Cuisinés (25)
│   └── Snacks (12)
└── Ajouter une Recette
```

### Tableau de Bord

Widgets par type de recette :
- Recettes actives par type
- Coût moyen par type
- Ordres de fabrication par type
- Performance de production par type

## Cas d'Usage

### Agroalimentaire

```
- Pâtisserie
- Boulangerie
- Viennoiserie
- Confiserie
- Plats Préparés
- Sauces et Condiments
```

### Électronique

```
- Assemblage PCB
- Câblage
- Boîtiers
- Tests et Calibration
```

### Textile

```
- Tissage
- Teinture
- Coupe
- Assemblage
- Finition
```

### Métallurgie

```
- Fonderie
- Usinage
- Soudure
- Traitement de Surface
- Assemblage Mécanique
```

## Évolution

### Ajout de Champs Additionnels (optionnel)

```json
{
  "name": "Pâtisserie",
  "slug": "patisserie",
  "description": "...",
  "icon": "cake",  // Icône pour l'UI
  "color": "#f59e0b",  // Couleur pour badges
  "requires_certification": false,  // Certification requise ?
  "default_lead_time_hours": 2,  // Temps de production type
  "quality_checks_mandatory": true  // Inspection qualité obligatoire
}
``