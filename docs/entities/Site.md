# Entité : Site (Site de Production)

## Description

Représente un site physique (usine, entrepôt, centre de distribution) appartenant à l'entreprise. Un site peut contenir plusieurs entrepôts et équipements.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `name` | string | ✓ | Nom du site |
| `code` | string | ✓ | Code unique du site |

### Type

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `type` | enum | `factory`, `warehouse`, `distribution_center`, `office`, `retail` | Type de site |

### Localisation

| Champ | Type | Description |
|-------|------|-------------|
| `address` | string | Adresse complète |
| `city` | string | Ville |
| `postal_code` | string | Code postal |
| `country` | string | Pays |
| `region` | string | Région/État |
| `coordinates` | object | Coordonnées GPS {latitude, longitude} |

### Rattachement

| Champ | Type | Description |
|-------|------|-------------|
| `group_id` | string | ID du groupe/entreprise propriétaire |
| `company_id` | string | ID de la société juridique |

### Contact

| Champ | Type | Description |
|-------|------|-------------|
| `manager` | string | Email du responsable du site |
| `phone` | string | Téléphone principal |
| `email` | string | Email de contact |

### Caractéristiques

| Champ | Type | Description |
|-------|------|-------------|
| `surface_area` | number | Surface totale (m²) |
| `employee_count` | number | Nombre d'employés |
| `operating_hours` | string | Horaires de fonctionnement |

### Capacités

| Champ | Type | Description |
|-------|------|-------------|
| `production_capacity` | number | Capacité de production |
| `storage_capacity` | number | Capacité de stockage |
| `capacity_unit` | string | Unité de mesure |

### Statut

| Champ | Type | Description |
|-------|------|-------------|
| `is_active` | boolean | Site en activité (défaut: true) |
| `is_primary` | boolean | Site principal de l'entreprise |

### Certifications

| Champ | Type | Description |
|-------|------|-------------|
| `certifications` | array | Liste des certifications (ISO, HACCP, etc.) |

### Informations

| Champ | Type | Description |
|-------|------|-------------|
| `description` | string | Description du site |
| `notes` | string | Notes additionnelles |

## Types de Sites

| Type | Description | Caractéristiques |
|------|-------------|------------------|
| `factory` | Usine de production | Équipements lourds, production |
| `warehouse` | Entrepôt de stockage | Stockage uniquement |
| `distribution_center` | Centre de distribution | Réception + Expédition |
| `office` | Bureau administratif | Gestion, administration |
| `retail` | Point de vente | Vente directe |

## Contraintes

### Unicité
- `code` doit être unique

### Validation
- `name` non vide
- `code` non vide
- `type` : une des valeurs de l'enum
- Un seul site avec `is_primary` = true par groupe recommandé

## Relations

### Le site contient :
- **Entrepôts** → `Warehouse` (via `site_id`)
- **Équipements** → `Equipment` (via `site_id`)
- **Employés** → `User` (affectés au site)

### Le site appartient à :
- **Groupe** → `Group` (via `group_id`)
- **Société** → `Company` (via `company_id`)

## Exemples

### Usine de Production

```json
{
  "name": "Usine Paris - Production Principale",
  "code": "SITE-PARIS-PROD",
  "type": "factory",
  "address": "45 Boulevard de l'Industrie",
  "city": "Paris",
  "postal_code": "75015",
  "country": "France",
  "region": "Île-de-France",
  "coordinates": {
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "group_id": "grp_001",
  "manager": "directeur.usine@example.com",
  "phone": "+33 1 23 45 67 89",
  "email": "usine.paris@example.com",
  "surface_area": 5000,
  "employee_count": 85,
  "operating_hours": "Lundi-Vendredi: 6h-22h, Samedi: 6h-14h",
  "production_capacity": 10000,
  "capacity_unit": "unités/jour",
  "is_active": true,
  "is_primary": true,
  "certifications": [
    "ISO 9001:2015",
    "ISO 14001",
    "HACCP",
    "Agriculture Biologique"
  ],
  "description": "Site principal de production avec 3 lignes de fabrication automatisées"
}
```

### Centre de Distribution

```json
{
  "name": "Centre Distribution Lyon",
  "code": "SITE-LYON-DISTRIB",
  "type": "distribution_center",
  "address": "12 Rue de la Logistique",
  "city": "Lyon",
  "postal_code": "69000",
  "country": "France",
  "region": "Auvergne-Rhône-Alpes",
  "group_id": "grp_001",
  "manager": "responsable.lyon@example.com",
  "surface_area": 3000,
  "storage_capacity": 2000,
  "capacity_unit": "palettes",
  "is_active": true,
  "is_primary": false,
  "description": "Centre de distribution régional pour le sud-est"
}
```

## Bonnes Pratiques

1. **Codes Sites**
   - Format : SITE-{VILLE}-{TYPE}
   - Exemples : SITE-PARIS-PROD, SITE-LYON-DISTRIB
   - Géographiquement explicite

2. **Organisation Multi-Sites**
   - Définissez clairement le site principal
   - Répartissez les activités logiquement
   - Optimisez les flux entre sites

3. **Données à Jour**
   - Maintenez les contacts actualisés
   - Mettez à jour employee_count
   - Revoyez les capacités annuellement

4. **Certifications**
   - Vérifiez les dates d'expiration
   - Planifiez les renouvellements
   - Affichez les certifications

5. **Localisation**
   - Coordonnées GPS précises
   - Facilite intégration avec cartes
   - Utile pour planification logistique

## Indicateurs

- **Nombre de sites actifs**
- **Répartition géographique**
- **Capacité totale** = Σ(production_capacity)
- **Effectif total** = Σ(employee_count)
- **Surface totale** = Σ(surface_area)

## Gestion Multi-Sites

### Sélecteur de Site

Dans l'interface, l'utilisateur peut changer de site actif pour filtrer les données :

```javascript
// Toutes les données sont filtrées par site
const current_site = localStorage.getItem('selected_site')

const products = Product.filter({ site_id: current_site })
const warehouses = Warehouse.filter({ site_id: current_site })
const equipment = Equipment.filter({ site_id: current_site })
```

### Transferts Inter-Sites

```javascript
// Transférer du stock entre sites
const transfer = {
  product_id: "prod_gateau",
  from_warehouse_id: "wh_paris",  // Site Paris
  to_warehouse_id: "wh_lyon",     // Site Lyon
  quantity: 500,
  type: "transfer"
}
```

### Consolidation

```javascript
// Vue consolidée tous sites
const total_stock_all_sites = StockLevel
  .list()
  .groupBy('product_id')
  .map(group => ({
    product_name: group[0].product_name,
    total_quantity: group.reduce((sum, sl) => sum + sl.quantity, 0),
    by_site: group.map(sl => ({
      site: sl.warehouse.site_name,
      quantity: sl.quantity
    }))
  }))
``