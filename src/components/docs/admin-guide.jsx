# Guide Administrateur

## Vue d'ensemble

En tant qu'administrateur, vous avez un accès complet au système et êtes responsable de :
- Gestion des utilisateurs et des accès
- Configuration des rôles et permissions
- Paramétrage système
- Gestion des sites et entrepôts
- Surveillance globale

## 1. Gestion des Utilisateurs

### Inviter un Utilisateur

1. Accédez à **Paramètres → Utilisateurs**
2. Cliquez sur **Inviter un utilisateur**
3. Renseignez :
   - Email de l'utilisateur
   - Rôle à attribuer
4. L'utilisateur recevra un email d'invitation

### Modifier un Utilisateur

- **Changer le rôle** : Modifiez le rôle pour ajuster les permissions
- **Désactiver un compte** : Empêche l'accès sans supprimer les données
- **Réinitialiser les préférences** : Restaure les paramètres par défaut

### Statuts Utilisateur

- **Actif** : Utilisateur avec accès complet
- **Invité** : Invitation envoyée, en attente d'acceptation
- **Inactif** : Compte désactivé temporairement

## 2. Rôles et Permissions

### Créer un Rôle

1. Allez dans **Paramètres → Rôles**
2. Cliquez sur **Nouveau rôle**
3. Définissez :
   - Nom du rôle
   - Code unique
   - Description
4. Configurez les permissions par module

### Permissions par Module

Chaque module peut avoir les permissions suivantes :
- **Voir** : Consulter les données
- **Créer** : Ajouter de nouveaux enregistrements
- **Modifier** : Éditer les enregistrements existants
- **Supprimer** : Effacer des enregistrements
- **Approuver** : Valider des opérations (achats, qualité)
- **Exécuter** : Lancer des opérations (production)

### Exemples de Rôles Pré-configurés

#### Responsable Production
```
✓ Production : Voir, Créer, Modifier, Exécuter
✓ Inventaire : Voir
✓ Achats : Voir
✓ Qualité : Voir, Créer
```

#### Gestionnaire Stocks
```
✓ Inventaire : Voir, Créer, Modifier, Ajuster
✓ Entrepôts : Voir, Créer, Modifier
✓ Achats : Voir, Créer
✓ Réceptions : Voir, Créer, Modifier
```

#### Responsable Qualité
```
✓ Qualité : Toutes permissions
✓ Production : Voir
✓ Inventaire : Voir, Quarantaine
✓ Lots : Voir, Quarantaine, Libérer
```

#### Acheteur
```
✓ Achats : Voir, Créer, Modifier
✓ Fournisseurs : Voir, Créer, Modifier
✓ Inventaire : Voir
✓ Réapprovisionnement : Voir, Créer
```

#### Commercial / Responsable Ventes
```
✓ Ventes : Voir, Créer, Modifier
✓ Produits : Voir
✓ Inventaire : Voir
✓ Rapports : Voir (financial)
```

## 3. Configuration Système

### Paramètres Généraux

**Informations Entreprise**
- Nom de l'entreprise
- Logo
- Adresse
- Coordonnées

**Préférences**
- Langue par défaut
- Fuseau horaire
- Format de date
- Devise

### Configuration des Modules

**Production**
- Génération automatique des numéros d'ordre
- Validation requise pour lancer la production
- Notifications de fin de production

**Inventaire**
- Suivi des lots obligatoire/optionnel
- Durée de validité par défaut
- Seuils d'alerte automatiques

**Ventes**
- Numérotation automatique des commandes (CMD-XXXXXX)
- Taux de TVA par défaut
- Modes de paiement disponibles
- Entrepôt source par défaut

**Achats**
- Workflow d'approbation
- Montant maximum sans approbation
- Délai de livraison par défaut

### Apparence

- Mode clair/sombre
- Couleurs principales
- Logo personnalisé
- Page d'accueil par défaut

## 4. Gestion des Sites

### Créer un Site

1. Accédez à **Configuration → Sites**
2. Cliquez sur **Nouveau site**
3. Renseignez :
   - Nom du site
   - Code unique
   - Adresse complète
   - Type (usine, entrepôt, bureau)

### Associer des Entrepôts

Chaque site peut avoir plusieurs entrepôts pour organiser le stock.

## 5. Tableau de Bord Administrateur

### Widgets Recommandés

