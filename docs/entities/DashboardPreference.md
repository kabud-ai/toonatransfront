# Entité : DashboardPreference (Préférences Tableau de Bord)

## Description

Stocke les préférences personnalisées d'un utilisateur pour son tableau de bord : widgets activés, disposition, taille et ordre d'affichage.

## Champs

### Utilisateur

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `user_email` | string | ✓ | Email de l'utilisateur (identifiant unique) |

### Widgets

| Champ | Type | Description |
|-------|------|-------------|
| `widgets` | array | Liste des widgets activés avec leur configuration |

**Structure d'un widget :**
```json
{
  "id": "string",           // ID du widget (ex: "production_stats")
  "position": "integer",    // Position dans l'affichage (0, 1, 2...)
  "size": "string"          // Taille : "small", "medium", "large" (défaut: "medium")
}
```

### Disposition

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `layout` | enum | `grid`, `list` | Type de disposition (défaut: `grid`) |

## Widgets Disponibles

### Production
- `production_stats` : Statistiques de production
- `manufacturing_orders_today` : Ordres du jour
- `orders_in_progress` : Ordres en cours
- `orders_late` : Ordres en retard
- `production_efficiency` : Efficacité de production

### Inventaire
- `stock_alerts` : Alertes de stock bas
- `stock_value` : Valeur totale du stock
- `expiring_lots` : Lots proches expiration
- `recent_movements` : Mouvements récents
- `low_stock_products` : Produits en rupture

### Achats
- `purchase_orders_pending` : Bons en attente
- `pending_approvals` : Approbations requises
- `supplier_performance` : Performance fournisseurs
- `delivery_calendar` : Livraisons prévues

### Qualité
- `quality_inspections_pending` : Inspections en attente
- `quality_issues` : Problèmes qualité actifs
- `lots_in_quarantine` : Lots en quarantaine
- `quality_score_trend` : Tendance qualité

### Maintenance
- `equipment_status` : État des équipements
- `maintenance_due` : Maintenances à venir
- `maintenance_overdue` : Maintenances en retard
- `equipment_downtime` : Temps d'arrêt

### Général
- `kpi_overview` : Vue d'ensemble KPIs
- `recent_activity` : Activité récente
- `notifications` : Notifications récentes
- `quick_actions` : Actions rapides

## Contraintes

### Unicité
- Un seul enregistrement par `user_email`

### Validation
- `user_email` : format email valide
- `widgets` : array (peut être vide)
- Chaque widget :
  - `id` : chaîne non vide
  - `position` : entier >= 0
  - `size` : une des valeurs (small, medium, large)
- `layout` : grid ou list

## Tailles de Widgets

| Taille | Colonnes (Grid) | Hauteur | Usage |
|--------|-----------------|---------|-------|
| `small` | 1/3 largeur | 200px | Stats simples, chiffres clés |
| `medium` | 1/2 largeur | 300px | Graphiques, listes courtes |
| `large` | Pleine largeur | 400px+ | Tableaux, graphiques détaillés |

## Relations

### Les préférences :
- **Utilisateur** → `User` (via `user_email`)
- **Appliquées sur** → Page Dashboard

## Exemple

### Configuration Responsable Production

```json
{
  "user_email": "chef.production@example.com",
  "layout": "grid",
  "widgets": [
    {
      "id": "manufacturing_orders_today",
      "position": 0,
      "size": "large"
    },
    {
      "id": "orders_in_progress",
      "position": 1,
      "size": "medium"
    },
    {
      "id": "stock_alerts",
      "position": 2,
      "size": "medium"
    },
    {
      "id": "production_efficiency",
      "position": 3,
      "size": "small"
    },
    {
      "id": "equipment_status",
      "position": 4,
      "size": "small"
    },
    {
      "id": "quality_inspections_pending",
      "position": 5,
      "size": "small"
    }
  ]
}
```

### Configuration Gestionnaire Stocks

```json
{
  "user_email": "stock.manager@example.com",
  "layout": "grid",
  "widgets": [
    {
      "id": "stock_value",
      "position": 0,
      "size": "medium"
    },
    {
      "id": "stock_alerts",
      "position": 1,
      "size": "large"
    },
    {
      "id": "expiring_lots",
      "position": 2,
      "size": "medium"
    },
    {
      "id": "recent_movements",
      "position": 3,
      "size": "medium"
    },
    {
      "id": "delivery_calendar",
      "position": 4,
      "size": "medium"
    }
  ]
}
```

### Configuration Minimaliste

