# Entité : QualityInspection (Inspection Qualité)

## Description

Représente une inspection qualité effectuée sur un produit, lot ou production. Permet de valider la conformité et gérer les non-conformités.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `inspection_number` | string | ✓ | Numéro unique d'inspection (ex: QI-2026-001) |
| `type` | enum | ✓ | Type d'inspection |
| `status` | enum | | Statut actuel (défaut: `pending`) |

### Types d'Inspection

| Type | Description | Moment |
|------|-------------|--------|
| `incoming` | Réception de matières | À l'arrivée fournisseur |
| `in_process` | En cours de production | Pendant fabrication |
| `final` | Produit fini | Avant stockage/expédition |
| `periodic` | Périodique | Contrôle régulier du stock |

### Référence

| Champ | Type | Description |
|-------|------|-------------|
| `reference_type` | enum | Type de référence : `manufacturing_order`, `purchase_order`, `stock` |
| `reference_id` | string | ID de la référence |

### Produit Inspecté

| Champ | Type | Description |
|-------|------|-------------|
| `product_id` | string | ID du produit |
| `product_name` | string | Nom du produit |
| `lot_number` | string | Numéro du lot inspecté |

### Quantités

| Champ | Type | Description |
|-------|------|-------------|
| `quantity_inspected` | number | Quantité inspectée |
| `quantity_passed` | number | Quantité conforme |
| `quantity_failed` | number | Quantité non conforme |

### Inspecteur et Dates

| Champ | Type | Description |
|-------|------|-------------|
| `inspector` | string | Email de l'inspecteur |
| `inspection_date` | datetime | Date et heure de l'inspection |

### Points de Contrôle

| Champ | Type | Description |
|-------|------|-------------|
| `checkpoints` | array | Liste des points de contrôle |

**Structure d'un checkpoint :**
```json
{
  "name": "string",              // Nom du critère
  "specification": "string",      // Spécification attendue
  "measured_value": "string",     // Valeur mesurée
  "passed": "boolean",            // Conforme ?
  "notes": "string"               // Observations
}
```

### Résultat Global

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `status` | enum | `pending`, `in_progress`, `passed`, `failed`, `conditional` | Résultat de l'inspection |

### Non-Conformité

| Champ | Type | Description |
|-------|------|-------------|
| `non_conformity_id` | string | ID de la fiche de non-conformité créée |
| `notes` | string | Notes et observations générales |

## Statuts

### Workflow Standard

```
pending → in_progress → passed/failed/conditional
```

| Statut | Description | Actions |
|--------|-------------|---------|
| `pending` | En attente de réalisation | Démarrer l'inspection |
| `in_progress` | Inspection en cours | Renseigner les checkpoints |
| `passed` | Inspection réussie | Libérer le lot automatiquement |
| `failed` | Inspection échouée | Quarantaine du lot, créer NC |
| `conditional` | Réussite conditionnelle | Validation manuelle requise |

## Contraintes

### Unicité
- `inspection_number` doit être unique

### Validation
- `type` : une des valeurs de l'enum
- `quantity_inspected` > 0
- `quantity_passed` + `quantity_failed` <= `quantity_inspected`
- `product_id` doit référencer un produit existant
- `lot_number` doit référencer un lot existant
- `checkpoints` : au moins un point de contrôle recommandé
- Chaque checkpoint :
  - `name` non vide
  - `specification` non vide
  - `passed` : boolean obligatoire

### Règles de Résultat

```javascript
if (tous les checkpoints.passed === true) {
  status = "passed"
} else if (au moins un checkpoint.passed === false) {
  status = "failed"
} else {
  status = "conditional"  // Cas particuliers
}
```

## Automatisations

### Lors de la Création
- Génération automatique de `inspection_number`
- `inspection_date` = date actuelle si non spécifiée
- `status` = `pending`

### Lors du Passage (`pending` → `in_progress`)
- Vérification que l'inspecteur est assigné
- Enregistrement de l'heure de début

### Lors de la Complétion

#### Si `status` = `passed`
1. Mise à jour du lot :
   - `quality_status` → `approved`
   - `status` → `available` (si était en quarantaine)
2. Notification : ✅ Lot libéré pour utilisation

#### Si `status` = `failed`
1. Mise à jour du lot :
   - `quality_status` → `rejected`
   - `status` → `quarantine`
2. Création automatique de non-conformité
3. Email envoyé : ❌ Inspection échouée (équipe qualité)
4. Blocage du lot (indisponible pour production)

#### Si `status` = `conditional`
1. Mise à jour du lot :
   - `quality_status` → `conditional`
2. Notification : ⚠️ Validation manuelle requise
3. Décision humaine nécessaire

## Relations

### L'inspection :
- **Produit** → `Product` (via `product_id`)
- **Lot** → `ProductLot` (via `lot_number`)
- **Référence** :
  - `ManufacturingOrder` (si type = final)
  - `PurchaseOrder` ou `GoodsReceipt` (si type = incoming)
- **Non-Conformité** → `NonConformity` (créée si échec)

## Exemples

### Inspection Réception Matière Première

