# Documentation Système ERP

## 📋 Vue d'ensemble

Système ERP complet pour la gestion de production industrielle intégrant la fabrication, l'inventaire, les ventes, les achats, la qualité, la maintenance et l'administration.

## 🗂️ Documentation Disponible

### 📘 Documentation Technique
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture technique complète du système
  - Structure des dossiers et modules
  - Entités et schémas de données
  - Composants et leur organisation
  - Flux de données et permissions
  - Bonnes pratiques de développement

### 📗 Guides Utilisateur

#### Par Rôle
1. **[Admin Guide](./admin-guide.md)** - Guide Administrateur
   - Gestion des utilisateurs et rôles
   - Configuration système
   - Permissions granulaires
   
2. **[Production Manager Guide](./production-manager-guide.md)** - Guide Directeur Production
   - Ordres de fabrication
   - Recettes et nomenclatures
   - Planification production

3. **[Inventory Manager Guide](./inventory-manager-guide.md)** - Guide Gestionnaire Inventaire
   - Gestion des stocks
   - Traçabilité des lots
   - Réapprovisionnement

4. **[Buyer Guide](./buyer-guide.md)** - Guide Acheteur
   - Bons de commande
   - Gestion fournisseurs
   - Réceptions

5. **[Quality Manager Guide](./quality-manager-guide.md)** - Guide Contrôle Qualité
   - Inspections qualité
   - Gestion des non-conformités

6. **[Maintenance Manager Guide](./maintenance-manager-guide.md)** - Guide Maintenance
   - Ordres de maintenance
   - Gestion équipements

## 🏗️ Architecture

### Modules Principaux

- **🏭 Production** : Ordres, recettes, nomenclatures, planification, gammes
- **📦 Inventaire** : Stocks, lots, entrepôts, alertes, réapprovisionnement
- **💰 Ventes** : Commandes clients, facturation, suivi des livraisons
- **🛒 Achats** : Commandes, fournisseurs, réceptions, catalogue
- **✅ Qualité** : Inspections, contrôles, traçabilité, non-conformités
- **🔧 Maintenance** : Préventive, corrective, équipements
- **👥 Administration** : Utilisateurs, rôles, permissions, sites

## 🚀 Démarrage Rapide

### Première Connexion
1. Recevez l'email d'invitation
2. Créez votre mot de passe
3. Personnalisez votre tableau de bord
4. Consultez le guide correspondant à votre rôle

### Navigation
- **Menu latéral** : Accès modules selon permissions
- **Recherche globale** : `Ctrl+K` ou `Cmd+K`
- **Notifications** : Icône cloche
- **Profil** : Cliquez sur votre nom

## 🌍 Langues

- 🇫🇷 Français
- 🇬🇧 Anglais
- 🇸🇦 Arabe (RTL)

## 🔐 Sécurité

- Permissions granulaires par module et action
- Rôles personnalisables
- Audit trail complet
- Données chiffrées

## 📊 Technologies

- React 18 + Tailwind CSS
- Base44 Platform (BaaS)
- TanStack Query (état serveur)
- Recharts (visualisations)
- React Hook Form + Zod (formulaires)

## 📞 Support

Pour consulter la documentation :
1. Ouvrez cette page via le menu
2. Cliquez sur le guide pertinent
3. Ou utilisez la recherche globale (`Ctrl+K`)

---

**Version** : 1.1.0  
**Dernière MAJ** : Avril 2026