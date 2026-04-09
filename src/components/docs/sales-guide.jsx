# Guide Ventes

## Vue d'ensemble

Ce guide est destiné aux commerciaux, responsables des ventes et gestionnaires de commandes clients. Il couvre la création et le suivi des commandes de vente, la facturation et les statistiques commerciales.

## 1. Tableau de Bord Ventes

### Indicateurs Affichés sur le Dashboard

- **Chiffre d'affaires** : Total des commandes livrées
- **Commandes en cours** : Nombre de commandes actives (confirmées + expédiées)
- **Total commandes** : Nombre total de commandes créées
- **Dernières commandes** : Les 5 commandes les plus récentes

## 2. Commandes de Vente

### Accéder aux Commandes

1. Accédez à **Ventes → Commandes de Vente**
2. Vue liste avec filtres par statut et recherche
3. Statistiques en haut : CA, commandes en cours, total

### Créer une Commande de Vente

1. Cliquez sur **Nouvelle commande**
2. Renseignez les informations client :
   - **Nom du client** *(obligatoire)*
   - Email du client
   - Téléphone
   - Adresse de livraison
3. Sélectionnez l'**entrepôt source** *(obligatoire)*
4. Définissez les dates :
   - Date de commande (aujourd'hui par défaut)
   - Date de livraison prévue
5. Ajoutez les lignes de commande :
   - Sélectionnez le produit
   - Quantité
   - Prix unitaire (pré-rempli depuis le produit)
   - Remise (%)
6. Configurez les paramètres financiers :
   - Taux de TVA (%)
   - Mode de paiement
7. Ajoutez des notes si nécessaire
8. Cliquez sur **Créer la commande**

> Le numéro de commande est généré automatiquement (ex: CMD-A1B2C3)

### Statuts d'une Commande

| Statut | Description | Actions possibles |
|--------|-------------|-------------------|
| **Brouillon** | En cours de préparation | Confirmer, Annuler |
| **Confirmé** | Validé par le client | Expédier, Annuler |
| **Expédié** | En transit vers le client | Marquer comme livré |
| **Livré** | Réception confirmée par le client | Imprimer facture |
| **Annulé** | Commande annulée | — |

### Cycle de Vie d'une Commande

```
Brouillon → Confirmé → Expédié → Livré
                          ↓
               Déduction automatique du stock
```

### Confirmer une Commande

1. Ouvrez la commande en statut **Brouillon**
2. Cliquez sur **Confirmer** (dans les actions)
3. La commande passe en statut **Confirmé**

### Expédier une Commande

1. Ouvrez la commande en statut **Confirmé**
2. Cliquez sur **Expédier**
3. Le système :
   - Passe la commande en statut **Expédié**
   - Déduit automatiquement les quantités du stock de l'entrepôt source
   - Enregistre un mouvement de stock pour chaque ligne
4. Un message de confirmation s'affiche

> ⚠️ **Attention** : Vérifiez la disponibilité du stock avant d'expédier. Si le stock est insuffisant, une alerte sera affichée.

### Marquer comme Livré

1. Ouvrez la commande en statut **Expédié**
2. Cliquez sur **Marquer livré**
3. La commande est clôturée en statut **Livré**

### Annuler une Commande

1. Ouvrez la commande (statut Brouillon ou Confirmé)
2. Cliquez sur **Annuler**
3. La commande passe en statut **Annulé**

> Note : Une commande déjà expédiée ne peut pas être annulée directement.

## 3. Lignes de Commande

### Ajouter un Produit

Pour chaque ligne de commande :
- **Produit** : Sélectionnez depuis le catalogue
- **Quantité** : Quantité commandée
- **Prix unitaire** : Pré-rempli depuis le prix de vente du produit
- **Remise** : Pourcentage de réduction (0 à 100%)
- Le **total ligne** est calculé automatiquement : `quantité × prix × (1 - remise/100)`

### Calcul Automatique des Totaux

- **Sous-total HT** : Somme des lignes
- **Montant TVA** : Sous-total × taux TVA
- **Total TTC** : Sous-total + TVA

## 4. Modes de Paiement

Modes disponibles :
- 💵 **Espèces** : Paiement comptant
- 🏦 **Virement bancaire** : Transfert bancaire
- 📄 **Chèque** : Paiement par chèque
- 💳 **Carte bancaire** : Paiement par carte
- 📝 **Autre** : Modalité personnalisée

### Statut de Paiement

- **Non payé** : Aucun paiement reçu
- **Partiel** : Acompte versé
- **Payé** : Paiement intégral reçu

## 5. Facturation

### Imprimer une Facture

1. Ouvrez la commande de vente
2. Cliquez sur le bouton **Imprimer la facture** (icône 🖨️)
3. Une fenêtre d'impression s'ouvre avec la facture formatée
4. Imprimez ou sauvegardez en PDF

### Contenu de la Facture

La facture générée inclut :
- **En-tête** : Numéro de commande, date, statut
- **Informations client** : Nom, email, téléphone, adresse
- **Tableau des lignes** : Produit, quantité, prix, remise, total
- **Résumé financier** : Sous-total HT, TVA, Total TTC
- **Mode de paiement** et notes
- **Pied de page** : Date d'impression

### Accès Rapide à l'Impression

Dans le tableau des commandes, une icône d'impression est disponible directement sur chaque ligne.

## 6. Suivi et Statistiques

### Dashboard des Ventes

Le tableau de bord principal affiche :
- **Chiffre d'affaires total** : Somme des commandes livrées
- **Commandes en cours** : Total des commandes confirmées + expédiées
- **Nombre total de commandes** : Toutes statuts confondus

### Onglet "Dernières commandes" sur le Dashboard

Affiche les 5 dernières commandes avec :
- Numéro de commande et client
- Montant total
- Statut coloré

### Analyse des Ventes

Dans la page **Ventes → Commandes** :
- Filtres par statut
- Recherche par client ou numéro
- Export CSV de la liste
- Statistiques en temps réel

## 7. Lien avec le Stock

### Déduction Automatique

Lors de l'expédition d'une commande :

| Événement | Action sur le stock |
|-----------|---------------------|
| Commande expédiée | Déduction des quantités par ligne |
| Type de mouvement | `sales_order` (sortie) |
| Référence | ID de la commande de vente |

### Vérifier la Disponibilité

Avant d'expédier, consultez :
- **Inventaire → Niveaux de Stock** : Quantité disponible
- Les alertes stock bas sur le dashboard
- Le stock de l'entrepôt source configuré

## 8. Bonnes Pratiques

### Création des Commandes

- ✓ Vérifiez la disponibilité du stock avant confirmation
- ✓ Renseignez toujours l'adresse de livraison
- ✓ Indiquez la date de livraison prévue
- ✓ Utilisez les remises avec parcimonie

### Suivi

- ✓ Mettez à jour le statut à chaque étape du cycle de vie
- ✓ Imprimez et transmettez la facture à la livraison
- ✓ Confirmez le paiement dès réception
- ✓ Archivez les commandes annulées avec une note

### Gestion du Stock

- ✓ Configurez l'entrepôt source correctement
- ✓ Vérifiez les niveaux de stock après chaque expédition
- ✓ Créez des alertes sur les produits à forte rotation
- ✓ Coordonnez avec le service production pour les ruptures

## 9. Cas d'Usage Courants

### Vente Directe (Comptoir)

1. Créer une commande → Confirmer → Expédier → Livré
2. Mode de paiement : Espèces
3. Imprimer la facture immédiatement

### Commande Client avec Livraison

1. Créer la commande en brouillon
2. Confirmer après validation client
3. Préparer la commande en entrepôt
4. Expédier → mettre à jour le statut
5. Confirmer la livraison
6. Envoyer la facture

### Commande Partielle

Si tous les produits ne sont pas disponibles :
1. Créer une commande pour les produits disponibles
2. Créer une seconde commande pour le reste
3. Ou ajuster les quantités et informer le client

---

**Dernière MAJ** : Avril 2026