# Entité : MaintenanceOrder (Ordre de Maintenance)

## Description

Représente un ordre de maintenance préventive, corrective ou d'urgence sur un équipement de production.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `order_number` | string | ✓ | Numéro unique de l'ordre (ex: MT-2026-001) |

### Équipement

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `equipment_id` | string | ✓ | ID de l'équipement concerné |
| `equipment_name` | string | | Nom de l'équipement |

### Type et Priorité

| Champ | Type | Obligatoire | Valeurs | Description |
|-------|------|-------------|---------|-------------|
| `type` | enum | ✓ | `preventive`, `corrective`, `predictive`, `emergency` | Type de maintenance (défaut: `preventive`) |
| `priority` | enum | | `low`, `normal`, `high`, `critical` | Niveau de priorité (défaut: `normal`) |

### Statut

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `status` | enum | `scheduled`, `in_progress`, `waiting_parts`, `completed`, `cancelled` | Statut de l'ordre (défaut: `scheduled`) |

### Description

| Champ | Type | Description |
|-------|------|-------------|
| `description` | string | Description du problème ou de l'intervention |

### Planification

| Champ | Type | Description |
|-------|------|-------------|
| `scheduled_date` | date | Date planifiée de l'intervention |
| `started_at` | datetime | Date et heure de démarrage réel |
| `completed_at` | datetime | Date et heure de fin |

### Affectation

| Champ | Type | Description |
|-------|------|-------------|
| `assigned_to` | string | Email du technicien assigné |

### Temps d'Arrêt

| Champ | Type | Description |
|-------|------|-------------|
| `downtime_hours` | number | Durée d'arrêt de l'équipement (heures) |

### Coûts

| Champ | Type | Description |
|-------|------|-------------|
| `labor_cost` | number | Coût de main d'œuvre |
| `parts_cost` | number | Coût des pièces de rechange |
| `total_cost` | number | Coût total (labor + parts) |

### Pièces Utilisées

| Champ | Type | Description |
|-------|------|-------------|
| `parts_used` | array | Liste des pièces consommées |

**Structure d'une pièce :**
```json
{
  "product_id": "string",
  "product_name": "string",
  "quantity": "number",
  "cost": "number"
}
```

### Checklist

| Champ | Type | Description |
|-------|------|-------------|
| `checklist` | array | Liste de tâches à effectuer |

**Structure d'une tâche :**
```json
{
  "task": "string",
  "completed": "boolean"
}
```

### Notes

| Champ | Type | Description |
|-------|------|-------------|
| `notes` | string | Notes et observations |

## Types de Maintenance

| Type | Description | Planification | Priorité Typique |
|------|-------------|---------------|------------------|
| `preventive` | Maintenance planifiée régulière | Calendrier fixe | Normal |
| `corrective` | Réparation suite à panne | Après détection problème | High |
| `predictive` | Basée sur indicateurs de performance | Analyse prédictive | Normal-High |
| `emergency` | Intervention d'urgence | Immédiate | Critical |

## Statuts

### Workflow Standard

```
scheduled → in_progress → completed
               ↓
         waiting_parts
               ↓
         in_progress → completed
               
         cancelled (à tout moment)
```

| Statut | Description | Actions |
|--------|-------------|---------|
| `scheduled` | Planifié, en attente | Démarrer, Reprogrammer, Annuler |
| `in_progress` | Intervention en cours | Terminer, Mettre en attente pièces |
| `waiting_parts` | En attente de pièces de rechange | Reprendre quand pièces disponibles |
| `completed` | Terminé avec succès | Consultation uniquement |
| `cancelled` | Annulé | Consultation uniquement |

## Contraintes

### Unicité
- `order_number` doit être unique

### Validation
- `equipment_id` doit référencer un équipement existant
- `type` : une des valeurs de l'enum
- `priority` : une des valeurs de l'enum
- `status` : une des valeurs de l'enum
- `downtime_hours` >= 0
- `labor_cost`, `parts_cost`, `total_cost` >= 0
- `total_cost` = `labor_cost` + `parts_cost`
- `completed_at` >= `started_at` (si les deux sont définis)

## Automatisations

### Lors de la Création
- Génération automatique de `order_number`
- Si type = `emergency` → priority = `critical`
- Notification envoyée au technicien assigné

### Au Démarrage (`scheduled` → `in_progress`)
- `started_at` = maintenant
- Équipement.status → `under_maintenance`
- Blocage de l'équipement (indisponible pour production)

### À la Complétion (`in_progress` → `completed`)
- `completed_at` = maintenant
- Calcul de `downtime_hours`
- Calcul de `total_cost`
- Consommation des pièces utilisées (stock)
- Équipement.status → `operational`
- Mise à jour des compteurs équipement (heures de maintenance)

### Si Pièces Manquantes (`in_progress` → `waiting_parts`)
- Création automatique de suggestion d'achat
- Notification au gestionnaire stocks
- Équipement reste bloqué

## Relations

### L'ordre de maintenance :
- **Équipement** → `Equipment` (via `equipment_id`)
- **Pièces** → `Product` (via `parts_used[].product_id`)
- **Technicien** → `User` (via `assigned_to`)
- **Consomme** → `StockLevel` (pièces de rechange)

## Exemples

### Maintenance Préventive

