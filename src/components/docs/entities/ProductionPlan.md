# Entité : ProductionPlan (Plan de Production)

## Description

Planification prévisionnelle de production avant la création d'un ordre de fabrication réel. Permet d'anticiper les besoins et de vérifier la faisabilité.

## Champs

### Produit à Fabriquer

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `product_id` | string | ✓ | ID du produit à fabriquer |
| `product_name` | string | | Nom du produit |

### Recette

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `recipe_id` | string | ✓ | ID de la recette à utiliser |
| `recipe_title` | string | | Titre de la recette |

### Quantité et Coût

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `quantity` | number | ✓ | Quantité prévue à produire |
| `cost` | number | | Coût estimé de production |

### Statut

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `status` | enum | `planned`, `in_progress`, `completed`, `cancelled` | Statut du plan (défaut: `planned`) |

### Dates

| Champ | Type | Description |
|-------|------|-------------|
| `planned_date` | date | Date de production prévue |
| `completed_date` | datetime | Date de fin de production |

## Statuts

| Statut | Description | Actions |
|--------|-------------|---------|
| `planned` | Planifié, en attente | Convertir en ordre, Modifier, Annuler |
| `in_progress` | Converti en ordre actif | Suivre l'ordre de fabrication |
| `completed` | Production terminée | Consultation |
| `cancelled` | Plan annulé | Consultation |

## Contraintes

### Validation
- `product_id` doit référencer un produit existant
- `recipe_id` doit référencer une recette active
- `quantity` > 0
- `planned_date` >= date actuelle (si nouveau plan)

### Calculs Automatiques

```javascript
// Coût estimé
cost = recipe.cost × quantity

// Besoins en matières premières
material_requirements = recipe.steps.flatMap(step =>
  step.components.map(comp => ({
    material: comp.rawmaterial_name,
    required: comp.quantity × quantity,
    unity: comp.unity
  }))
)
```

## Vérification de Faisabilité

Le système vérifie automatiquement :

```javascript
function checkFeasibility(plan) {
  const checks = {
    materials_available: true,
    warehouse_capacity: true,
    equipment_available: true,
    alerts: []
  }
  
  // 1. Vérifier disponibilité matières
  for (const requirement of plan.material_requirements) {
    const stock = StockLevel.get({
      product_id: requirement.material_id,
      warehouse_id: plan.warehouse_id
    })
    
    if (stock.available_quantity < requirement.quantity) {
      checks.materials_available = false
      checks.alerts.push({
        type: "material_shortage",
        material: requirement.material_name,
        needed: requirement.quantity,
        available: stock.available_quantity,
        missing: requirement.quantity - stock.available_quantity
      })
    }
  }
  
  // 2. Vérifier capacité entrepôt
  const warehouse = Warehouse.get(plan.warehouse_id)
  const projected_stock = warehouse.current_stock_value + (plan.quantity × plan.product.cost_price)
  
  if (warehouse.utilization_rate > 90) {
    checks.warehouse_capacity = false
    checks.alerts.push({
      type: "warehouse_full",
      warehouse: warehouse.name,
      utilization: warehouse.utilization_rate
    })
  }
  
  // 3. Vérifier disponibilité équipements
  const required_equipment = plan.recipe.equipment_requirements || []
  for (const equip_id of required_equipment) {
    const equipment = Equipment.get(equip_id)
    if (equipment.status !== "operational") {
      checks.equipment_available = false
      checks.alerts.push({
        type: "equipment_unavailable",
        equipment: equipment.name,
        status: equipment.status
      })
    }
  }
  
  checks.feasible = checks.materials_available && 
                    checks.warehouse_capacity && 
                    checks.equipment_available
  
  return checks
}
```

## Cycle de Vie

### 1. Création du Plan

```
Analyse des besoins (prévisions, commandes clients)
↓
Création du plan de production
↓
Status = "planned"
↓
Vérification de faisabilité automatique
```

### 2. Validation

```
Vérification manuelle
↓
Ajustements si nécessaire
↓
Confirmation du plan
```

### 3. Conversion en Ordre

```
Plan validé
↓
Clic sur "Créer l'ordre de fabrication"
↓
Création automatique de ManufacturingOrder
↓
Status plan → "in_progress"
↓
Lien avec l'ordre créé
```

