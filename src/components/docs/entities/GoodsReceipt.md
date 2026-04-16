# Entité : GoodsReceipt (Bon de Réception)

## Description

Représente la réception physique de marchandises suite à un bon de commande. Enregistre les quantités reçues et crée les lots de traçabilité.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `receipt_number` | string | ✓ | Numéro unique du bon de réception (ex: GR-2026-001) |
| `status` | enum | | Statut actuel de la réception |

### Référence Commande

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `purchase_order_id` | string | ✓ | ID du bon de commande |
| `purchase_order_number` | string | | Numéro du bon de commande (copie) |

### Fournisseur

| Champ | Type | Description |
|-------|------|-------------|
| `supplier_id` | string | ID du fournisseur |
| `supplier_name` | string | Nom du fournisseur |

### Entrepôt

| Champ | Type | Description |
|-------|------|-------------|
| `warehouse_id` | string | ID de l'entrepôt de réception |
| `warehouse_name` | string | Nom de l'entrepôt |

### Dates

| Champ | Type | Description |
|-------|------|-------------|
| `receipt_date` | datetime | Date et heure de réception |

### Responsable

| Champ | Type | Description |
|-------|------|-------------|
| `received_by` | string | Email de l'utilisateur ayant réceptionné |

### Lignes de Réception

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `lines` | array | ✓ | Liste des produits reçus |

**Structure d'une ligne :**
```json
{
  "product_id": "string",
  "product_name": "string",
  "ordered_quantity": "number",
  "received_quantity": "number",
  "accepted_quantity": "number",
  "rejected_quantity": "number",
  "lot_number": "string",
  "unit_cost": "number",
  "notes": "string"
}
```

### Qualité

| Champ | Type | Description |
|-------|------|-------------|
| `quality_inspection_id` | string | ID de l'inspection qualité effectuée |

### Notes

| Champ | Type | Description |
|-------|------|-------------|
| `notes` | string | Notes générales sur la réception |

## Statuts

### Workflow Standard

```
draft → confirmed → quality_check → accepted/rejected
```

| Statut | Description | Actions |
|--------|-------------|---------|
| `draft` | Brouillon, réception en cours | Modifier, Confirmer |
| `confirmed` | Réception confirmée | Créer inspection qualité |
| `quality_check` | En attente d'inspection qualité | Attente résultats |
| `accepted` | Réception acceptée et stockée | Consultation |
| `rejected` | Réception rejetée | Retour fournisseur |

## Contraintes

### Unicité
- `receipt_number` doit être unique

### Validation
- `purchase_order_id` doit référencer un bon de commande existant
- `lines` doit contenir au moins une ligne
- Pour chaque ligne :
  - `received_quantity` >= 0
  - `accepted_quantity` + `rejected_quantity` <= `received_quantity`
  - `received_quantity` <= `ordered_quantity` × 1.1 (tolérance 10%)

### Règles Métier

1. **Réception Partielle**
   - Autorisée si `received_quantity` < `ordered_quantity`
   - Le bon de commande reste en statut `partial`

2. **Réception Complète**
   - Quand toutes les lignes sont reçues
   - Le bon de commande passe en statut `received`

3. **Sur-Réception**
   - Si `received_quantity` > `ordered_quantity`
   - Alerte générée
   - Validation manuelle requise

## Automatisations

### Lors de la Création
- Génération automatique de `receipt_number`
- Copie des informations du bon de commande
- `receipt_date` = date actuelle
- `status` = `draft`

### Lors de la Confirmation (`draft` → `confirmed`)
1. Pour chaque ligne :
   - Création du lot (`ProductLot`)
   - Génération du numéro de lot
   - Mise à jour du stock (`StockLevel`)
2. Mise à jour du bon de commande :
   - `received_quantity` incrémenté
   - Statut → `partial` ou `received`

### Si Inspection Qualité Requise (`confirmed` → `quality_check`)
1. Création de `QualityInspection`
2. Lots mis en quarantaine
3. Attente résultats inspection

### Après Inspection

#### Si Acceptée (`quality_check` → `accepted`)
- Lots libérés (status → `available`)
- Stock disponible pour utilisation
- Notification : ✅ Réception validée

#### Si Rejetée (`quality_check` → `rejected`)
- Lots mis au rebut
- Non-conformité créée
- Procédure de retour fournisseur
- Notification : ❌ Réception rejetée

## Relations

### Le bon de réception :
- **Bon de commande** → `PurchaseOrder` (via `purchase_order_id`)
- **Fournisseur** → `Supplier` (via `supplier_id`)
- **Entrepôt** → `Warehouse` (via `warehouse_id`)
- **Crée** → `ProductLot` (un par ligne reçue)
- **Génère** → `QualityInspection` (si requise)
- **Met à jour** → `StockLevel` (augmente le stock)

## Exemples

### Réception Complète Simple

```json
{
  "receipt_number": "GR-2026-123",
  "status": "accepted",
  "purchase_order_id": "po_2026_042",
  "purchase_order_number": "PO-2026-042",
  "supplier_id": "sup_mdf",
  "supplier_name": "Meunerie de France",
  "warehouse_id": "wh_principal",
  "warehouse_name": "Entrepôt Principal",
  "receipt_date": "2026-01-31T14:30:00Z",
  "received_by": "magasinier@example.com",
  "lines": [
    {
      "product_id": "mat_farine",
      "product_name": "Farine T55",
      "ordered_quantity": 500,
      "received_quantity": 500,
      "accepted_quantity": 500,
      "rejected_quantity": 0,
      "lot_number": "FAR-T55-20260131-001",
      "unit_cost": 0.85,
      "notes": "Sacs de 25kg, état parfait"
    },
    {
      "product_id": "mat_sucre",
      "product_name": "Sucre cristallisé",
      "ordered_quantity": 200,
      "received_quantity": 200,
      "accepted_quantity": 200,
      "rejected_quantity": 0,
      "lot_number": "SUC-20260131-001",
      "unit_cost": 1.20
    }
  ],
  "notes": "Livraison conforme, à l'heure"
}
```

