# Entité : Supplier (Fournisseur)

## Description

Représente un fournisseur de matières premières, produits ou services pour l'entreprise.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `name` | string | ✓ | Nom du fournisseur |
| `code` | string | ✓ | Code unique du fournisseur |
| `legal_name` | string | | Raison sociale complète |

### Contact

| Champ | Type | Description |
|-------|------|-------------|
| `email` | string | Email principal |
| `phone` | string | Téléphone |
| `website` | string | Site web |
| `contact_person` | string | Nom du contact principal |
| `contact_position` | string | Poste du contact |

### Adresse

| Champ | Type | Description |
|-------|------|-------------|
| `address` | string | Adresse complète |
| `city` | string | Ville |
| `postal_code` | string | Code postal |
| `country` | string | Pays |

### Informations Commerciales

| Champ | Type | Description |
|-------|------|-------------|
| `tax_id` | string | Numéro de TVA / SIRET |
| `payment_terms` | string | Conditions de paiement (ex: "Net 30 jours") |
| `currency` | string | Devise par défaut (ex: EUR, USD) |
| `credit_limit` | number | Limite de crédit autorisée |

### Classification

| Champ | Type | Description |
|-------|------|-------------|
| `category` | string | Catégorie de fournisseur |
| `rating` | enum | Évaluation : `excellent`, `good`, `average`, `poor` |
| `certification` | array | Certifications (ISO, Bio, etc.) |

### Délais

| Champ | Type | Description |
|-------|------|-------------|
| `lead_time_days` | number | Délai de livraison moyen en jours (défaut: 7) |
| `min_order_value` | number | Montant minimum de commande |

### Statut

| Champ | Type | Description |
|-------|------|-------------|
| `is_active` | boolean | Fournisseur actif (défaut: true) |
| `is_preferred` | boolean | Fournisseur préféré |

### Statistiques

| Champ | Type | Description |
|-------|------|-------------|
| `total_orders` | number | Nombre total de commandes |
| `total_value` | number | Valeur totale des achats |
| `on_time_delivery_rate` | number | Taux de livraison à temps (%) |
| `quality_score` | number | Score qualité moyen (0-100) |
| `last_order_date` | date | Date de la dernière commande |

### Notes

| Champ | Type | Description |
|-------|------|-------------|
| `notes` | string | Notes internes |
| `terms_conditions` | string | Conditions générales du fournisseur |

## Contraintes

### Unicité
- `code` doit être unique

### Validation
- `name` non vide
- `code` non vide, format alphanumérique recommandé
- `email` : format email valide si fourni
- `phone` : format téléphone si fourni
- `lead_time_days` >= 0
- `rating` : une des valeurs de l'enum
- `on_time_delivery_rate` : 0-100
- `quality_score` : 0-100

## Évaluation des Fournisseurs

### Rating (Évaluation Globale)

| Rating | Description | Critères |
|--------|-------------|----------|
| `excellent` | Excellent | Livraison >95%, Qualité >95%, Réactivité excellente |
| `good` | Bon | Livraison 85-95%, Qualité 85-95%, Bon service |
| `average` | Moyen | Livraison 70-85%, Qualité 70-85%, Service acceptable |
| `poor` | Médiocre | Livraison <70%, Qualité <70%, Problèmes fréquents |

### Calcul du Quality Score

```javascript
quality_score = (
  inspections_passed / total_inspections
) × 100
```

### Calcul du On-Time Delivery Rate

```javascript
on_time_delivery_rate = (
  commandes_livrées_à_temps / total_commandes_livrées
) × 100
```

## Relations

### Le fournisseur :
- **Produits** → `SupplierCatalog` (catalogue des produits proposés)
- **Commandes** → `PurchaseOrder` (bons de commande)
- **Réceptions** → `GoodsReceipt` (réceptions de marchandises)
- **Lots** → `ProductLot` (lots de matières achetées)
- **Inspections** → `QualityInspection` (contrôles qualité)

## Exemple