### 4. Exécution

```
L'ordre de fabrication est exécuté
↓
Production réalisée
↓
Status plan → "completed"
↓
completed_date = date de fin
```

## Relations

### Le plan :
- **Produit** → `Product` (via `product_id`)
- **Recette** → `Recipe` (via `recipe_id`)
- **Génère** → `ManufacturingOrder` (lors conversion)
- **Analyse** → `StockLevel` (vérification disponibilité)

## Exemples

### Plan Simple

```json
{
  "product_id": "prod_gateau_chocolat",
  "product_name": "Gâteau au Chocolat 500g",
  "recipe_id": "rec_gch_500",
  "recipe_title": "Gâteau au Chocolat v2.0",
  "quantity": 200,
  "cost": 1700.00,
  "status": "planned",
  "planned_date": "2026-02-05"
}
```

### Plan avec Vérification

```json
{
  "product_id": "prod_gateau_chocolat",
  "product_name": "Gâteau au Chocolat 500g",
  "recipe_id": "rec_gch_500",
  "quantity": 500,
  "cost": 4250.00,
  "status": "planned",
  "planned_date": "2026-02-10",
  "feasibility_check": {
    "feasible": false,
    "materials_available": false,
    "alerts": [
      {
        "type": "material_shortage",
        "material": "Farine T55",
        "needed": 125,
        "available": 75,
        "missing": 50
      }
    ]
  }
}
```

## Bonnes Pratiques

1. **Planification à l'Avance**
   - Créez les plans 1-2 semaines à l'avance
   - Vérifiez la faisabilité
   - Commandez les matières manquantes

2. **Groupage**
   - Regroupez les productions similaires
   - Optimisez l'utilisation des équipements
   - Réduisez les changements de série

3. **Flexibilité**
   - Gardez une marge de manœuvre
   - Ne planifiez pas 100% de la capacité
   - Prévoyez du temps pour imprévus

4. **Communication**
   - Partagez le plan avec l'équipe
   - Confirmez disponibilité ressources
   - Ajustez selon feedbacks

## Planification Capacitaire

### Calcul de Charge

```javascript
function calculateWorkload(plans) {
  return plans
    .filter(p => p.status === 'planned')
    .groupBy('planned_date')
    .map(group => ({
      date: group[0].planned_date,
      orders_count: group.length,
      total_quantity: group.reduce((sum, p) => sum + p.quantity, 0),
      total_cost: group.reduce((sum, p) => sum + p.cost, 0),
      estimated_hours: group.reduce((sum, p) => sum + estimateProductionTime(p), 0)
    }))
}
```

### Lissage de Charge

```javascript
// Identifier les surcharges
const overloaded_days = workload.filter(day => day.estimated_hours > 8)

// Suggestion de répartition
for (const day of overloaded_days) {
  console.log(`${day.date} surchargé: ${day.estimated_hours}h`)
  console.log("Suggestion: Reporter certains plans sur jours suivants")
}
```

## Intégration MRP (Material Requirements Planning)

```javascript
// Calculer tous les besoins matières pour les plans futurs
function calculateMRP(start_date, end_date) {
  const future_plans = ProductionPlan.filter({
    status: 'planned',
    planned_date: { $gte: start_date, $lte: end_date }
  })
  
  const requirements = {}
  
  for (const plan of future_plans) {
    const recipe = Recipe.get(plan.recipe_id)
    
    for (const step of recipe.steps) {
      for (const comp of step.components) {
        const key = `${comp.rawmaterial_id}_${plan.planned_date}`
        
        if (!requirements[key]) {
          requirements[key] = {
            material_id: comp.rawmaterial_id,
            material_name: comp.rawmaterial_name,
            date: plan.planned_date,
            total_needed: 0,
            unity: comp.unity
          }
        }
        
        requirements[key].total_needed += comp.quantity × plan.quantity
      }
    }
  }
  
  return Object.values(requirements)
}
```

## Indicateurs

- **Plans actifs** = Count(status = 'planned')
- **Quantité totale planifiée** par produit
- **Charge de travail** par semaine
- **Taux de conversion** = (Plans convertis / Total plans) × 100%
- **Délai moyen de planification** = planned_date - created_date