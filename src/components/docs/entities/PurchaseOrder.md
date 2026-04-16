# Entité : PurchaseOrder (Bon de Commande)

## Description

Représente un bon de commande pour l'achat de matières premières ou produits auprès d'un fournisseur.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `order_number` | string | ✓ | Numéro unique du bon de commande (ex: PO-2026-001) |
| `status` | enum | | Statut actuel du bon |

### Fournisseur

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `supplier_id` | string | ✓ | ID du fournisseur |
| `supplier_name` | string | | Nom du fournisseur (copie) |
| `supplier_reference` | string | | Référence fournisseur du bon |

### Dates

| Champ | Type | Description |
|-------|------|-------------|
| `order_date` | date | Date de création du bon |
| `expected_delivery_date` | date | Date de livraison prévue |
| `actual_delivery_date` | date | Date de livraison réelle |

### Destination

| Champ | Type | Description |
|-------|------|-------------|
| `delivery_warehouse_id` | string | ID de l'entrepôt de livraison |
| `delivery_warehouse_name` | string | Nom de l'entrepôt |
| `delivery_address` | string | Adresse de livraison complète |

### Lignes de Commande

| Champ | Type | Description |
|-------|------|-------------|
| `lines` | array | Liste des produits commandés |

**Structure d'une ligne :**
```json
{
  "product_id": "string",
  "product_name": "string",
  "quantity": "number",
  "unit_price": "number",
  "total_price": "number",
  "tax_rate": "number",
  "received_quantity": "number",
  "notes": "string"
}
```

### Montants

| Champ | Type | Description |
|-------|------|-------------|
| `subtotal` | number | Total HT |
| `tax_amount` | number | Montant de la TVA |
| `total_amount` | number | Total TTC |
| `currency` | string | Devise (défaut: USD ou EUR) |

### Approbation

| Champ | Type | Description |
|-------|------|-------------|
| `requires_approval` | boolean | Nécessite une approbation |
| `approved_by` | string | Email de l'approbateur |
| `approved_at` | datetime | Date d'approbation |
| `rejection_reason` | string | Motif de rejet |

### Paiement

| Champ | Type | Description |
|-------|------|-------------|
| `payment_terms` | string | Conditions de paiement (ex: "Net 30 jours") |
| `payment_status` | enum | Statut du paiement : `pending`, `partial`, `paid` |
| `paid_amount` | number | Montant payé |

### Informations Additionnelles

| Champ | Type | Description |
|-------|------|-------------|
| `created_by` | string | Email du créateur (automatique) |
| `notes` | string | Notes et commentaires |
| `internal_notes` | string | Notes internes (non visibles fournisseur) |

## Statuts

### Workflow Standard

```
draft → pending_approval → approved → confirmed → received → closed
          ↓                              ↓
       rejected                     cancelled
```

| Statut | Description | Actions |
|--------|-------------|---------|
| `draft` | Brouillon, en préparation | Modifier, Valider, Supprimer |
| `pending_approval` | En attente d'approbation | Approuver, Rejeter |
| `approved` | Approuvé, prêt à envoyer | Confirmer, Modifier, Annuler |
| `confirmed` | Confirmé avec le fournisseur | Réceptionner, Annuler |
| `partial` | Réception partielle | Réceptionner complément |
| `received` | Totalement réceptionné | Clôturer |
| `closed` | Clôturé | Consulter uniquement |
| `rejected` | Rejeté par approbateur | Modifier et resoumettre |
| `cancelled` | Annulé | Consulter uniquement |

## Contraintes

### Unicité
- `order_number` doit être unique

### Validation
- `supplier_id` doit référencer un fournisseur actif
- `lines` doit contenir au moins une ligne
- Pour chaque ligne :
  - `quantity` > 0
  - `unit_price` >= 0
  - `total_price` = `quantity` × `unit_price`
- `subtotal` = Σ(ligne.total_price)
- `total_amount` = `subtotal` + `tax_amount`
- `expected_delivery_date` >= `order_date`