```json
{
  "name": "Meunerie de France",
  "code": "FOUN-MDF",
  "legal_name": "Meunerie de France SAS",
  "email": "commandes@meunerie-france.fr",
  "phone": "+33 1 23 45 67 89",
  "website": "https://www.meunerie-france.fr",
  "contact_person": "Marie Dupont",
  "contact_position": "Responsable Commerciale",
  "address": "15 Rue des Moulins",
  "city": "Paris",
  "postal_code": "75015",
  "country": "France",
  "tax_id": "FR12345678901",
  "payment_terms": "Net 30 jours",
  "currency": "EUR",
  "credit_limit": 50000,
  "category": "Matières Premières Alimentaires",
  "rating": "excellent",
  "certification": ["ISO 9001", "Agriculture Biologique", "IFS Food"],
  "lead_time_days": 3,
  "min_order_value": 500,
  "is_active": true,
  "is_preferred": true,
  "total_orders": 145,
  "total_value": 125000,
  "on_time_delivery_rate": 97.2,
  "quality_score": 98.5,
  "last_order_date": "2026-01-25",
  "notes": "Excellent fournisseur, très réactif. Livraisons toujours ponctuelles.",
  "terms_conditions": "Franco de port à partir de 1000€. Garantie de fraîcheur 365 jours."
}
```

## Bonnes Pratiques

1. **Code Fournisseur**
   - Format : FOUN-{Initiales} (ex: FOUN-MDF)
   - Consistant et lisible
   - Unique et mémorisable

2. **Évaluation Régulière**
   - Revue trimestrielle du rating
   - Mise à jour des scores qualité
   - Suivi des délais de livraison

3. **Communication**
   - Contact principal toujours à jour
   - Email de commande vérifié
   - Canaux de communication multiples

4. **Certifications**
   - Vérifiez la validité des certificats
   - Demandez les renouvellements
   - Archivez les documents

5. **Performance**
   - Suivez les KPIs (délai, qualité)
   - Feedback régulier au fournisseur
   - Actions correctives si nécessaire

6. **Risques**
   - Diversifiez les fournisseurs critiques
   - Identifiez les fournisseurs de secours
   - Évaluez la dépendance

## Catalogue Fournisseur

Chaque fournisseur peut avoir un catalogue de produits via `SupplierCatalog` :

```json
{
  "supplier_id": "sup_mdf",
  "product_id": "mat_farine_t55",
  "supplier_sku": "FAR-T55-25KG",
  "unit_price": 21.25,
  "currency": "EUR",
  "min_order_quantity": 20,
  "lead_time_days": 3,
  "is_preferred": true,
  "is_active": true
}
```

## Processus d'Achat

### 1. Sélection du Fournisseur

Critères de choix :
- Prix et conditions
- Délai de livraison
- Qualité historique (quality_score)
- Fiabilité (on_time_delivery_rate)
- Certifications requises
- Fournisseur préféré (is_preferred)

### 2. Création du Bon de Commande

```javascript
PurchaseOrder.create({
  supplier_id: supplier.id,
  supplier_name: supplier.name,
  payment_terms: supplier.payment_terms,
  currency: supplier.currency,
  expected_delivery_date: today + supplier.lead_time_days
})
```

### 3. Suivi de la Commande

- Confirmation fournisseur
- Suivi expédition
- Mise à jour expected_delivery_date si changement

### 4. Réception et Contrôle

- Création GoodsReceipt
- Inspection qualité (QualityInspection)
- Mise à jour des statistiques fournisseur

### 5. Évaluation Post-Livraison

```javascript
// Mise à jour automatique
supplier.total_orders += 1
supplier.total_value += purchase_order.total_amount
supplier.last_order_date = today

// Calcul livraison à temps
if (actual_delivery_date <= expected_delivery_date) {
  on_time_count += 1
}
supplier.on_time_delivery_rate = (on_time_count / total_orders) × 100

// Calcul qualité
if (quality_inspection.status === "passed") {
  quality_passed_count += 1
}
supplier.quality_score = (quality_passed_count / total_inspections) × 100
```

## Indicateurs

- **Nombre de fournisseurs actifs**
- **Fournisseurs préférés** = Count(is_preferred = true)
- **Délai moyen de livraison** = Moyenne(lead_time_days)
- **Taux de conformité global** = Moyenne(quality_score)
- **Concentration fournisseurs** = % du CA par fournisseur

## Risques Fournisseurs

### Indicateurs d'Alerte

⚠️ **Attention** si :
- `on_time_delivery_rate` < 80%
- `quality_score` < 70%
- `rating` = `poor`
- Aucune commande depuis > 6 mois (`last_order_date`)
- Certifications expirées

### Actions Préventives

- Diversification des sources
- Fournisseurs de secours identifiés
- Contrats de niveau de service (SLA)
- Audits fournisseurs réguliers
- Plans de continuité d'activité