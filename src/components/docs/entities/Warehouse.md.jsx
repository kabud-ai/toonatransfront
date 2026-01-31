# Entité : Warehouse (Entrepôt)

## Description

Représente un entrepôt ou lieu de stockage physique où sont conservés les produits, matières premières et produits finis.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `name` | string | ✓ | Nom de l'entrepôt |
| `code` | string | ✓ | Code unique de l'entrepôt |

### Localisation

| Champ | Type | Description |
|-------|------|-------------|
| `address` | string | Adresse complète de l'entrepôt |
| `city` | string | Ville |
| `postal_code` | string | Code postal |
| `country` | string | Pays |
| `coordinates` | object | Coordonnées GPS (latitude, longitude) |

### Rattachement

| Champ | Type | Description |
|-------|------|-------------|
| `group_id` | string | ID du groupe/entreprise propriétaire |
| `site_id` | string | ID du site parent (usine, centre) |

### Classification

| Champ | Type | Description |
|-------|------|-------------|
| `type` | enum | Type d'entrepôt : `main`, `secondary`, `transit`, `quarantine` |
| `description` | string | Description de l'entrepôt |

### Caractéristiques

| Champ | Type | Description |
|-------|------|-------------|
| `capacity` | number | Capacité de stockage (unité au choix) |
| `capacity_unit` | string | Unité de la capacité (m³, palettes, etc.) |
| `temperature_controlled` | boolean | Température contrôlée |
| `temperature_min` | number | Température minimale (°C) |
| `temperature_max` | number | Température maximale (°C) |

### Contact

| Champ | Type | Description |
|-------|------|-------------|
| `manager` | string | Email du responsable d'entrepôt |
| `phone` | string | Téléphone |
| `email` | string | Email de contact |

### Horaires

| Champ | Type | Description |
|-------|------|-------------|
| `opening_hours` | string | Horaires d'ouverture |
| `working_days` | array | Jours ouvrés (lundi=1, dimanche=7) |

### Statut

| Champ | Type | Description |
|-------|------|-------------|
| `is_active` | boolean | Entrepôt actif (défaut: true) |
| `can_receive` | boolean | Peut recevoir des marchandises |
| `can_ship` | boolean | Peut expédier des marchandises |

### Statistiques

| Champ | Type | Description |
|-------|------|-------------|
| `current_stock_value` | number | Valeur totale du stock actuel |
| `utilization_rate` | number | Taux d'utilisation (%) |

## Types d'Entrepôts

| Type | Description | Utilisation |
|------|-------------|-------------|
| `main` | Entrepôt principal | Stock général, réceptions et expéditions |
| `secondary` | Entrepôt secondaire | Stock additionnel, overflow |
| `transit` | Entrepôt de transit | Stockage temporaire entre sites |
| `quarantine` | Zone de quarantaine | Produits en attente d'inspection/validation |

## Contraintes

### Unicité
- `code` doit être unique dans tout le système

### Validation
- `name` non vide
- `code` non vide, format alphanumérique recommandé
- `type` : une des valeurs de l'enum
- `capacity` >= 0 si spécifiée
- `temperature_min` < `temperature_max` si température contrôlée
- `utilization_rate` : 0-100

## Relations

### L'entrepôt contient :
- **Niveaux de stock** → `StockLevel` (un par produit)
- **Lots** → `ProductLot` (lots physiquement présents)
- **Reçoit** → `GoodsReceipt` (réceptions de marchandises)
- **Destination** → `ManufacturingOrder` (ordres de fabrication)
- **Mouvements** → `StockMovement` (entrées/sorties)

### L'entrepôt appartient à :
- **Site** → `Site` (via `site_id`)
- **Groupe** → `Group` (via `group_id`)

## Exemple

### Entrepôt Principal

```json
{
  "name": "Entrepôt Principal Paris",
  "code": "WH-PARIS-01",
  "address": "45 Boulevard de l'Industrie",
  "city": "Paris",
  "postal_code": "75015",
  "country": "France",
  "coordinates": {
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "group_id": "grp_001",
  "site_id": "site_paris",
  "type": "main",
  "description": "Entrepôt principal de stockage et distribution",
  "capacity": 5000,
  "capacity_unit": "m³",
  "temperature_controlled": true,
  "temperature_min": 15,
  "temperature_max": 25,
  "manager": "responsable.entrepot@example.com",
  "phone": "+33 1 23 45 67 89",
  "email": "entrepot.paris@example.com",
  "opening_hours": "Lundi-Vendredi: 8h-18h, Samedi: 8h-12h",
  "working_days": [1, 2, 3, 4, 5, 6],
  "is_active": true,
  "can_receive": true,
  "can_ship": true,
  "current_stock_value": 285000,
  "utilization_rate": 68
}
```

### Zone de Quarantaine

