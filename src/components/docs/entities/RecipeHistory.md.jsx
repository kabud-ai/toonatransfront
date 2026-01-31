# Entité : RecipeHistory (Historique des Recettes)

## Description

Enregistre toutes les modifications apportées aux recettes pour assurer la traçabilité et permettre l'audit des changements.

## Champs

### Recette Concernée

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `recipe_id` | string | ✓ | ID de la recette modifiée |
| `recipe_title` | string | | Titre de la recette |
| `recipe_code` | string | | Code de la recette |
| `recipe_version` | string | | Version de la recette au moment du changement |

### Type de Changement

| Champ | Type | Obligatoire | Valeurs | Description |
|-------|------|-------------|---------|-------------|
| `change_type` | enum | ✓ | `create`, `update`, `delete` | Type de modification |

### Métadonnées

| Champ | Type | Description |
|-------|------|-------------|
| `changed_at` | datetime | Date et heure du changement |
| `changed_by` | string | Email de l'utilisateur qui a fait le changement |

### Données

| Champ | Type | Description |
|-------|------|-------------|
| `previous_data` | object | Données complètes avant modification (JSON) |
| `new_data` | object | Nouvelles données après modification (JSON) |

## Types de Changements

### Create (Création)
- Nouvelle recette créée
- `previous_data` = null
- `new_data` = recette complète

### Update (Modification)
- Recette existante modifiée
- `previous_data` = ancienne version
- `new_data` = nouvelle version

### Delete (Suppression)
- Recette supprimée (rare, généralement obsolete)
- `previous_data` = dernière version
- `new_data` = null

## Contraintes

### Validation
- `recipe_id` doit référencer une recette existante ou ayant existé
- `change_type` : une des valeurs de l'enum
- `changed_by` : email valide
- `changed_at` : date/heure valide
- Au moins un de `previous_data` ou `new_data` doit être non null

### Immuabilité
- ⚠️ Les enregistrements d'historique ne peuvent **jamais** être modifiés ou supprimés
- Garantit l'intégrité de l'audit trail

## Automatisation

### Enregistrement Automatique

Le système enregistre automatiquement dans `RecipeHistory` lors :

```javascript
// Création de recette
Recipe.create(data)
  ↓
RecipeHistory.create({
  recipe_id: newRecipe.id,
  recipe_title: data.title,
  recipe_code: data.code,
  recipe_version: data.version,
  change_type: "create",
  changed_at: now,
  changed_by: user.email,
  previous_data: null,
  new_data: data
})

// Modification de recette
Recipe.update(recipe_id, updates)
  ↓
const old_data = Recipe.get(recipe_id)  // Avant modification
RecipeHistory.create({
  recipe_id: recipe_id,
  change_type: "update",
  changed_at: now,
  changed_by: user.email,
  previous_data: old_data,
  new_data: { ...old_data, ...updates }
})

// Suppression de recette
Recipe.delete(recipe_id)
  ↓
RecipeHistory.create({
  recipe_id: recipe_id,
  change_type: "delete",
  changed_at: now,
  changed_by: user.email,
  previous_data: deleted_recipe,
  new_data: null
})
```

## Relations

### L'historique concerne :
- **Recette** → `Recipe` (via `recipe_id`)
- **Utilisateur** → `User` (via `changed_by`)

## Exemples

### Création de Recette

```json
{
  "recipe_id": "rec_gch_500",
  "recipe_title": "Gâteau au Chocolat 500g",
  "recipe_code": "REC-GCH-500",
  "recipe_version": "1.0",
  "change_type": "create",
  "changed_at": "2026-01-15T10:00:00Z",
  "changed_by": "chef@example.com",
  "previous_data": null,
  "new_data": {
    "title": "Gâteau au Chocolat 500g",
    "code": "REC-GCH-500",
    "version": "1.0",
    "status": "draft",
    "steps": [ /* ... */ ]
  }
}
```

### Modification de Recette

```json
{
  "recipe_id": "rec_gch_500",
  "recipe_title": "Gâteau au Chocolat 500g",
  "recipe_code": "REC-GCH-500",
  "recipe_version": "2.0",
  "change_type": "update",
  "changed_at": "2026-01-31T14:30:00Z",
  "changed_by": "chef@example.com",
  "previous_data": {
    "version": "1.0",
    "status": "active",
    "steps": [
      {
        "lineorder": 1,
        "description": "Mélanger farine et cacao",
        "components": [ /* ... */ ]
      }
    ]
  },
  "new_data": {
    "version": "2.0",
    "status": "active",
    "steps": [
      {
        "lineorder": 1,
        "description": "Tamiser la farine et le cacao ensemble",  // ← Modifié
        "components": [ /* ... */ ]
      },
      {
        "lineorder": 2,  // ← Nouvelle étape ajoutée
        "description": "Ajouter le sucre progressivement",
        "components": [ /* ... */ ]
      }
    ]
  }
}
```

## Bonnes Pratiques

1. **Traçabilité Complète**
   - Tous les changements sont automatiquement enregistrés
   - Aucune action manuelle requise
   - Historique immuable et fiable

2. **Audit**
   - Consultez l'historique pour investigation
   - Identifiez qui a modifié quoi et quand
   - Restaurez une version précédente si nécessaire