```json
{
  "order_number": "MT-2026-045",
  "equipment_id": "eq_four_01",
  "equipment_name": "Four Industriel #1",
  "type": "preventive",
  "priority": "normal",
  "status": "completed",
  "description": "Révision trimestrielle : nettoyage, graissage, vérification résistances",
  "scheduled_date": "2026-01-31",
  "started_at": "2026-01-31T08:00:00Z",
  "completed_at": "2026-01-31T12:00:00Z",
  "assigned_to": "technicien@example.com",
  "downtime_hours": 4,
  "labor_cost": 200,
  "parts_used": [
    {
      "product_id": "piece_joint",
      "product_name": "Joint de porte four",
      "quantity": 1,
      "cost": 45
    },
    {
      "product_id": "piece_graisse",
      "product_name": "Graisse haute température",
      "quantity": 0.5,
      "cost": 15
    }
  ],
  "parts_cost": 60,
  "total_cost": 260,
  "checklist": [
    { "task": "Nettoyage complet", "completed": true },
    { "task": "Vérification résistances", "completed": true },
    { "task": "Remplacement joint porte", "completed": true },
    { "task": "Graissage charnières", "completed": true },
    { "task": "Test de fonctionnement", "completed": true }
  ],
  "notes": "Intervention réussie. Four en parfait état. Prochaine maintenance prévue: 2026-04-30"
}
```

### Maintenance Corrective Urgente

```json
{
  "order_number": "MT-2026-046",
  "equipment_id": "eq_melangeur_02",
  "equipment_name": "Mélangeur Industriel #2",
  "type": "emergency",
  "priority": "critical",
  "status": "waiting_parts",
  "description": "Panne moteur - Bruit anormal et vibrations excessives",
  "scheduled_date": "2026-02-01",
  "started_at": "2026-02-01T06:30:00Z",
  "assigned_to": "technicien.urgence@example.com",
  "downtime_hours": null,
  "checklist": [
    { "task": "Diagnostic panne", "completed": true },
    { "task": "Démontage moteur", "completed": true },
    { "task": "Remplacement moteur", "completed": false },
    { "task": "Tests et réglages", "completed": false }
  ],
  "notes": "Diagnostic: moteur HS, nécessite remplacement complet. Pièce commandée en urgence, livraison prévue 2026-02-02."
}
```

## Bonnes Pratiques

1. **Numérotation**
   - Format : MT-{année}-{séquence}
   - Séquence continue

2. **Maintenance Préventive**
   - Planifiez selon recommandations fabricant
   - Créez un calendrier annuel
   - Ne reportez pas les maintenances planifiées

3. **Checklist**
   - Définissez des checklists standards par équipement
   - Cochez au fur et à mesure
   - Documentez tout écart

4. **Documentation**
   - Notes détaillées sur interventions
   - Photos avant/après
   - Pièces remplacées enregistrées

5. **Pièces de Rechange**
   - Stock de sécurité pour pièces critiques
   - Identification des pièces d'usure
   - Fournisseurs rapides identifiés

6. **Suivi des Coûts**
   - Enregistrez tous les coûts (labour + pièces)
   - Analysez les dépenses par équipement
   - Identifiez équipements coûteux à maintenir

## Indicateurs

### Par Équipement
- **Coût total de maintenance** = Σ(total_cost)
- **Temps d'arrêt total** = Σ(downtime_hours)
- **MTBF** (Mean Time Between Failures) = Temps total / Nombre de pannes
- **MTTR** (Mean Time To Repair) = Σ(downtime_hours) / Nombre d'interventions

### Global
- **Coût de maintenance mensuel**
- **Répartition préventive/corrective**
- **Taux de disponibilité** = (Temps opérationnel / Temps total) × 100%
- **Interventions en retard** = Scheduled_date dépassée

## Planification Préventive

### Calendrier Type

```javascript
// Générer les maintenances préventives pour l'année
const equipment = Equipment.get("eq_four_01")

if (equipment.maintenance_frequency_days) {
  const year = 2026
  const maintenance_count = 365 / equipment.maintenance_frequency_days
  
  for (let i = 0; i < maintenance_count; i++) {
    const scheduled_date = new Date(year, 0, 1 + (i × equipment.maintenance_frequency_days))
    
    MaintenanceOrder.create({
      order_number: generateOrderNumber(),
      equipment_id: equipment.id,
      type: "preventive",
      priority: "normal",
      status: "scheduled",
      scheduled_date: scheduled_date,
      description: `Maintenance préventive ${i + 1}/${maintenance_count}`,
      checklist: equipment.default_maintenance_checklist
    })
  }
}
```

## Impact sur Production

### Disponibilité Équipement

```javascript
// Vérifier si équipement disponible pour production
function isEquipmentAvailable(equipment_id, date) {
  const maintenances = MaintenanceOrder.filter({
    equipment_id: equipment_id,
    scheduled_date: date,
    status: { $in: ['scheduled', 'in_progress', 'waiting_parts'] }
  })
  
  return maintenances.length === 0
}
```

### Planification de Production

```javascript
// Tenir compte des maintenances lors de planification
const production_plan = ProductionPlan.create({
  product_id: "prod_gateau",
  quantity: 100,
  planned_date: "2026-02-05"
})

// Vérifier disponibilité équipements requis
const required_equipment = ["eq_four_01", "eq_melangeur_01"]

for (const eq_id of required_equipment) {
  if (!isEquipmentAvailable(eq_id, production_plan.planned_date)) {
    alert(`Équipement ${eq_id} en maintenance le ${production_plan.planned_date}`)
  }
}
``