### Réception Partielle avec Rejet

```json
{
  "receipt_number": "GR-2026-124",
  "status": "quality_check",
  "purchase_order_id": "po_2026_043",
  "purchase_order_number": "PO-2026-043",
  "supplier_id": "sup_xyz",
  "supplier_name": "Fournisseur XYZ",
  "warehouse_id": "wh_principal",
  "receipt_date": "2026-01-31T15:45:00Z",
  "received_by": "receptionnaire@example.com",
  "lines": [
    {
      "product_id": "mat_cacao",
      "product_name": "Cacao en poudre",
      "ordered_quantity": 100,
      "received_quantity": 80,
      "accepted_quantity": 75,
      "rejected_quantity": 5,
      "lot_number": "CAC-20260131-001",
      "unit_cost": 12.00,
      "notes": "5kg rejetés : emballage endommagé. 20kg manquants : rupture fournisseur"
    }
  ],
  "quality_inspection_id": "qi_2026_200",
  "notes": "Réception partielle. Inspection qualité en cours sur lot accepté. Relancer commande pour 20kg manquants."
}
```

## Bonnes Pratiques

1. **Numérotation**
   - Format : GR-{année}-{séquence} (ex: GR-2026-123)
   - Séquence continue

2. **Vérification Physique**
   - Comptez toujours les quantités reçues
   - Vérifiez l'état des emballages
   - Contrôlez les étiquettes et dates

3. **Documentation**
   - Photographiez les défauts
   - Notez tous les écarts
   - Conservez les documents de transport

4. **Rapidité**
   - Réceptionnez dans les 24h
   - Créez les lots immédiatement
   - Lancez inspection qualité si requise

5. **Traçabilité**
   - Générez des numéros de lot uniques
   - Renseignez dates de fabrication/expiration
   - Liez à l'origine (fournisseur, bon de commande)

6. **Gestion des Écarts**
   - Documentez les écarts quantitatifs
   - Identifiez les produits défectueux
   - Informez rapidement le fournisseur

## Processus de Réception

### 1. Préparation
```
Bon de commande créé et confirmé
↓
Fournisseur expédie
↓
Notification d'expédition (tracking)
```

### 2. Arrivée Marchandise
```
Marchandise arrive à l'entrepôt
↓
Création du bon de réception (draft)
↓
Vérification bon de livraison
```

### 3. Contrôle Quantitatif
```
Déchargement
↓
Comptage des quantités
↓
Vérification vs bon de commande
↓
Enregistrement des quantités reçues
```

### 4. Contrôle Qualitatif
```
Inspection visuelle
↓
Vérification emballages
↓
Contrôle dates et étiquettes
↓
Enregistrement accepted/rejected
```

### 5. Mise en Stock
```
Confirmation du bon de réception
↓
Création des lots de traçabilité
↓
Mise à jour des stocks
↓
Stockage physique en entrepôt
```

### 6. Inspection Qualité (si requise)
```
Création inspection qualité
↓
Prélèvement échantillons
↓
Tests et contrôles
↓
Validation ou rejet
```

## Calculs Automatiques

### Taux de Réception
```javascript
taux_reception = (
  Σ(received_quantity) / Σ(ordered_quantity)
) × 100%
```

### Taux d'Acceptation
```javascript
taux_acceptation = (
  Σ(accepted_quantity) / Σ(received_quantity)
) × 100%
```

### Valeur de la Réception
```javascript
valeur_totale = Σ(accepted_quantity × unit_cost)
```

## Indicateurs

- **Délai moyen de réception** = receipt_date - purchase_order.order_date
- **Taux de conformité** = (réceptions acceptées / total réceptions) × 100%
- **Taux de réception partielle** = (réceptions partielles / total réceptions) × 100%
- **Valeur rejetée** = Σ(rejected_quantity × unit_cost)

## Gestion des Litiges

### Manquants (received < ordered)
1. Documenter l'écart
2. Contacter le fournisseur
3. Options :
   - Nouvelle livraison
   - Avoir sur facture
   - Annulation partielle

### Excédents (received > ordered)
1. Vérifier le bon de livraison
2. Contacter le fournisseur
3. Options :
   - Accepter et facturer
   - Retour de l'excédent

### Défauts Qualité (rejected > 0)
1. Créer non-conformité
2. Photos et documentation
3. Inspection qualité formelle
4. Procédure de retour
5. Demande d'avoir ou remplacement

## Impact sur Autres Modules

### Stock
- Augmentation immédiate du stock
- Création des lots
- Mise à jour valeurs (CUMP)

### Bon de Commande
- Mise à jour `received_quantity`
- Changement statut (partial/received)
- Possibilité de clôture

### Qualité
- Déclenchement inspection si requise
- Création non-conformité si rejet
- Suivi des défauts fournisseur

### Comptabilité
- Enregistrement de la réception
- Rapprochement facture fournisseur
- Calcul de la dette fournisseur