```json
{
  "user_email": "operateur@example.com",
  "layout": "list",
  "widgets": [
    {
      "id": "manufacturing_orders_today",
      "position": 0,
      "size": "large"
    },
    {
      "id": "quick_actions",
      "position": 1,
      "size": "medium"
    }
  ]
}
```

## Bonnes Pratiques

1. **Préférences par Défaut**
   - Définissez des widgets par défaut selon le rôle
   - Responsable production → widgets production
   - Gestionnaire stocks → widgets inventaire

2. **Personnalisation**
   - Permettez réorganisation par glisser-déposer
   - Sauvegarde automatique des changements
   - Bouton "Restaurer défaut"

3. **Performance**
   - Limitez le nombre de widgets (max 8-10)
   - Widgets lourds en lazy loading
   - Cache des données pour widgets

4. **Mobile**
   - Layout "list" automatique sur mobile
   - Adaptation de la taille des widgets
   - Priorité aux widgets essentiels

## Utilisation

### Charger les Préférences

```javascript
// Au chargement du dashboard
const user = await base44.auth.me()

const prefs = await base44.entities.DashboardPreference.filter({
  user_email: user.email
})[0]

if (!prefs) {
  // Créer préférences par défaut
  const default_prefs = getDefaultPreferences(user.role)
  await base44.entities.DashboardPreference.create(default_prefs)
}

// Afficher les widgets selon prefs.widgets
```

### Sauvegarder les Modifications

```javascript
// Après réorganisation des widgets
async function savePreferences(widgets) {
  const user = await base44.auth.me()
  
  await base44.entities.DashboardPreference.update(pref_id, {
    widgets: widgets
  })
}
```

### Drag & Drop

```javascript
// Réorganiser les widgets
function onDragEnd(result) {
  if (!result.destination) return
  
  const reordered = Array.from(widgets)
  const [moved] = reordered.splice(result.source.index, 1)
  reordered.splice(result.destination.index, 0, moved)
  
  // Mettre à jour les positions
  const updated = reordered.map((widget, index) => ({
    ...widget,
    position: index
  }))
  
  setWidgets(updated)
  savePreferences(updated)
}
```

### Ajouter/Retirer un Widget

```javascript
// Ajouter un widget
function addWidget(widget_id) {
  const new_widget = {
    id: widget_id,
    position: widgets.length,
    size: "medium"
  }
  
  savePreferences([...widgets, new_widget])
}

// Retirer un widget
function removeWidget(widget_id) {
  const filtered = widgets.filter(w => w.id !== widget_id)
  
  // Réorganiser les positions
  const reordered = filtered.map((w, idx) => ({
    ...w,
    position: idx
  }))
  
  savePreferences(reordered)
}
```

## Préférences par Défaut selon Rôle

### Admin
```javascript
{
  widgets: [
    { id: "kpi_overview", position: 0, size: "large" },
    { id: "recent_activity", position: 1, size: "medium" },
    { id: "stock_alerts", position: 2, size: "medium" },
    { id: "pending_approvals", position: 3, size: "medium" }
  ]
}
```

### Responsable Production
```javascript
{
  widgets: [
    { id: "manufacturing_orders_today", position: 0, size: "large" },
    { id: "orders_in_progress", position: 1, size: "medium" },
    { id: "production_efficiency", position: 2, size: "small" },
    { id: "equipment_status", position: 3, size: "small" }
  ]
}
```

### Gestionnaire Stocks
```javascript
{
  widgets: [
    { id: "stock_alerts", position: 0, size: "large" },
    { id: "stock_value", position: 1, size: "small" },
    { id: "expiring_lots", position: 2, size: "medium" },
    { id: "delivery_calendar", position: 3, size: "medium" }
  ]
}
```

## Personnalisation Avancée

### Filtres par Widget

```json
{
  "id": "manufacturing_orders_today",
  "position": 0,
  "size": "large",
  "filters": {
    "status": ["in_progress", "planned"],
    "warehouse_id": "wh_principal"
  }
}
```

### Période de Données

```json
{
  "id": "production_efficiency",
  "position": 1,
  "size": "medium",
  "timeframe": "last_30_days"
}
```

## Indicateurs

- **Utilisateurs avec dashboard personnalisé** = Count(DashboardPreference)
- **Widget le plus utilisé** = Mode(widgets[].id)
- **Taille moyenne de widgets** = Moyenne(widgets.length)
- **Layout préféré** = Count(layout = grid) vs Count(layout = list)