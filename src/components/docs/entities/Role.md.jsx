# Entité : Role (Rôle)

## Description

Définit un rôle personnalisé avec des permissions spécifiques par module. Permet de contrôler l'accès aux fonctionnalités de l'ERP.

## Champs

### Identification

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `name` | string | ✓ | Nom du rôle |
| `code` | string | ✓ | Code unique du rôle |
| `description` | string | | Description du rôle |

### Permissions

| Champ | Type | Description |
|-------|------|-------------|
| `permissions` | object | Objet contenant les permissions par module |

### Statut

| Champ | Type | Description |
|-------|------|-------------|
| `is_system_role` | boolean | Rôle système non modifiable (défaut: false) |
| `is_active` | boolean | Rôle actif (défaut: true) |

## Structure des Permissions

Les permissions sont organisées par module, chaque module ayant des actions spécifiques :

```json
{
  "permissions": {
    "module_name": {
      "view": boolean,
      "create": boolean,
      "edit": boolean,
      "delete": boolean,
      "action_speciale": boolean
    }
  }
}
```

## Modules et Actions Disponibles

### Dashboard
- `view` : Voir le tableau de bord

### Products (Produits)
- `view` : Voir les produits
- `create` : Créer des produits
- `edit` : Modifier les produits
- `delete` : Supprimer les produits

### Recipes (Recettes)
- `view` : Voir les recettes
- `create` : Créer des recettes
- `edit` : Modifier les recettes
- `delete` : Supprimer les recettes

### BOM (Nomenclatures)
- `view` : Voir les nomenclatures
- `create` : Créer des nomenclatures
- `edit` : Modifier les nomenclatures
- `delete` : Supprimer les nomenclatures

### Manufacturing Orders (Ordres de Fabrication)
- `view` : Voir les ordres
- `create` : Créer des ordres
- `edit` : Modifier les ordres
- `delete` : Supprimer les ordres
- `execute` : Lancer/exécuter la production

### Inventory (Inventaire)
- `view` : Voir les stocks
- `create` : Créer des entrées
- `edit` : Modifier les niveaux
- `delete` : Supprimer des entrées
- `adjust` : Ajuster les stocks

### Warehouses (Entrepôts)
- `view` : Voir les entrepôts
- `create` : Créer des entrepôts
- `edit` : Modifier les entrepôts
- `delete` : Supprimer les entrepôts

### Lots
- `view` : Voir les lots
- `create` : Créer des lots
- `edit` : Modifier les lots
- `delete` : Supprimer les lots
- `quarantine` : Mettre en quarantaine
- `release` : Libérer de la quarantaine

### Suppliers (Fournisseurs)
- `view` : Voir les fournisseurs
- `create` : Créer des fournisseurs
- `edit` : Modifier les fournisseurs
- `delete` : Supprimer les fournisseurs

### Purchase Orders (Bons de Commande)
- `view` : Voir les bons de commande
- `create` : Créer des bons
- `edit` : Modifier les bons
- `delete` : Supprimer les bons
- `approve` : Approuver les bons

### Goods Receipts (Réceptions)
- `view` : Voir les réceptions
- `create` : Créer des réceptions
- `edit` : Modifier les réceptions
- `delete` : Supprimer les réceptions

### Quality (Qualité)
- `view` : Voir les inspections
- `create` : Créer des inspections
- `edit` : Modifier les inspections
- `delete` : Supprimer les inspections
- `approve` : Approuver/valider les résultats

### Maintenance
- `view` : Voir les maintenances
- `create` : Créer des ordres de maintenance
- `edit` : Modifier les maintenances
- `delete` : Supprimer les maintenances

### Equipment (Équipements)
- `view` : Voir les équipements
- `create` : Créer des équipements
- `edit` : Modifier les équipements
- `delete` : Supprimer les équipements

### Settings (Paramètres)
- `view` : Voir les paramètres
- `edit` : Modifier les paramètres

### Users (Utilisateurs)
- `view` : Voir les utilisateurs
- `create` : Inviter des utilisateurs
- `edit` : Modifier les utilisateurs
- `delete` : Supprimer les utilisateurs

### Roles (Rôles)
- `view` : Voir les rôles
- `create` : Créer des rôles
- `edit` : Modifier les rôles
- `delete` : Supprimer les rôles

### Reports (Rapports)
- `view` : Voir les rapports
- `financial` : Voir les rapports financiers

## Contraintes

### Unicité
- `code` doit être unique

### Validation
- `name` non vide
- `code` non vide, format alphanumérique recommandé
- `permissions` : objet valide avec structure correcte

### Rôles Système
- Les rôles avec `is_system_role` = true ne peuvent pas être modifiés ou supprimés
- Exemples : "admin", "user"

## Exemples

### Responsable Production