```json
{
  "name": "Zone Quarantaine",
  "code": "WH-QUAR-01",
  "address": "45 Boulevard de l'Industrie - Bâtiment B",
  "city": "Paris",
  "postal_code": "75015",
  "country": "France",
  "site_id": "site_paris",
  "type": "quarantine",
  "description": "Zone de stockage des produits en attente de validation qualité",
  "capacity": 200,
  "capacity_unit": "m³",
  "temperature_controlled": true,
  "temperature_min": 18,
  "temperature_max": 22,
  "is_active": true,
  "can_receive": true,
  "can_ship": false
}
```

## Bonnes Pratiques

1. **Codes Entrepôts**
   - Format : WH-{VILLE}-{NUM} (ex: WH-PARIS-01)
   - Ou : WH-{TYPE}-{NUM} pour types spéciaux
   - Consistant et lisible

2. **Organisation**
   - Entrepôt principal par site
   - Zones spécialisées (température, quarantaine)
   - Séparation physique claire

3. **Gestion de Capacité**
   - Surveillez `utilization_rate`
   - Alerte si > 85%
   - Planifiez extension ou redistribution

4. **Température**
   - Équipements de monitoring
   - Alertes automatiques hors plage
   - Logs de température continus

5. **Accès**
   - Définissez les horaires clairement
   - Gérez les permissions d'accès
   - Protocoles de sécurité

6. **Multi-Sites**
   - Identifiez l'entrepôt principal par site
   - Facilitez les transferts inter-entrepôts
   - Optimisez la répartition du stock

## Organisation Interne

### Zones de Stockage (optionnel)

Chaque entrepôt peut être divisé en zones :

```
Entrepôt Principal
├── Zone A : Matières Premières Sèches
├── Zone B : Matières Premières Réfrigérées
├── Zone C : Produits Finis
├── Zone D : Emballages
└── Zone Q : Quarantaine
```

### Emplacements (optionnel)

Codification des emplacements :

```
Format : {Zone}-{Allée}-{Niveau}-{Position}
Exemple : A-02-03-15
         (Zone A, Allée 2, Niveau 3, Position 15)
```

## Gestion Multi-Entrepôts

### Répartition du Stock

Un même produit peut être réparti sur plusieurs entrepôts :

```
Produit "Farine T55" :
├── WH-PARIS-01 : 1000 kg
├── WH-LYON-01 : 500 kg
└── WH-MARSEILLE-01 : 300 kg
Total : 1800 kg
```

### Stratégies de Répartition

1. **Par proximité client**
   - Stock proche des zones de livraison
   - Réduit les délais et coûts de transport

2. **Par volume de consommation**
   - Stock principal où la demande est forte
   - Stock secondaire pour sécurité

3. **Par type de produit**
   - Entrepôt spécialisé (réfrigéré, contrôlé)
   - Séparation matières/produits finis

### Transferts Inter-Entrepôts

```javascript
// Mouvement de transfert
{
  type: "transfer",
  product_id: "prod_farine",
  from_warehouse_id: "wh_paris",
  to_warehouse_id: "wh_lyon",
  quantity: 200,
  lot_number: "LOT-123"
}

Résultat :
- Stock WH-PARIS-01 : 1000 - 200 = 800 kg
- Stock WH-LYON-01 : 500 + 200 = 700 kg
```

## Indicateurs

### Par Entrepôt
- **Valeur du stock** = current_stock_value
- **Taux d'utilisation** = utilization_rate
- **Nombre de références** = Count(distinct product_id)
- **Rotation moyenne** = Sorties / Stock moyen

### Global
- **Nombre d'entrepôts actifs**
- **Capacité totale** = Σ(capacity)
- **Valeur totale du stock** = Σ(current_stock_value)
- **Répartition du stock** par type d'entrepôt

## Optimisation

### Taux d'Utilisation

```javascript
utilization_rate = (
  espace_utilisé / capacity
) × 100

// Alertes
if (utilization_rate > 85%) {
  alert("Capacité bientôt saturée")
} else if (utilization_rate < 30%) {
  alert("Sous-utilisation")
}
```

### Coûts de Stockage

```javascript
coût_stockage_mensuel = (
  current_stock_value × taux_possession_mensuel
) + frais_fixes_entrepôt
```

### ABC Analysis par Entrepôt

Classez les produits par valeur :
- **A** : Produits haute valeur → Zone sécurisée
- **B** : Valeur moyenne → Zone standard
- **C** : Faible valeur → Zone moins accessible

## Sécurité et Conformité

### Contrôles
- ✓ Accès restreint et contrôlé
- ✓ Surveillance vidéo si produits de valeur
- ✓ Détection incendie
- ✓ Contrôle de température (si requis)

### Inventaires
- ✓ Comptages cycliques réguliers
- ✓ Inventaire physique annuel
- ✓ Rapprochement théorique/réel
- ✓ Investigation des écarts

### Documentation
- ✓ Plans de l'entrepôt
- ✓ Procédures de stockage
- ✓ Protocoles d'urgence
- ✓ Registres d'accès