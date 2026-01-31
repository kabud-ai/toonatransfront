# Entité : Equipment (Équipement)

## Description

Représente un équipement de production (machine, outil, ligne de production) avec son historique de maintenance et ses indicateurs de performance.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `name` | string | ✓ | Nom de l'équipement |
| `code` | string | ✓ | Code unique de l'équipement |
| `serial_number` | string | | Numéro de série du fabricant |

### Classification

| Champ | Type | Description |
|-------|------|-------------|
| `type` | enum | Type : `machine`, `tool`, `line`, `vehicle`, `other` |
| `category` | string | Catégorie (ex: Four, Mélangeur, Convoyeur) |
| `model` | string | Modèle de l'équipement |
| `manufacturer` | string | Fabricant |

### Localisation

| Champ | Type | Description |
|-------|------|-------------|
| `site_id` | string | ID du site où se trouve l'équipement |
| `site_name` | string | Nom du site |
| `warehouse_id` | string | ID de l'entrepôt/zone |
| `location` | string | Localisation précise (ex: "Atelier A, Zone 2") |

### Statut

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `status` | enum | `operational`, `under_maintenance`, `broken`, `retired` | Statut actuel (défaut: `operational`) |

### Dates

| Champ | Type | Description |
|-------|------|-------------|
| `purchase_date` | date | Date d'achat |
| `installation_date` | date | Date de mise en service |
| `last_maintenance_date` | date | Date de dernière maintenance |
| `next_maintenance_date` | date | Date de prochaine maintenance prévue |

### Maintenance

| Champ | Type | Description |
|-------|------|-------------|
| `maintenance_frequency_days` | number | Fréquence de maintenance préventive (jours) |
| `maintenance_hours` | number | Total heures de maintenance cumulées |
| `default_maintenance_checklist` | array | Checklist type pour maintenance |

**Structure checklist :**
```json
[
  { "task": "string", "completed": false }
]
```

### Compteurs

| Champ | Type | Description |
|-------|------|-------------|
| `operating_hours` | number | Heures de fonctionnement cumulées |
| `production_count` | number | Nombre d'unités produites (si applicable) |

### Performances

| Champ | Type | Description |
|-------|------|-------------|
| `efficiency_rate` | number | Taux d'efficacité (%) |
| `availability_rate` | number | Taux de disponibilité (%) |
| `oee` | number | OEE - Overall Equipment Effectiveness (%) |

### Coûts

| Champ | Type | Description |
|-------|------|-------------|
| `purchase_cost` | number | Coût d'achat initial |
| `total_maintenance_cost` | number | Coût total de maintenance cumulé |

### Garantie

| Champ | Type | Description |
|-------|------|-------------|
| `warranty_expiry_date` | date | Date de fin de garantie |
| `service_contract` | string | Contrat de service/maintenance |

### Spécifications Techniques

| Champ | Type | Description |
|-------|------|-------------|
| `capacity` | number | Capacité de production |
| `capacity_unit` | string | Unité de la capacité (kg/h, unités/h, etc.) |
| `power_consumption` | number | Consommation électrique (kW) |
| `specifications` | object | Spécifications techniques détaillées (JSON) |

### Documentation

| Champ | Type | Description |
|-------|------|-------------|
| `manual_url` | string | URL du manuel d'utilisation |
| `image_url` | string | Photo de l'équipement |
| `notes` | string | Notes et observations |

### Statut Actif

| Champ | Type | Description |
|-------|------|-------------|
| `is_active` | boolean | Équipement en service (défaut: true) |

## Statuts

| Statut | Description | Production | Maintenance |
|--------|-------------|------------|-------------|
| `operational` | En service, fonctionne normalement | ✅ Disponible | Maintenance planifiée |
| `under_maintenance` | En maintenance | ❌ Indisponible | En cours |
| `broken` | En panne | ❌ Indisponible | Intervention urgente |
| `retired` | Retiré du service | ❌ Hors service | Aucune |

## Contraintes

### Unicité
- `code` doit être unique