```json
{
  "name": "Responsable Production",
  "code": "prod_manager",
  "description": "Gère la production et les ordres de fabrication",
  "is_system_role": false,
  "is_active": true,
  "permissions": {
    "dashboard": {
      "view": true
    },
    "products": {
      "view": true,
      "create": false,
      "edit": false,
      "delete": false
    },
    "recipes": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": false
    },
    "bom": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": false
    },
    "manufacturing_orders": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": false,
      "execute": true
    },
    "inventory": {
      "view": true,
      "create": false,
      "edit": false,
      "delete": false,
      "adjust": false
    },
    "quality": {
      "view": true,
      "create": true,
      "edit": false,
      "delete": false,
      "approve": false
    }
  }
}
```

### Gestionnaire Stocks

```json
{
  "name": "Gestionnaire Stocks",
  "code": "stock_manager",
  "description": "Gère l'inventaire et les entrepôts",
  "is_active": true,
  "permissions": {
    "dashboard": {
      "view": true
    },
    "inventory": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": true,
      "adjust": true
    },
    "warehouses": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": false
    },
    "lots": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": false,
      "quarantine": true,
      "release": true
    },
    "purchase_orders": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": false,
      "approve": false
    },
    "goods_receipts": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": false
    }
  }
}
```

### Responsable Qualité

```json
{
  "name": "Responsable Qualité",
  "code": "quality_manager",
  "description": "Gère le contrôle qualité et les inspections",
  "is_active": true,
  "permissions": {
    "dashboard": {
      "view": true
    },
    "quality": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": true,
      "approve": true
    },
    "lots": {
      "view": true,
      "create": false,
      "edit": false,
      "delete": false,
      "quarantine": true,
      "release": true
    },
    "inventory": {
      "view": true,
      "create": false,
      "edit": false,
      "delete": false,
      "adjust": false
    },
    "manufacturing_orders": {
      "view": true,
      "create": false,
      "edit": false,
      "delete": false,
      "execute": false
    }
  }
}
```

### Acheteur

```json
{
  "name": "Acheteur",
  "code": "buyer",
  "description": "Gère les achats et les fournisseurs",
  "is_active": true,
  "permissions": {
    "dashboard": {
      "view": true
    },
    "suppliers": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": false
    },
    "purchase_orders": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": false,
      "approve": false
    },
    "inventory": {
      "view": true,
      "create": false,
      "edit": false,
      "delete": false,
      "adjust": false
    }
  }
}
```

## Bonnes Pratiques

1. **Nommage**
   - Noms clairs et descriptifs
   - Codes en snake_case minuscule
   - Reflètent les responsabilités métier

2. **Principe du Moindre Privilège**
   - Donnez uniquement les permissions nécessaires
   - Évitez les permissions excessives
   - Revoyez régulièrement les accès

3. **Organisation**
   - Créez des rôles par fonction métier
   - Évitez les rôles trop génériques
   - Documentez les responsabilités

4. **Maintenance**
   - Revue trimestrielle des permissions
   - Ajustez selon évolution du métier
   - Désactivez les rôles obsolètes (is_active = false)

5. **Sécurité**
   - Séparez les responsabilités (separation of duties)
   - Limitez les accès aux données sensibles
   - Auditez les actions des utilisateurs

## Utilisation

### Assigner un Rôle à un Utilisateur

```javascript
// L'utilisateur hérite de toutes les permissions du rôle
User.update(user_id, {
  role_id: "role_prod_manager"
})
```

### Vérifier une Permission

```javascript
// Frontend
const user = await base44.auth.me()
const hasPermission = user.role.permissions.products?.view

if (hasPermission) {
  // Afficher la page produits
}

// Backend
const user = await base44.auth.me()
if (!user.role.permissions.products?.create) {
  return Response.json(
    { error: 'Unauthorized' }, 
    { status: 403 }
  )
}
```

## Rôles Système (Non Modifiables)

### Admin
- Toutes les permissions sur tous les modules
- `is_system_role` = true
- Code : "admin"

### User (Utilisateur Standard)
- Permissions minimales
- Lecture seule sur la plupart des modules
- `is_system_role` = true
- Code : "user"

## Hiérarchie de Permissions

```
Admin (toutes permissions)
  ├── Responsable Production (production complète)
  ├── Gestionnaire Stocks (inventaire complet)
  ├── Responsable Qualité (qualité complète)
  ├── Acheteur (achats complets)
  └── Opérateur (exécution uniquement)
```

## Impact sur l'Interface

### Menu et Navigation
- Les menus sont filtrés selon les permissions
- Les pages sans permission ne sont pas accessibles
- Redirection automatique si accès non autorisé

### Actions
- Boutons désactivés/cachés si pas de permission
- Messages d'erreur explicites
- Logs des tentatives d'accès refusées

## Audit et Traçabilité

Toutes les actions sont enregistrées avec :
- Utilisateur ayant effectué l'action
- Rôle de l'utilisateur au moment de l'action
- Permissions effectives
- Date et heure

## Indicateurs

- **Nombre de rôles actifs**
- **Utilisateurs par rôle**
- **Rôles les plus utilisés**
- **Permissions les plus demandées**
- **Tentatives d'accès refusées**