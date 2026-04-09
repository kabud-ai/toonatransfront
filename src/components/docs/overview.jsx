# Vue d'ensemble de l'ERP

## Introduction

Bienvenue dans l'ERP Système de Gestion de Production, une solution complète pour gérer l'ensemble de vos opérations de fabrication, d'inventaire, de ventes et de qualité.

## Objectifs du Système

- **Traçabilité totale** : Suivi complet des produits, lots et mouvements
- **Optimisation** : Réduction des coûts et amélioration de l'efficacité
- **Qualité** : Contrôles intégrés et gestion des non-conformités
- **Visibilité** : Tableaux de bord et indicateurs en temps réel
- **Conformité** : Respect des normes et réglementations

## Modules Principaux

### 1. Production
Gestion complète du cycle de fabrication :
- Ordres de fabrication
- Recettes et nomenclatures (BOM)
- Planification de production
- Gammes et postes de travail
- Fiches de fabrication (Job Cards)
- Gestion des rebuts (Scrap)
- Sous-traitance

### 2. Inventaire
Gestion des stocks et entrepôts :
- Niveaux de stock multi-entrepôts
- Traçabilité par lots
- Alertes et réapprovisionnement automatique
- Inventaires physiques
- Mouvements de stock

### 3. Ventes
Gestion des commandes clients :
- Commandes de vente
- Suivi des livraisons (brouillon → confirmé → expédié → livré)
- Facturation et impression de factures
- Statistiques de vente (chiffre d'affaires, commandes en cours)
- Déduction automatique du stock à l'expédition

### 4. Achats
Gestion des approvisionnements :
- Bons de commande
- Gestion des fournisseurs
- Catalogue fournisseurs
- Réceptions de marchandises
- Workflow d'approbation

### 5. Qualité
Contrôle et assurance qualité :
- Inspections (réception, en cours, finale)
- Gestion des non-conformités
- Quarantaine et libération de lots
- Traçabilité qualité

### 6. Maintenance
Gestion des équipements :
- Fiche équipement
- Maintenance préventive et corrective
- Planification des interventions
- Historique de maintenance

### 7. Administration
Configuration et gestion du système :
- Gestion des utilisateurs
- Rôles et permissions granulaires
- Paramètres système et apparence
- Sites et entrepôts
- Unités de mesure

## Concepts Clés

### Traçabilité par Lots

Chaque lot de produit (matière première ou produit fini) possède :
- Un numéro unique
- Une date de fabrication/réception
- Une date d'expiration
- Un historique complet des mouvements
- Un statut qualité

### Workflow de Production

```
1. Planification → 2. Création OF → 3. Vérification stock
                                         ↓
6. Vente/Livraison ← 5. Stockage ← 4. Production + Qualité
```

### Workflow de Vente

```
1. Brouillon → 2. Confirmé → 3. Expédié → 4. Livré
                                  ↓
                         Déduction automatique du stock
```

### Réapprovisionnement Intelligent

Le système surveille automatiquement :
- Niveaux de stock vs seuils configurés
- Besoins futurs (ordres planifiés)
- Délais de livraison fournisseurs
- Génère des suggestions d'achat

### Permissions Granulaires

Contrôle précis des accès par :
- Module (Production, Inventaire, Ventes, etc.)
- Action (Voir, Créer, Modifier, Supprimer, Approuver)
- Rôle métier (Opérateur, Gestionnaire, Administrateur)

## Tableau de Bord Personnalisable

Chaque utilisateur peut :
- Choisir ses widgets préférés
- Réorganiser l'affichage
- Configurer les filtres
- Créer des vues métier

### Widgets Disponibles

- **KPIs Production** : Ordres en cours, taux de réalisation
- **Alertes Stock** : Produits sous le seuil
- **Qualité** : Inspections en attente
- **Maintenance** : Équipements en intervention
- **Achats** : Commandes à approuver
- **Ventes** : Chiffre d'affaires, commandes récentes
- **Graphiques** : Tendances et évolutions

## Notifications et Alertes

### Notifications en Temps Réel

- Icône 🔔 dans la barre supérieure
- Badge indiquant le nombre de nouvelles notifications
- Marquage lu/non lu
- Historique conservé

### Alertes Automatiques

Le système génère des alertes pour :
- ⚠️ **Stock critique** : Niveau sous le minimum
- 📋 **Approbations** : Bons de commande en attente
- ❌ **Qualité** : Inspections échouées
- ✅ **Production** : Ordres de fabrication terminés
- 🔧 **Maintenance** : Équipements à entretenir

## Navigation et Recherche

### Menu Principal

- Sidebar gauche : Modules et pages
- Icônes visuelles pour chaque section
- Mode réduit/étendu (bouton hamburger)
- Visible sur desktop, accessible via menu sur mobile

### Recherche Globale

Raccourci : `Ctrl+K` ou `Cmd+K`

Recherche dans :
- Produits et matières premières
- Ordres de fabrication
- Commandes de vente
- Bons de commande
- Lots
- Utilisateurs
- Documentation

### Barre Supérieure

- **Recherche** : Accès rapide
- **Langue** : FR/EN/AR
- **Mode sombre** : Basculer le thème
- **Documentation** : Icône `?`
- **Notifications** : Icône 🔔
- **Site** : Sélecteur de site
- **Profil** : Menu utilisateur

## Multi-Site et Multi-Entrepôt

### Sites

Un site représente un lieu physique :
- Usine de production
- Entrepôt de stockage
- Centre de distribution
- Bureau administratif

### Entrepôts

Chaque site peut avoir plusieurs entrepôts :
- Stock principal
- Zone de quarantaine
- Produits finis
- Matières premières

### Changement de Site

Utilisez le sélecteur de site dans la barre supérieure pour :
- Basculer entre sites
- Filtrer les données par localisation
- Voir le stock par site

## Sécurité et Conformité

### Authentification

- Connexion sécurisée par email
- Sessions avec timeout automatique
- Déconnexion manuelle disponible

### Audit Trail

Toutes les actions sont enregistrées :
- Qui a fait quoi et quand
- Modifications sur données critiques
- Rapports d'audit disponibles
- Export pour conformité

### Sauvegarde

- Sauvegarde automatique quotidienne
- Conservation selon politique définie
- Restauration sur demande

## Support et Aide

### Documentation

- **Intégrée** : Bouton `?` dans l'application
- **Guides par rôle** : Admin, Production, Inventaire
- **Recherche dans la doc** : Via la recherche globale

### Fonctionnalités d'Aide

- Tooltips sur les champs
- Messages d'erreur explicites
- Exemples et valeurs par défaut
- Assistance contextuelle

### Formation

Plans de formation recommandés :
1. **Introduction** : Vue d'ensemble du système
2. **Formation métier** : Selon votre rôle
3. **Cas pratiques** : Scénarios réels
4. **Support continu** : Documentation et assistance

## Démarrage Rapide

### Premiers Pas

1. **Connexion** : Utilisez vos identifiants
2. **Profil** : Complétez vos informations
3. **Dashboard** : Personnalisez votre tableau de bord
4. **Documentation** : Consultez le guide de votre rôle
5. **Exploration** : Parcourez les modules accessibles

### Configuration Initiale (Admins)

1. Configurer l'entreprise et les sites
2. Créer les rôles métier
3. Inviter les utilisateurs
4. Importer les produits
5. Paramétrer les seuils de stock
6. Configurer les entrepôts

---

**Version** : 1.1  
**Dernière mise à jour** : Avril 2026  
**Support** : Contactez votre administrateur système