```json
{
  "inspection_number": "QI-2026-156",
  "type": "incoming",
  "status": "passed",
  "reference_type": "purchase_order",
  "reference_id": "po_2026_042",
  "product_id": "mat_farine",
  "product_name": "Farine T55",
  "lot_number": "FAR-T55-20260131-001",
  "quantity_inspected": 1000,
  "quantity_passed": 1000,
  "quantity_failed": 0,
  "inspector": "qualite@example.com",
  "inspection_date": "2026-01-31T10:30:00Z",
  "checkpoints": [
    {
      "name": "Aspect visuel",
      "specification": "Poudre fine, blanche, sans grumeaux",
      "measured_value": "Conforme",
      "passed": true
    },
    {
      "name": "Humidité",
      "specification": "< 14%",
      "measured_value": "12.5%",
      "passed": true
    },
    {
      "name": "Emballage",
      "specification": "Sacs intacts, sans déchirure",
      "measured_value": "Conforme",
      "passed": true
    },
    {
      "name": "Étiquetage",
      "specification": "Date de production et lot visibles",
      "measured_value": "Conforme",
      "passed": true
    }
  ],
  "notes": "Livraison conforme, certificat bio fourni"
}
```

### Inspection Finale Produit - Échec

```json
{
  "inspection_number": "QI-2026-157",
  "type": "final",
  "status": "failed",
  "reference_type": "manufacturing_order",
  "reference_id": "mo_2026_042",
  "product_id": "prod_gateau_chocolat",
  "product_name": "Gâteau au Chocolat 500g",
  "lot_number": "GCH-500-20260201-003",
  "quantity_inspected": 100,
  "quantity_passed": 0,
  "quantity_failed": 100,
  "inspector": "controleur@example.com",
  "inspection_date": "2026-02-01T16:45:00Z",
  "checkpoints": [
    {
      "name": "Poids",
      "specification": "500g ± 10g",
      "measured_value": "485g",
      "passed": false,
      "notes": "Poids insuffisant, écart de 15g"
    },
    {
      "name": "Texture",
      "specification": "Moelleux, non sec",
      "measured_value": "Texture correcte",
      "passed": true
    },
    {
      "name": "Emballage",
      "specification": "Hermétique, sans défaut",
      "measured_value": "Conforme",
      "passed": true
    }
  ],
  "notes": "Lot rejeté pour poids insuffisant. Investigation nécessaire sur le dosage.",
  "non_conformity_id": "nc_2026_025"
}
```

### Inspection En Cours de Production

```json
{
  "inspection_number": "QI-2026-158",
  "type": "in_process",
  "status": "passed",
  "reference_type": "manufacturing_order",
  "reference_id": "mo_2026_043",
  "product_id": "semi_pate_gateau",
  "product_name": "Pâte à Gâteau (semi-fini)",
  "quantity_inspected": 50,
  "quantity_passed": 50,
  "quantity_failed": 0,
  "inspector": "chef@example.com",
  "inspection_date": "2026-02-01T11:15:00Z",
  "checkpoints": [
    {
      "name": "Consistance",
      "specification": "Pâte homogène, sans grumeaux",
      "measured_value": "Conforme",
      "passed": true
    },
    {
      "name": "Couleur",
      "specification": "Marron chocolat uniforme",
      "measured_value": "Conforme",
      "passed": true
    },
    {
      "name": "Température",
      "specification": "18-22°C",
      "measured_value": "20°C",
      "passed": true
    }
  ]
}
```

## Points de Contrôle Typiques

### Matières Premières (incoming)
- ✓ Aspect visuel
- ✓ Emballage intact
- ✓ Étiquetage conforme
- ✓ Date de péremption
- ✓ Certificats qualité (bio, origine, etc.)
- ✓ Paramètres physico-chimiques

### En Cours de Production (in_process)
- ✓ Température
- ✓ Consistance / Texture
- ✓ Couleur
- ✓ Dimensions
- ✓ Aspect visuel

### Produit Fini (final)
- ✓ Poids / Volume
- ✓ Dimensions
- ✓ Aspect visuel
- ✓ Emballage
- ✓ Étiquetage
- ✓ Tests fonctionnels (si applicable)
- ✓ Conformité aux spécifications

## Bonnes Pratiques

1. **Checkpoints Standardisés**
   - Définissez des listes de contrôle types
   - Réutilisez les checkpoints similaires
   - Documentez les spécifications précises

2. **Échantillonnage**
   - Inspection par échantillonnage pour grandes quantités
   - Inspection 100% pour lots critiques/petits
   - Plans d'échantillonnage selon normes (ISO 2859)

3. **Documentation**
   - Photos des défauts
   - Certificats d'analyse
   - Rapports de mesures
   - Stockage dans `traceability_data`

4. **Réactivité**
   - Inspection réception immédiate (< 24h)
   - Résultats communiqués rapidement
   - Blocage automatique si échec

5. **Formation**
   - Inspecteurs formés et qualifiés
   - Procédures d'inspection documentées
   - Calibration des équipements de mesure

6. **Suivi**
   - Analysez les tendances des échecs
   - Identifiez les causes récurrentes
   - Actions correctives sur les fournisseurs/processus

## Indicateurs

- **Taux de conformité** = (quantity_passed / quantity_inspected) × 100%
- **Taux d'échec par fournisseur** = (inspections failed / total inspections) × 100%
- **Délai moyen d'inspection** = Temps entre création et complétion
- **Nombre de NC générées** = Count(non_conformity_id IS NOT NULL)

## Notifications Email Automatiques

Le système envoie des emails pour :
- ❌ **Inspection échouée** → Équipe qualité + Responsable production
- ⚠️ **Inspection conditionnelle** → Responsable qualité (décision requise)
- ✅ **Inspection réussie** (optionnel) → Demandeur