### Approbation Automatique

Le système détermine si une approbation est requise selon :
- Montant > seuil configuré (ex: 5000€)
- Type de produit (produits stratégiques)
- Fournisseur nouveau ou non fiable

## Automatisations

### Lors de la Création
- Génération automatique de `order_number`
- `order_date` = date actuelle
- Calcul automatique de `subtotal`, `tax_amount`, `total_amount`
- Détermination de `requires_approval`

### Workflow d'Approbation
Si `requires_approval` = true :
1. Email envoyé aux approbateurs désignés
2. Statut = `pending_approval`
3. Attente action (approuver/rejeter)

### Après Approbation
- Notification au créateur
- Statut → `approved`
- Possibilité d'envoyer au fournisseur

### Lors de la Réception
- Création d'un `GoodsReceipt`
- Mise à jour de `received_quantity` par ligne
- Si toutes les lignes reçues → statut `received`
- Sinon → statut `partial`

## Relations

### Le bon de commande :
- **Fournisseur** → `Supplier` (via `supplier_id`)
- **Produits** → `Product` (via `lines[].product_id`)
- **Entrepôt** → `Warehouse` (via `delivery_warehouse_id`)
- **Génère** → `GoodsReceipt` (réceptions)
- **Crée** → `ProductLot` (lors de réception)
- **Peut déclencher** → `ReplenishmentSuggestion`

## Exemples

### Bon de Commande Simple

```json
{
  "order_number": "PO-2026-042",
  "status": "approved",
  "supplier_id": "sup_123",
  "supplier_name": "Fournisseur ABC",
  "order_date": "2026-01-31",
  "expected_delivery_date": "2026-02-07",
  "delivery_warehouse_id": "wh_main",
  "lines": [
    {
      "product_id": "prod_farine",
      "product_name": "Farine T55",
      "quantity": 500,
      "unit_price": 0.85,
      "total_price": 425.00,
      "tax_rate": 0.20,
      "notes": "Sacs de 25kg"
    },
    {
      "product_id": "prod_sucre",
      "product_name": "Sucre cristallisé",
      "quantity": 200,
      "unit_price": 1.20,
      "total_price": 240.00,
      "tax_rate": 0.20
    }
  ],
  "subtotal": 665.00,
  "tax_amount": 133.00,
  "total_amount": 798.00,
  "currency": "EUR",
  "payment_terms": "Net 30 jours",
  "notes": "Livraison entre 8h et 12h"
}
```

## Bonnes Pratiques

1. **Numérotation**
   - Format : PO-{année}-{séquence} (ex: PO-2026-042)
   - Séquence continue par année

2. **Approbation**
   - Définissez des seuils clairs
   - Désignez des approbateurs de secours
   - Respectez les délais d'approbation

3. **Communication Fournisseur**
   - Confirmez toujours par email ou EDI
   - Conservez les accusés de réception
   - Suivez les dates de livraison prévues

4. **Réception**
   - Vérifiez quantités et qualité
   - Créez les lots immédiatement
   - Documentez les écarts

5. **Suivi**
   - Relancez les fournisseurs si retard
   - Mettez à jour `actual_delivery_date`
   - Clôturez les bons complétés

## Indicateurs

- **Taux de réception** = Σ(received_quantity) / Σ(quantity) × 100%
- **Délai moyen de livraison** = Moyenne(actual_delivery_date - order_date)
- **Taux de respect des délais** = (bons livrés à temps / total bons) × 100%
- **Valeur moyenne des bons** = Moyenne(total_amount)

## Notifications Email Automatiques

Le système envoie automatiquement des emails pour :
- ✅ Nouveau bon nécessitant approbation → Approbateurs
- ✅ Bon approuvé → Créateur
- ✅ Bon rejeté → Créateur (avec motif)
- ⏰ Rappel livraison imminente → Gestionnaire stocks
- ⚠️ Retard de livraison → Acheteur et gestionnaire