### Validation
- `name` non vide
- `code` non vide
- `status` : une des valeurs de l'enum
- `type` : une des valeurs de l'enum
- `maintenance_frequency_days` > 0 si défini
- `efficiency_rate`, `availability_rate`, `oee` : 0-100
- `operating_hours` >= 0
- `next_maintenance_date` > `last_maintenance_date`

### Calculs Automatiques

```javascript
// OEE (Overall Equipment Effectiveness)
oee = availability_rate × efficiency_rate × quality_rate / 10000

// Disponibilité
availability_rate = (
  (operating_hours - downtime_hours) / operating_hours
) × 100

// Efficacité
efficiency_rate = (
  actual_production / theoretical_production
) × 100
```

## Relations

### L'équipement :
- **Site** → `Site` (via `site_id`)
- **Entrepôt/Zone** → `Warehouse` (via `warehouse_id`)
- **Maintenances** → `MaintenanceOrder` (historique des interventions)
- **Utilisé dans** → `ManufacturingOrder` (production)

## Exemples

### Four Industriel

```json
{
  "name": "Four Industriel Polyvalent #1",
  "code": "EQ-FOUR-01",
  "serial_number": "FI-2024-XK892",
  "type": "machine",
  "category": "Four",
  "model": "BakeMaster 3000",
  "manufacturer": "IndustrialBake Corp",
  "site_id": "site_paris",
  "site_name": "Site Paris",
  "warehouse_id": "wh_atelier_prod",
  "location": "Atelier Production, Zone 1",
  "status": "operational",
  "purchase_date": "2024-06-15",
  "installation_date": "2024-07-01",
  "last_maintenance_date": "2026-01-31",
  "next_maintenance_date": "2026-04-30",
  "maintenance_frequency_days": 90,
  "maintenance_hours": 48,
  "operating_hours": 5420,
  "capacity": 150,
  "capacity_unit": "gâteaux/h",
  "power_consumption": 45,
  "efficiency_rate": 87,
  "availability_rate": 92,
  "oee": 80,
  "purchase_cost": 125000,
  "total_maintenance_cost": 4800,
  "warranty_expiry_date": "2027-07-01",
  "default_maintenance_checklist": [
    { "task": "Nettoyage complet", "completed": false },
    { "task": "Vérification résistances", "completed": false },
    { "task": "Contrôle ventilation", "completed": false },
    { "task": "Graissage charnières", "completed": false },
    { "task": "Test température", "completed": false },
    { "task": "Calibration thermostats", "completed": false }
  ],
  "manual_url": "https://storage.example.com/manuals/bakemaster3000.pdf",
  "is_active": true,
  "notes": "Four principal de production. Performances excellentes."
}
```

### Mélangeur

```json
{
  "name": "Mélangeur Industriel #2",
  "code": "EQ-MIX-02",
  "serial_number": "MX-2025-AB445",
  "type": "machine",
  "category": "Mélangeur",
  "model": "MixPro 500L",
  "manufacturer": "MixTech Industries",
  "site_id": "site_paris",
  "location": "Atelier Préparation, Zone 3",
  "status": "under_maintenance",
  "installation_date": "2025-03-10",
  "last_maintenance_date": "2026-02-01",
  "next_maintenance_date": "2026-05-01",
  "maintenance_frequency_days": 60,
  "operating_hours": 1240,
  "capacity": 500,
  "capacity_unit": "L/batch",
  "power_consumption": 15,
  "efficiency_rate": 91,
  "availability_rate": 95,
  "purchase_cost": 35000,
  "is_active": true
}
```

### Ligne d'Assemblage

```json
{
  "name": "Ligne d'Assemblage Automatisée",
  "code": "EQ-LINE-01",
  "type": "line",
  "category": "Ligne de Production",
  "status": "operational",
  "capacity": 1200,
  "capacity_unit": "unités/h",
  "operating_hours": 8920,
  "production_count": 10680000,
  "efficiency_rate": 85,
  "availability_rate": 88,
  "oee": 75,
  "is_active": true
}
```

