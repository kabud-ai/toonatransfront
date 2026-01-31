# Entité : ManufacturingOrder (Ordre de Fabrication)

## Description

Représente un ordre de fabrication pour produire une quantité de produits finis ou semi-finis.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `order_number` | string | ✓ | Numéro unique de l'ordre (ex: MO-2026-001) |
| `status` | enum | | Statut actuel de l'ordre |

### Produit à Fabriquer

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `product_id` | string | ✓ | ID du produit à fabriquer |
| `product_name` | string | | Nom du produit (copie pour référence) |
| `quantity` | number | ✓ | Quantité à produire |
| `produced_quantity` | number | | Quantité réellement produite |

### Recette et Configuration

| Champ | Type | Description |
|-------|------|-------------|
| `recipe_id` | string | ID de la recette utilisée |
| `recipe_title` | string | Titre de la recette (copie) |
| `bom_id` | string | ID de la nomenclature (BOM) |

### Entrepôt et Localisation

| Champ | Type | Description |
|-------|------|-------------|
| `warehouse_id` | string | ID de l'entrepôt de destination |
| `warehouse_name` | string | Nom de l'entrepôt |

### Planification

| Champ | Type | Description |
|-------|------|-------------|
| `planned_start_date` | date | Date prévue de début |
| `planned_end_date` | date | Date prévue de fin |
| `actual_start_date` | datetime | Date réelle de démarrage |
| `actual_end_date` | datetime | Date réelle de fin |
| `priority` | enum | Priorité : `low`, `normal`, `high`, `urgent` |

### Lot Produit

| Champ | Type | Description |
|-------|------|-------------|
| `lot_number` | string | Numéro de lot généré pour le produit fini |
| `expiry_date` | date | Date d'expiration du lot produit |

### Coûts et Ressources

| Champ | Type | Description |
|-------|------|-------------|
| `estimated_cost` | number | Coût estimé de production |
| `actual_cost` | number | Coût réel de production |
| `labor_hours` | number | Heures de main d'œuvre |

### Utilisateurs

| Champ | Type | Description |
|-------|------|-------------|
| `assigned_to` | string | Email de l'opérateur assigné |
| `supervisor` | string | Email du superviseur |

### Informations Additionnelles

| Champ | Type | Description |
|-------|------|-------------|
| `notes` | string | Notes et observations |
| `quality_inspection_id` | string | ID de l'inspection qualité |

## Statuts

### Workflow Standard

```
draft → planned → in_progress → completed
           ↓
        cancelled
```

| Statut | Description | Actions Possibles |
|--------|-------------|-------------------|
| `draft` | Brouillon, en préparation | Modifier, Valider, Supprimer |
| `planned` | Validé, en attente de démarrage | Démarrer, Modifier, Annuler |
| `in_progress` | Production en cours | Terminer, Pause, Annuler |
| `completed` | Production terminée avec succès | Consulter uniquement |
| `cancelled` | Ordre annulé | Consulter uniquement |
| `on_hold` | En pause temporaire | Reprendre, Annuler |

## Contraintes

### Unicité
- `order_number` doit être unique

### Validation
- `quantity` > 0
- `product_id` doit référencer un produit existant
- `recipe_id` doit référencer une recette active (si spécifié)
- `warehouse_id` doit référencer un entrepôt existant
- `planned_end_date` >= `planned_start_date`
- `produced_quantity` ne peut pas dépasser significativement `quantity`

### Transitions de Statut

| De | Vers | Condition |
|----|------|-----------|
| draft | planned | Validation complète |
| planned | in_progress | Vérification disponibilité matières |
| in_progress | completed | Renseignement quantité produite |
| planned | cancelled | Autorisation |
| in_progress | cancelled | Autorisation + gestion stock |

## Automatisations

### Au Démarrage (`draft` → `planned`)
- Génération automatique de `order_number` si non fourni
- Vérification disponibilité des matières premières
- Réservation des composants nécessaires

### Au Lancement (`planned` → `in_progress`)
- `actual_start_date` = maintenant
- Consommation des matières premières (mouvements de stock)
- Mise à jour des quantités réservées

### À la Complétion (`in_progress` → `completed`)
- `actual_end_date` = maintenant
- Création du lot de produit fini
- Ajout au stock de l'entrepôt de destination
- Calcul du `actual_cost`
- Libération des équipements

### À l'Annulation
- Libération des matières réservées
- Ajout de notes obligatoires

## Relations

### L'ordre de fabrication :
- **Produit** → `Product` (via `product_id`)
- **Utilise** → `Recipe` (via `recipe_id`)
- **Consomme** → `ProductLot` (matières premières)
- **Crée** → `ProductLot` (produit fini)
- **Destination** → `Warehouse` (via `warehouse_id`)
- **Inspecté** → `QualityInspection` (via `quality_inspection_id`)

## Exemple

```json
{
  "order_number": "MO-2026-001",
  "status": "planned",
  "product_id": "prod_123",
  "product_name": "Gâteau au Chocolat 500g",
  "quantity": 100,
  "recipe_id": "rec_456",
  "recipe_title": "Recette Gâteau Chocolat v2.0",
  "warehouse_id": "wh_789",
  "warehouse_name": "Entrepôt Principal",
  "planned_start_date": "2026-02-01",
  "planned_end_date": "2026-02-01",
  "priority": "normal",
  "assigned_to": "operateur@example.com",
  "estimated_cost": 850.00,
  "notes": "Production pour commande client #C-500"
}
```

## Bonnes Pratiques

1. **Planification**
   - Vérifiez toujours le stock avant de valider
   - Tenez compte des délais de livraison fournisseurs
   - Planifiez avec une marge de sécurité

2. **Exécution**
   - Démarrez à l'heure prévue
   - Renseignez la quantité produite immédiatement
   - Documentez tout écart ou problème

3. **Numérotation**
   - Format : MO-{année}-{séquence} (ex: MO-2026-001)
   - Séquence continue par année

4. **Traçabilité**
   - Générez toujours un numéro de lot unique
   - Renseignez la date d'expiration
   - Associez une inspection qualité si nécessaire

## Calculs Automatiques

### Coût Estimé
```
estimated_cost = Σ(composant.quantité × composant.coût_unitaire) 
                 + (heures_travail × coût_horaire_main_oeuvre)
```

### Numéro de Lot
```
Format : {code_produit}-{date_production}-{séquence}
Exemple : GCH-500-20260201-001
```

## Indicateurs

- **Taux de réalisation** = produced_quantity / quantity
- **Écart de coût** = actual_cost - estimated_cost
- **Délai de production** = actual_end_date - actual_start_date
- **Retard** = actual_end_date - planned_end_date