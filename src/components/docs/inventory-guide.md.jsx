# Guide Inventaire

## Vue d'ensemble

Ce guide est destiné aux gestionnaires de stock, magasiniers et responsables d'entrepôt. Il couvre la gestion des stocks, des lots, des entrepôts et du réapprovisionnement.

## 1. Tableau de Bord Inventaire

### Widgets Recommandés

- **Alertes stock bas** : Produits sous le seuil minimum
- **Valeur du stock** : Valeur totale de l'inventaire
- **Lots à expirer** : Produits proche de la date d'expiration
- **Mouvements récents** : Dernières entrées/sorties
- **Taux de rotation** : Vitesse d'écoulement du stock

### Indicateurs Clés

- **Stock disponible** : Quantité totale moins réservations
- **Taux de rupture** : % de commandes impossibles
- **Durée moyenne de stock** : Temps moyen de conservation
- **Précision d'inventaire** : Écarts théorique/réel

## 2. Gestion des Stocks

### Consulter les Niveaux de Stock

1. Accédez à **Inventaire → Niveaux de Stock**
2. Vue par défaut : Tous les produits et entrepôts
3. Filtres disponibles :
   - Par entrepôt
   - Par type de produit
   - Stock disponible/réservé
   - Alertes actives

### Comprendre les Quantités

- **Quantité totale** : Stock physique total
- **Quantité réservée** : Bloquée pour ordres de fabrication
- **Quantité disponible** : Total - Réservé
- **Valeur du stock** : Quantité × Coût unitaire

### Configurer les Seuils d'Alerte

Pour chaque produit par entrepôt :

1. Ouvrez la fiche de niveau de stock
2. Définissez :
   - **Stock minimum** : Déclenche alerte "stock bas"
   - **Stock maximum** : Alerte surstockage
   - **Point de commande** : Seuil de réapprovisionnement
   - **Quantité à commander** : Quantité de réappro par défaut

### Types d'Alertes

- 🔴 **Critique** : Stock = 0
- 🟠 **Stock bas** : Sous le minimum
- 🟡 **Point de commande** : Temps de réapprovisionner
- 🟣 **Surstock** : Au-dessus du maximum

## 3. Mouvements de Stock

### Types de Mouvements

- **Entrée** : Réception de marchandise
- **Sortie** : Expédition ou consommation
- **Transfert** : Entre entrepôts
- **Ajustement** : Correction d'inventaire
- **Production** : Fabrication de produit fini
- **Consommation** : Utilisation en production

### Enregistrer une Entrée

1. Allez dans **Inventaire → Mouvements**
2. Cliquez sur **Nouveau mouvement**
3. Type : **Entrée**
4. Renseignez :
   - Produit
   - Entrepôt de destination
   - Quantité
   - Numéro de lot
   - Référence (bon de commande, etc.)
5. Validez

### Enregistrer une Sortie

1. Type : **Sortie**
2. Sélectionnez :
   - Produit
   - Entrepôt source
   - Quantité
   - Lot à utiliser (FIFO/FEFO automatique)
   - Référence (ordre de fabrication, etc.)

### Transférer entre Entrepôts

1. Type : **Transfert**
2. Indiquez :
   - Produit et lot
   - Entrepôt source
   - Entrepôt destination
   - Quantité
3. Le mouvement crée automatiquement :
   - Une sortie de l'entrepôt source
   - Une entrée dans l'entrepôt destination

### Faire un Ajustement

En cas d'écart entre le stock théorique et réel :

1. Type : **Ajustement**
2. Renseignez :
   - Produit et entrepôt
   - Quantité réelle constatée
   - Raison (casse, perte, erreur de saisie, etc.)
3. Le système calcule la différence
4. Validez pour mettre à jour le stock

### Mouvements Automatiques

Le système crée automatiquement des mouvements pour :
- ✓ Réceptions de commandes
- ✓ Production d'ordres de fabrication
- ✓ Consommation de matières premières
- ✓ Transferts de lots en quarantaine

## 4. Traçabilité des Lots

### Consulter un Lot

1. Accédez à **Inventaire → Lots**
2. Recherchez par numéro ou produit
3. Vue détaillée :
   - Informations générales
   - Quantité actuelle
   - Historique des mouvements
   - Statut qualité

### Informations de Lot

- **Numéro de lot** : Identifiant unique
- **Produit** : Référence
- **Entrepôt** : Localisation
- **Quantités** : Initiale, actuelle, réservée
- **Dates** : Fabrication, réception, expiration
- **Origine** : Fournisseur ou ordre de fabrication
- **Statut** : Disponible, réservé, quarantaine, expiré

### Historique des Mouvements

Pour chaque lot, consultez :
- Date et heure de chaque mouvement
- Type (entrée, sortie, transfert, etc.)
- Quantité déplacée
- Référence (document source)
- Utilisateur ayant effectué l'action
- Entrepôt source/destination

### Mettre en Quarantaine

Si un problème qualité est détecté :

1. Ouvrez le lot concerné
2. Cliquez sur **Mettre en quarantaine**
3. Motif : Inspection en cours, non-conformité, etc.
4. Le lot devient **indisponible** pour la production
5. Une inspection qualité doit être créée

### Libérer un Lot

Après résolution du problème :

1. L'inspection qualité est validée
2. Cliquez sur **Libérer de la quarantaine**
3. Le lot redevient **disponible**

## 5. Gestion des Entrepôts

### Créer un Entrepôt

1. Allez dans **Configuration → Entrepôts**
2. Cliquez sur **Nouvel entrepôt**
3. Définissez :
   - Nom et code unique
   - Adresse complète
   - Site rattaché
   - Type (principal, secondaire, transit)

