# Entité : Company (Société / Entité Juridique)

## Description

Représente une société ou entité juridique. Un groupe peut posséder plusieurs sociétés (holdings, filiales). Utilisé pour la gestion comptable et juridique.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `name` | string | ✓ | Nom de la société |
| `legal_name` | string | | Raison sociale complète |
| `code` | string | ✓ | Code unique de la société |

### Informations Juridiques

| Champ | Type | Description |
|-------|------|-------------|
| `legal_form` | string | Forme juridique (SARL, SAS, SA, etc.) |
| `registration_number` | string | Numéro SIRET/SIREN |
| `tax_id` | string | Numéro de TVA intracommunautaire |
| `incorporation_date` | date | Date de création de la société |

### Siège Social

| Champ | Type | Description |
|-------|------|-------------|
| `headquarters_address` | string | Adresse du siège social |
| `city` | string | Ville |
| `postal_code` | string | Code postal |
| `country` | string | Pays |

### Contact

| Champ | Type | Description |
|-------|------|-------------|
| `phone` | string | Téléphone |
| `email` | string | Email principal |
| `website` | string | Site web |

### Direction

| Champ | Type | Description |
|-------|------|-------------|
| `ceo` | string | Nom du dirigeant |
| `ceo_email` | string | Email du dirigeant |

### Informations Financières

| Champ | Type | Description |
|-------|------|-------------|
| `capital` | number | Capital social |
| `currency` | string | Devise (EUR, USD, etc.) |
| `fiscal_year_end` | string | Fin d'exercice fiscal (MM-DD, ex: "12-31") |

### Comptabilité

| Champ | Type | Description |
|-------|------|-------------|
| `accounting_email` | string | Email comptabilité |
| `vat_regime` | string | Régime de TVA |

### Rattachement

| Champ | Type | Description |
|-------|------|-------------|
| `group_id` | string | ID du groupe parent |
| `parent_company_id` | string | ID de la société mère (si filiale) |

### Statut

| Champ | Type | Description |
|-------|------|-------------|
| `is_active` | boolean | Société active (défaut: true) |

### Informations

| Champ | Type | Description |
|-------|------|-------------|
| `description` | string | Description de la société |
| `logo_url` | string | URL du logo |

## Contraintes

### Unicité
- `code` doit être unique
- `registration_number` doit être unique (si fourni)

### Validation
- `name` non vide
- `code` non vide
- `email` : format email valide
- `capital` >= 0
- `fiscal_year_end` : format MM-DD

## Relations

### La société :
- **Groupe** → `Group` (via `group_id`)
- **Société mère** → `Company` (via `parent_company_id`)
- **Sites** → `Site` (via `company_id`)
- **Filiales** → `Company` (via parent_company_id = this.id)

## Exemples

### Société Principale

```json
{
  "name": "Pâtisserie Artisanale Durand",
  "legal_name": "Pâtisserie Artisanale Durand SAS",
  "code": "COMP-PAD",
  "legal_form": "SAS",
  "registration_number": "123 456 789 00012",
  "tax_id": "FR12345678901",
  "incorporation_date": "2020-03-15",
  "headquarters_address": "45 Boulevard de l'Industrie",
  "city": "Paris",
  "postal_code": "75015",
  "country": "France",
  "phone": "+33 1 23 45 67 89",
  "email": "contact@patisserie-durand.fr",
  "website": "https://www.patisserie-durand.fr",
  "ceo": "Jean Durand",
  "ceo_email": "j.durand@patisserie-durand.fr",
  "capital": 100000,
  "currency": "EUR",
  "fiscal_year_end": "12-31",
  "accounting_email": "compta@patisserie-durand.fr",
  "vat_regime": "Régime réel normal",
  "group_id": "grp_durand",
  "is_active": true,
  "logo_url": "https://storage.example.com/logos/pad.png",
  "description": "Pâtisserie artisanale depuis 2020, spécialisée dans les gâteaux au chocolat"
}
```

### Filiale

```json
{
  "name": "Durand Distribution",
  "legal_name": "Durand Distribution SARL",
  "code": "COMP-DD",
  "legal_form": "SARL",
  "registration_number": "987 654 321 00045",
  "tax_id": "FR98765432109",
  "group_id": "grp_durand",
  "parent_company_id": "comp_pad",
  "capital": 50000,
  "currency": "EUR",
  "is_active": true,
  "description": "Filiale dédiée à la distribution et la logistique"
}
```

## Bonnes Pratiques

1. **Structure Juridique**
   - Une société par entité juridique
   - Filiales liées via `parent_company_id`
   - Clarté pour comptabilité et fiscal

2. **Informations Complètes**
   - SIRET/TVA à jour
   - Contacts vérifiés
   - Certifications valides

3. **Multi-Sociétés**
   - Si groupe avec plusieurs sociétés
   - Comptabilité séparée par société
   - Consolidation au niveau groupe

## Indicateurs

- **Nombre de sociétés actives**
- **Capital social total** = Σ(capital)
- **Nombre de sites** par société
- **Chiffre d'affaires** par société (si suivi)