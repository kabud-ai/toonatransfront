# Entité : Group (Groupe / Entreprise)

## Description

Représente un groupe ou une entreprise utilisant le système ERP. Permet la gestion multi-entreprises et le contrôle des abonnements.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `name` | string | ✓ | Nom du groupe/entreprise |
| `code` | string | ✓ | Code unique du groupe |

### Activité

| Champ | Type | Description |
|-------|------|-------------|
| `activity_sector` | string | Secteur d'activité (ex: Agroalimentaire, Électronique) |

### Abonnement

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `subscription_status` | enum | `active`, `inactive`, `trial`, `expired` | Statut de l'abonnement (défaut: `trial`) |
| `subscription_plan` | enum | `basic`, `standard`, `premium` | Plan d'abonnement (défaut: `basic`) |

### Limites

| Champ | Type | Description |
|-------|------|-------------|
| `max_users` | integer | Nombre maximum d'utilisateurs autorisés (défaut: 1) |

### Statut

| Champ | Type | Description |
|-------|------|-------------|
| `is_active` | boolean | Groupe actif (défaut: true) |

## Statuts d'Abonnement

| Statut | Description | Accès |
|--------|-------------|-------|
| `trial` | Période d'essai | Fonctionnalités limitées, durée limitée |
| `active` | Abonnement actif et payé | Accès complet selon le plan |
| `inactive` | Suspendu temporairement | Lecture seule |
| `expired` | Abonnement expiré | Accès bloqué |

## Plans d'Abonnement

### Basic
- ✓ 1-5 utilisateurs
- ✓ 1 site
- ✓ 2 entrepôts
- ✓ Fonctionnalités de base
- ✓ Support email

### Standard
- ✓ 6-20 utilisateurs
- ✓ 3 sites
- ✓ 10 entrepôts
- ✓ Toutes les fonctionnalités
- ✓ Support prioritaire
- ✓ Rapports avancés

### Premium
- ✓ Utilisateurs illimités
- ✓ Sites illimités
- ✓ Entrepôts illimités
- ✓ Toutes les fonctionnalités
- ✓ Support 24/7
- ✓ Rapports personnalisés
- ✓ API access
- ✓ Formation dédiée

## Contraintes

### Unicité
- `code` doit être unique

### Validation
- `name` non vide
- `code` non vide
- `subscription_status` : une des valeurs de l'enum
- `subscription_plan` : une des valeurs de l'enum
- `max_users` > 0

### Limites d'Utilisation

```javascript
// Vérification avant création d'utilisateur
const group = Group.get({ id: user.group_id })
const current_users_count = User.count({ group_id: group.id, is_active: true })

if (current_users_count >= group.max_users) {
  throw new Error(`Limite d'utilisateurs atteinte (${group.max_users}). Passez à un plan supérieur.`)
}
```

## Relations

### Le groupe possède :
- **Utilisateurs** → `User` (via group_id sur User)
- **Sites** → `Site` (via group_id)
- **Entrepôts** → `Warehouse` (via group_id)
- **Produits** → `Product` (via group_id)
- **Toutes données** de l'entreprise

## Exemple

```json
{
  "name": "Pâtisserie Artisanale Durand",
  "code": "PAT-DURAND",
  "activity_sector": "Agroalimentaire - Pâtisserie",
  "subscription_status": "active",
  "subscription_plan": "standard",
  "max_users": 15,
  "is_active": true
}
```

## Bonnes Pratiques

1. **Code Groupe**
   - Format simple et mémorable
   - Évitez caractères spéciaux
   - Préfixe optionnel par secteur

2. **Gestion des Limites**
   - Surveillez le nombre d'utilisateurs actifs
   - Alertez avant d'atteindre max_users
   - Proposez upgrade si nécessaire

3. **Statut d'Abonnement**
   - Vérifiez régulièrement l'expiration
   - Alertes à J-30, J-15, J-7
   - Bloquez accès si expired

4. **Multi-Groupes**
   - Isolation totale des données entre groupes
   - Un utilisateur ne peut appartenir qu'à un groupe
   - Pas de partage de données inter-groupes

## Isolation des Données

### Principe de Sécurité

Toutes les requêtes doivent filtrer par `group_id` :

```javascript
// Backend function
const user = await base44.auth.me()
const group_id = user.group_id

// CORRECT : Filtre par groupe
const products = await base44.entities.Product.filter({ group_id })

// INCORRECT : Récupère tous les produits de tous les groupes
const products = await base44.entities.Product.list()  // ❌ Fuite de données
```

### Création Automatique de group_id

```javascript
// Lors de création d'une entité
const user = await base44.auth.me()

const product = await base44.entities.Product.create({
  name: "Nouveau Produit",
  code: "PROD-001",
  group_id: user.group_id  // ← Toujours inclure
})
```

## Facturation et Abonnement

### Calcul du Coût Mensuel

```javascript
const pricing = {
  basic: 49,
  standard: 149,
  premium: 399
}

const cost_per_user = {
  basic: 10,
  standard: 15,
  premium: 20
}

function calculateMonthlyFee(group) {
  const base_fee = pricing[group.subscription_plan]
  const users_count = User.count({ group_id: group.id, is_active: true })
  const user_fee = users_count × cost_per_user[group.subscription_plan]
  
  return base_fee + user_fee
}
```

### Upgrade de Plan

```javascript
// Passage de Basic à Standard
Group.update(group_id, {
  subscription_plan: "standard",
  max_users: 20  // Augmentation de la limite
})
```

## Indicateurs

- **Nombre de groupes actifs**
- **Répartition par plan** : basic/standard/premium
- **Utilisateurs moyens par groupe**
- **Taux d'utilisation** = users_count / max_users
- **Revenus mensuels** = Σ(monthly_fee par groupe)

## Gestion Multi-Tenant

### Avantages

- **Isolation** : Données séparées par groupe
- **Personnalisation** : Configuration par entreprise
- **Scalabilité** : Ajout facile de nouveaux clients
- **Sécurité** : Pas de fuite de données inter-groupes

### Implémentation

Chaque entité métier doit avoir `group_id` :

```javascript
// Entités avec group_id
- Product
- Warehouse
- Site
- Recipe
- ManufacturingOrder
- PurchaseOrder
- etc.

// Entités sans group_id (partagées)
- User (appartient au groupe via relation)
- Role (peuvent être partagés ou spécifiques)
```

## Fonctionnalités Avancées

### White-Label (optionnel)

```json
{
  "name": "Pâtisserie Durand",
  "code": "PAT-DURAND",
  "branding": {
    "logo_url": "https://...",
    "primary_color": "#1e40af",
    "secondary_color": "#3b82f6",
    "domain": "erp.patisserie-durand.com"
  }
}
```

### Configuration Spécifique

```json
{
  "settings": {
    "default_language": "fr",
    "timezone": "Europe/Paris",
    "currency": "EUR",
    "date_format": "DD/MM/YYYY",
    "number_format": "1 234,56"
  }
}
``