### Organisation

Chaque entrepôt peut contenir :
- Plusieurs produits
- Plusieurs lots par produit
- Zones de stockage (optionnel)
- Emplacements spécifiques (optionnel)

### Consulter le Stock par Entrepôt

1. Ouvrez la fiche entrepôt
2. Onglet **Stock** : Tous les produits présents
3. Vue détaillée :
   - Quantité par produit
   - Valeur totale
   - Lots disponibles
   - Alertes actives

### Transférer du Stock

Pour répartir le stock entre entrepôts :

1. Créez un mouvement de type **Transfert**
2. Ou utilisez **Transfert en masse** pour plusieurs produits

## 6. Réapprovisionnement Automatique

### Suggestions Automatiques

Le système génère automatiquement des suggestions lorsque :
- Stock sous le point de commande
- Stock sous le minimum
- Consommation prévue (ordres planifiés)

### Consulter les Suggestions

1. Accédez à **Inventaire → Réapprovisionnement**
2. Tableau des suggestions :
   - Produit concerné
   - Stock actuel
   - Quantité suggérée
   - Fournisseur recommandé
   - Coût estimé
   - Priorité (critique, haute, normale, basse)

### Priorités

- 🔴 **Critique** : Rupture de stock (quantité = 0)
- 🟠 **Haute** : Sous le minimum
- 🟡 **Normale** : Proche du point de commande
- 🟢 **Basse** : Prévisionnel

### Approuver une Suggestion

1. Sélectionnez les suggestions à traiter
2. Cliquez sur **Approuver**
3. Ajustez la quantité si nécessaire
4. Le système crée automatiquement un **bon de commande**

### Rejeter une Suggestion

Si la suggestion n'est pas pertinente :
1. Sélectionnez la suggestion
2. Cliquez sur **Rejeter**
3. Ajoutez un motif (optionnel)

### Paramétrage

Pour améliorer la précision :

1. Configurez les seuils par produit
2. Définissez les fournisseurs préférés
3. Indiquez les délais de livraison
4. Ajustez les quantités de commande standards

## 7. Inventaire Physique

### Préparer un Inventaire

1. Planifiez une date de comptage
2. Bloquez les mouvements si nécessaire
3. Imprimez les listes de comptage
4. Assignez les zones aux équipes

### Enregistrer un Comptage

1. Accédez à **Inventaire → Inventaire Physique**
2. Cliquez sur **Nouveau comptage**
3. Sélectionnez l'entrepôt
4. Pour chaque produit/lot :
   - Quantité théorique (affichée)
   - Quantité réelle (comptée)
   - Écart calculé automatiquement

### Valider et Ajuster

1. Vérifiez les écarts significatifs
2. Double-comptage si nécessaire
3. Cliquez sur **Valider l'inventaire**
4. Le système crée automatiquement des ajustements
5. Le stock est mis à jour

### Analyser les Écarts

Rapports disponibles :
- Écarts par produit
- Écarts par entrepôt
- Valeur des écarts
- Taux de précision

## 8. Rapports Inventaire

### Rapport de Valeur de Stock

Affiche :
- Valeur totale par entrepôt
- Valeur par catégorie de produit
- Évolution dans le temps
- Répartition des coûts

### Rapport de Rotation

Calcule pour chaque produit :
- Nombre de sorties sur la période
- Taux de rotation annuel
- Durée moyenne de stockage
- Classification ABC

### Analyse ABC

Classification des produits :
- **A** : 20% des produits = 80% de la valeur
- **B** : 30% des produits = 15% de la valeur
- **C** : 50% des produits = 5% de la valeur

Utilisez cette analyse pour :
- Prioriser les comptages
- Optimiser les seuils
- Gérer les approvisionnements

### Rapport de Mouvements

Historique détaillé :
- Tous les mouvements sur une période
- Filtres multiples (produit, entrepôt, type)
- Export Excel/PDF

## 9. Lots Périmés et Alertes

### Surveiller les Expirations

1. Tableau de bord affiche les lots proches de l'expiration
2. Alertes à J-30, J-15, J-7
3. Actions recommandées :
   - Utiliser en priorité (FEFO)
   - Promotion/déstockage
   - Destruction si périmé

### Gérer un Lot Expiré

1. Le système marque automatiquement le lot **Expiré**
2. Le lot devient **indisponible**
3. Créez un mouvement de type **Ajustement**
4. Motif : Expiration
5. Documentez la destruction

## 10. Bonnes Pratiques

### Gestion Quotidienne

- ✓ Consultez les alertes de stock chaque matin
- ✓ Vérifiez les suggestions de réapprovisionnement
- ✓ Enregistrez tous les mouvements immédiatement
- ✓ Contrôlez les lots proches de l'expiration

### Configuration Optimale

- ✓ Définissez des seuils réalistes basés sur l'historique
- ✓ Utilisez le FEFO (First Expired, First Out)
- ✓ Configurez les fournisseurs préférés
- ✓ Maintenez les coûts unitaires à jour

### Traçabilité

- ✓ Créez systématiquement des lots pour les produits critiques
- ✓ Documentez l'origine (fournisseur ou production)
- ✓ Enregistrez les dates de fabrication et d'expiration
- ✓ Conservez l'historique complet

### Audits et Contrôles

- ✓ Comptage cyclique mensuel (produits A)
- ✓ Inventaire physique trimestriel (tous produits)
- ✓ Rapprochez régulièrement théorique/réel
- ✓ Analysez les écarts et leurs causes

---

**Notifications Email Automatiques** :
- Alertes de stock critique
- Lots proches de l'expiration
- Suggestions de réapprovisionnement critiques