3. **Conformité**
   - Essentiel pour industries réglementées
   - Preuve des changements pour audits
   - Conservation selon durée légale

4. **Analyse des Changements**
   - Fréquence de modification par recette
   - Utilisateurs les plus actifs
   - Types de changements courants

## Utilisation

### Consulter l'Historique d'une Recette

```javascript
const history = RecipeHistory
  .filter({ recipe_id: "rec_gch_500" })
  .sort('-changed_at')

console.log(`Historique de ${history[0].recipe_title}:`)
history.forEach(h => {
  console.log(`${h.changed_at}: ${h.change_type} par ${h.changed_by}`)
})
```

Résultat :
```
Historique de Gâteau au Chocolat 500g:
2026-01-31 14:30: update par chef@example.com
2026-01-20 09:15: update par chef@example.com
2026-01-15 10:00: create par chef@example.com
```

### Comparer Deux Versions

```javascript
function compareVersions(history_entry) {
  const changes = []
  
  // Comparer les étapes
  const old_steps = history_entry.previous_data?.steps || []
  const new_steps = history_entry.new_data?.steps || []
  
  if (old_steps.length !== new_steps.length) {
    changes.push(`Nombre d'étapes: ${old_steps.length} → ${new_steps.length}`)
  }
  
  // Comparer les composants
  // ...
  
  return changes
}
```

### Restaurer une Version Précédente

```javascript
function restoreVersion(history_id) {
  const history_entry = RecipeHistory.get(history_id)
  
  if (!history_entry.previous_data) {
    throw new Error("Impossible de restaurer : pas de version précédente")
  }
  
  // Créer une nouvelle version avec les anciennes données
  const restored_version = {
    ...history_entry.previous_data,
    version: incrementVersion(history_entry.recipe_version),  // 2.0 → 3.0
    status: "draft"  // Nécessite revalidation
  }
  
  Recipe.update(history_entry.recipe_id, restored_version)
}
```

## Rapports et Analyses

### Activité par Utilisateur

```javascript
const changes_by_user = RecipeHistory
  .filter({ 
    changed_at: { $gte: '2026-01-01' }
  })
  .groupBy('changed_by')
  .map(group => ({
    user: group[0].changed_by,
    changes_count: group.length,
    creates: group.filter(h => h.change_type === 'create').length,
    updates: group.filter(h => h.change_type === 'update').length
  }))
  .sort((a, b) => b.changes_count - a.changes_count)
```

### Recettes les Plus Modifiées

```javascript
const most_modified = RecipeHistory
  .groupBy('recipe_id')
  .map(group => ({
    recipe_code: group[0].recipe_code,
    recipe_title: group[0].recipe_title,
    modifications_count: group.filter(h => h.change_type === 'update').length,
    last_modified: group.sort('-changed_at')[0].changed_at
  }))
  .sort((a, b) => b.modifications_count - a.modifications_count)
  .slice(0, 10)
```

### Timeline d'une Recette

```javascript
function getRecipeTimeline(recipe_id) {
  return RecipeHistory
    .filter({ recipe_id })
    .sort('changed_at')
    .map(h => ({
      date: h.changed_at,
      version: h.recipe_version,
      type: h.change_type,
      user: h.changed_by,
      summary: generateChangeSummary(h)
    }))
}

function generateChangeSummary(history_entry) {
  if (history_entry.change_type === 'create') {
    return "Recette créée"
  }
  
  if (history_entry.change_type === 'delete') {
    return "Recette supprimée"
  }
  
  // Pour update, analyser les différences
  const changes = []
  
  if (history_entry.previous_data.status !== history_entry.new_data.status) {
    changes.push(`Statut: ${history_entry.previous_data.status} → ${history_entry.new_data.status}`)
  }
  
  if (history_entry.previous_data.steps.length !== history_entry.new_data.steps.length) {
    changes.push(`Étapes: ${history_entry.previous_data.steps.length} → ${history_entry.new_data.steps.length}`)
  }
  
  return changes.join(', ')
}
```

## Indicateurs

- **Modifications par mois** = Count(change_type = 'update')
- **Fréquence moyenne de modification** par recette
- **Utilisateurs les plus actifs** = Group by changed_by
- **Recettes stables** = Pas de modification depuis > 6 mois

## Conformité et Réglementation

### Industries Réglementées

Pour l'agroalimentaire, pharmaceutique, etc. :

- **Obligation légale** de tracer les changements
- **Conservation** : 5-10 ans selon secteur
- **Audit trail** : Qui, Quoi, Quand, Pourquoi
- **Non-répudiation** : Les changements ne peuvent être niés

### Rapport d'Audit

```javascript
function generateAuditReport(start_date, end_date) {
  const changes = RecipeHistory.filter({
    changed_at: { $gte: start_date, $lte: end_date }
  })
  
  return {
    period: { start_date, end_date },
    total_changes: changes.length,
    by_type: {
      creates: changes.filter(c => c.change_type === 'create').length,
      updates: changes.filter(c => c.change_type === 'update').length,
      deletes: changes.filter(c => c.change_type === 'delete').length
    },
    by_user: changes.groupBy('changed_by'),
    details: changes.map(c => ({
      date: c.changed_at,
      recipe: c.recipe_code,
      version: c.recipe_version,
      type: c.change_type,
      user: c.changed_by
    }))
  }
}
``