- **Utilisateurs actifs** : Suivi de l'activité
- **Alertes système** : Notifications importantes
- **Statistiques globales** : KPIs de tous les modules
- **Rapports d'audit** : Historique des modifications
- **Ventes du jour** : Chiffre d'affaires et commandes récentes

### Vue d'ensemble Dashboard

Le tableau de bord principal affiche :
- Ordres de fabrication actifs
- Valeur du stock total
- Taux qualité (inspections réussies)
- Maintenances planifiées
- Chiffre d'affaires (commandes livrées)
- Commandes de vente en cours
- Dernières commandes clients

### Personnalisation

1. Cliquez sur **Personnaliser le tableau de bord**
2. Ajoutez/supprimez des widgets
3. Réorganisez par glisser-déposer
4. Ajustez la taille des widgets

## 6. Rapports et Audit

### Générer un Rapport d'Audit

1. Accédez au tableau de bord
2. Cliquez sur **Rapport d'Audit** (en haut à droite)
3. Le rapport compile :
   - Statistiques de production
   - Données qualité
   - Valeur d'inventaire
   - Données utilisateurs
4. Exportez en PDF

### Recherche Globale

Utilisez `Ctrl+K` ou `Cmd+K` pour :
- Rechercher dans toutes les entités
- Trouver des utilisateurs
- Accéder rapidement aux pages
- Consulter l'historique

## 7. Maintenance et Surveillance

### Vérifications Quotidiennes

- [ ] Consulter les alertes système
- [ ] Vérifier les commandes de vente en attente
- [ ] Examiner les rapports d'erreur
- [ ] Contrôler les stocks bas

### Vérifications Hebdomadaires

- [ ] Analyser l'activité des utilisateurs
- [ ] Examiner les permissions
- [ ] Vérifier les performances
- [ ] Analyser les ventes de la semaine

### Dépannage Courant

**Problème** : Un utilisateur ne peut pas se connecter
- Vérifier que le compte est actif
- Confirmer que l'invitation a été acceptée
- Réinitialiser le mot de passe si nécessaire

**Problème** : Permissions incorrectes
- Vérifier le rôle assigné
- Contrôler la configuration du rôle
- Tester avec un compte de test

**Problème** : Stock non déduit lors d'une expédition
- Vérifier que la commande est passée en statut "Expédié"
- Contrôler que l'entrepôt source est bien configuré
- Consulter les mouvements de stock

**Problème** : Données manquantes
- Vérifier les permissions de lecture
- Contrôler les filtres appliqués

## 8. Configuration Initiale

### Checklist de Démarrage

1. **Configuration de base**
   - [ ] Informations entreprise
   - [ ] Logo et apparence
   - [ ] Fuseau horaire et langue

2. **Structure organisationnelle**
   - [ ] Créer les sites
   - [ ] Créer les entrepôts
   - [ ] Définir les départements

3. **Utilisateurs et accès**
   - [ ] Créer les rôles métier
   - [ ] Inviter les utilisateurs
   - [ ] Assigner les rôles

4. **Données de base**
   - [ ] Importer les produits (avec prix de vente)
   - [ ] Configurer les fournisseurs
   - [ ] Définir les unités de mesure

5. **Paramètres métier**
   - [ ] Seuils de stock
   - [ ] Taux de TVA pour les ventes
   - [ ] Entrepôts de vente

## 9. Formation des Utilisateurs

### Ressources Disponibles

- Documentation intégrée (bouton `?`)
- Guides par rôle
- Support technique

### Plan de Formation Recommandé

1. **Session d'introduction** (1h)
   - Vue d'ensemble du système
   - Navigation et interface
   - Profil utilisateur

2. **Formation par rôle** (2-3h)
   - Fonctionnalités spécifiques
   - Cas d'usage courants
   - Bonnes pratiques

3. **Exercices pratiques** (1-2h)
   - Scénarios réels
   - Questions/réponses

## 10. Sécurité et Conformité

### Bonnes Pratiques

- Réviser les accès trimestriellement
- Désactiver les comptes inutilisés
- Auditer les actions sensibles
- Sauvegarder régulièrement
- Documenter les changements de configuration

### Politique de Mots de Passe

- Longueur minimale recommandée
- Renouvellement périodique
- Pas de partage de comptes

---

**Support** : Pour toute question, contactez l'équipe technique ou consultez la documentation en ligne.  
**Dernière MAJ** : Avril 2026