## Bonnes Pratiques

1. **Codes Équipements**
   - Format : EQ-{TYPE}-{NUM}
   - Exemples : EQ-FOUR-01, EQ-MIX-02
   - Cohérent et lisible

2. **Maintenance Préventive**
   - Respectez `maintenance_frequency_days`
   - Planifiez à l'avance
   - Utilisez les checklists standards

3. **Suivi des Compteurs**
   - Mettez à jour `operating_hours` régulièrement
   - Enregistrez `production_count`
   - Base pour maintenance prédictive

4. **Documentation**
   - Conservez les manuels accessibles
   - Photos et schémas
   - Historique des interventions

5. **Performances**
   - Calculez OEE mensuellement
   - Analysez les causes de baisse
   - Actions correctives

## Indicateurs Clés (KPI)

### OEE - Overall Equipment Effectiveness

```
OEE = Disponibilité × Efficacité × Qualité

Disponibilité = Temps de fonctionnement / Temps disponible
Efficacité = Production réelle / Production théorique
Qualité = Produits conformes / Production totale
```

Benchmark :
- **OEE > 85%** : Classe mondiale ⭐⭐⭐
- **OEE 60-85%** : Bon 👍
- **OEE < 60%** : À améliorer ⚠️

### MTBF - Mean Time Between Failures

```javascript
mtbf = operating_hours / nombre_de_pannes
```

### MTTR - Mean Time To Repair

```javascript
mttr = total_downtime_hours / nombre_interventions
```

## Maintenance Prédictive

### Surveillance des Indicateurs

```javascript
// Alertes basées sur les tendances
function checkPredictiveMaintenance(equipment) {
  const recent_orders = MaintenanceOrder.filter({
    equipment_id: equipment.id,
    type: 'corrective',
    created_date: { $gte: last_30_days }
  })
  
  if (recent_orders.length >= 3) {
    alert(`${equipment.name}: ${recent_orders.length} pannes en 30 jours. Maintenance prédictive recommandée.`)
  }
  
  if (equipment.efficiency_rate < 70) {
    alert(`${equipment.name}: Efficacité en baisse (${equipment.efficiency_rate}%). Investigation nécessaire.`)
  }
}
```

### Planification Automatique

```javascript
// Générer les maintenances préventives de l'année
function schedulePre ventiveMaintenance(equipment, year) {
  if (!equipment.maintenance_frequency_days) return
  
  const intervals = Math.floor(365 / equipment.maintenance_frequency_days)
  const maintenances = []
  
  for (let i = 0; i < intervals; i++) {
    const date = new Date(year, 0, 1 + (i × equipment.maintenance_frequency_days))
    
    maintenances.push({
      equipment_id: equipment.id,
      type: "preventive",
      scheduled_date: date,
      checklist: equipment.default_maintenance_checklist
    })
  }
  
  return maintenances
}
```

## Cycle de Vie

### 1. Acquisition
```
Achat de l'équipement
↓
Réception et installation
↓
Création fiche équipement
↓
Status = "operational"
```

### 2. Utilisation
```
Production normale
↓
Maintenance préventive régulière
↓
Mise à jour compteurs
```

### 3. Maintenance
```
Détection problème ou maintenance planifiée
↓
Création MaintenanceOrder
↓
Status → "under_maintenance"
↓
Intervention
↓
Status → "operational"
```

### 4. Panne
```
Défaillance détectée
↓
Status → "broken"
↓
Ordre de maintenance urgent
↓
Réparation
↓
Status → "operational"
```

### 5. Retrait
```
Équipement obsolète ou HS
↓
Status → "retired"
↓
is_active = false
↓
Archivage
```

## Indicateurs

- **Taux de disponibilité** = availability_rate
- **Coût de maintenance** = total_maintenance_cost
- **ROI** = (Production value - Total costs) / purchase_cost
- **Âge** = today - installation_date
- **Utilisation** = operating_hours / (âge en heures)