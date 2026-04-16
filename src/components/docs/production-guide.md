# Guide Production

## Vue d'ensemble

Ce guide est destiné aux responsables de production, opérateurs et gestionnaires de fabrication. Il couvre la gestion des ordres de fabrication, des recettes, des nomenclatures et des équipements.

## 1. Tableau de Bord Production

### Widgets Recommandés

- **Ordres en cours** : Suivi en temps réel de la production
- **Ordres en retard** : Alertes de dépassement de délai
- **Efficacité production** : KPIs de performance
- **Stock matières premières** : Disponibilité pour production
- **Équipements en maintenance** : Machines indisponibles

### Indicateurs Clés

- **Taux de réalisation** : Ordres complétés / Ordres planifiés
- **Temps de cycle moyen** : Durée moyenne de fabrication
- **Taux de rebut** : % de produits non conformes
- **Utilisation équipements** : Temps productif / Temps disponible

## 2. Ordres de Fabrication

### Créer un Ordre de Fabrication

1. Accédez à **Production → Ordres de Fabrication**
2. Cliquez sur **Nouvel ordre**
3. Remplissez les informations :
   - **Produit** : Sélectionnez le produit à fabriquer
   - **Quantité** : Quantité à produire
   - **Recette** : Choisissez la recette (ou celle par défaut)
   - **Date prévue** : Date de production planifiée
   - **Entrepôt de destination** : Où stocker le produit fini
4. Cliquez sur **Créer**

### Statuts d'Ordre

- **Brouillon** : En préparation, pas encore validé
- **Planifié** : Validé, en attente de démarrage
- **En cours** : Production active
- **Terminé** : Production complétée avec succès
- **Annulé** : Ordre abandonné

### Lancer la Production

1. Ouvrez l'ordre de fabrication
2. Vérifiez la disponibilité des matières premières
3. Cliquez sur **Démarrer la production**
4. Le système :
   - Réserve les matières premières
   - Consomme automatiquement les composants
   - Met à jour l'état de l'ordre

### Compléter un Ordre

1. Ouvrez l'ordre en cours
2. Renseignez :
   - **Quantité produite** : Réelle (peut différer de la prévue)
   - **Numéro de lot** : Généré automatiquement ou personnalisé
   - **Date de fabrication** : Date réelle
   - **Date d'expiration** : Selon la durée de validité du produit
3. Cliquez sur **Terminer la production**
4. Le système :
   - Crée un lot de produit fini
   - Ajoute au stock
   - Libère les équipements

### Gérer les Problèmes

**Production partielle** : Si la quantité produite est inférieure
- Indiquez la quantité réelle
- Ajoutez des notes explicatives
- Créez un nouveau lot avec la quantité produite

**Matières premières insuffisantes**
- Le système affiche une alerte
- Créez un bon de commande si nécessaire
- Ou ajustez la quantité à produire

**Défauts qualité**
- Créez une inspection qualité
- Mettez le lot en quarantaine
- Documentez les non-conformités

## 3. Recettes

### Structure d'une Recette

Une recette contient :
- **Informations générales** : Titre, code, version
- **Étapes de production** : Séquence ordonnée
- **Composants** : Matières premières et quantités
- **Instructions** : Détails pour chaque étape

### Créer une Recette

1. Allez dans **Production → Recettes**
2. Cliquez sur **Nouvelle recette**
3. Définissez :
   - Titre et description
   - Code unique
   - Type de recette
   - Statut (brouillon/active)

### Ajouter des Étapes

1. Cliquez sur **Ajouter une étape**
2. Pour chaque étape :
   - Numéro d'ordre (séquence)
   - Description détaillée
   - Ajoutez les composants nécessaires
   - Quantité de chaque composant

### Versionning

- Chaque modification crée une nouvelle version
- Les anciennes versions restent consultables
- L'historique complet est conservé
- Seule la version "Active" est utilisée en production

### Dupliquer une Recette

Pour créer une variante :
1. Ouvrez la recette source
2. Cliquez sur **Dupliquer**
3. Modifiez le code et le titre
4. Ajustez les étapes/composants

## 4. Nomenclatures (BOM)

### Qu'est-ce qu'une Nomenclature ?

Une nomenclature (Bill of Materials) définit tous les composants nécessaires pour fabriquer un produit, avec leurs quantités exactes.

### Créer une Nomenclature

1. Accédez à **Production → Nomenclatures**
2. Cliquez sur **Nouvelle BOM**
3. Sélectionnez le produit fini
4. Ajoutez les composants :
   - Matière première / Semi-fini
   - Quantité requise
   - Unité de mesure
   - Notes optionnelles

### Types de Nomenclatures

- **Mono-niveau** : Composants directs uniquement
- **Multi-niveaux** : Inclut les sous-assemblages
- **Variantes** : Versions alternatives selon les options

### Calcul des Coûts

Le coût d'un produit est calculé automatiquement :
```
Coût total = Σ (quantité composant × coût unitaire composant)
```

### Où Utiliser ?

- Lors de la planification de production
- Pour calculer les besoins en matières
- Dans les suggestions de réapprovisionnement
- Pour l'analyse de rentabilité

## 5. Planification de Production

### Créer un Plan de Production

1. Allez dans **Production → Planification**
2. Cliquez sur **Nouveau plan**
3. Définissez :
   - Produit à fabriquer
   - Quantité prévue
   - Date de production
   - Recette à utiliser

### Vérifier la Faisabilité

Le système vérifie automatiquement :
- ✓ Disponibilité des matières premières
- ✓ Capacité des entrepôts
- ✓ Disponibilité des équipements
- ⚠️ Alertes si ressources insuffisantes

### Convertir en Ordre

Lorsque le plan est prêt :
1. Ouvrez le plan
2. Cliquez sur **Créer l'ordre de fabrication**
3. L'ordre est créé automatiquement avec toutes les données

## 6. Gestion des Équipements

### Enregistrer un Équipement

1. Accédez à **Maintenance → Équipements**
2. Cliquez sur **Nouvel équipement**
3. Renseignez :
   - Nom et code
   - Type (machine, outil, ligne)
   - Site/entrepôt
   - Date de mise en service
   - Fréquence de maintenance

### Statuts d'Équipement

- **Opérationnel** : Disponible pour production
- **En maintenance** : Maintenance planifiée
- **En panne** : Nécessite intervention
- **Hors service** : Retiré de la production

### Programmer une Maintenance

1. Ouvrez la fiche équipement
2. Cliquez sur **Planifier maintenance**
3. Définissez :
   - Type (préventive, corrective, urgente)
   - Date planifiée
   - Durée estimée
   - Technicien assigné

## 7. Achats et Approvisionnement

### Créer un Bon de Commande

1. Allez dans **Achats → Bons de Commande**
2. Cliquez sur **Nouvelle commande**
3. Sélectionnez le fournisseur
4. Ajoutez les lignes :
   - Produit/matière première
   - Quantité
   - Prix unitaire
5. Statut initial : **Brouillon**

### Workflow d'Approbation

Si le montant dépasse le seuil configuré :
1. Le bon passe en statut **En attente d'approbation**
2. Un email est envoyé aux approbateurs
3. Après approbation : statut **Approuvé**
4. La commande peut être envoyée au fournisseur

### Réceptionner une Commande

1. Accédez à **Achats → Réceptions**
2. Cliquez sur **Nouvelle réception**
3. Sélectionnez le bon de commande
4. Vérifiez les quantités reçues
5. Créez les lots pour traçabilité
6. Validez la réception

Le stock est automatiquement mis à jour.

## 8. Contrôle Qualité

### Créer une Inspection

1. Allez dans **Qualité → Inspections**
2. Cliquez sur **Nouvelle inspection**
3. Type d'inspection :
   - **Réception** : Matières premières reçues
   - **En cours** : Pendant la production
   - **Finale** : Produit fini
   - **Périodique** : Contrôle régulier du stock

### Points de Contrôle

Pour chaque inspection, définissez :
- Critère à vérifier
- Spécification attendue
- Valeur mesurée
- Résultat : Conforme / Non conforme

### Résultats

- **Réussite** : Lot libéré automatiquement
- **Échec** : Lot mis en quarantaine
- **Conditionnel** : Nécessite validation manuelle

### Traiter une Non-Conformité

1. L'inspection échoue
2. Un email est envoyé à l'équipe qualité
3. Analysez la cause
4. Décisions possibles :
   - Retravail du lot
   - Mise au rebut
   - Acceptation dérogatoire
   - Retour fournisseur

## 9. Traçabilité et Lots

### Suivi des Lots

Chaque lot contient :
- Numéro unique
- Produit concerné
- Quantité
- Date de fabrication
- Date d'expiration
- Historique complet des mouvements

### Consulter l'Historique

1. Ouvrez **Inventaire → Lots**
2. Sélectionnez un lot
3. Onglet **Mouvements** : Tous les déplacements
4. Onglet **Traçabilité** : Origine des composants

### Traçabilité Amont

Remontez l'origine :
- Quelles matières premières ont été utilisées ?
- De quel fournisseur proviennent-elles ?
- Quel bon de commande ?

### Traçabilité Aval

Suivez l'utilisation :
- Dans quels produits finis ce lot a été consommé ?
- Quand et par qui ?
- Quels clients ont reçu ces produits ?

## 10. Bonnes Pratiques

### Planification

- ✓ Planifiez la production une semaine à l'avance
- ✓ Vérifiez toujours les stocks avant de créer un ordre
- ✓ Tenez compte des délais de livraison fournisseurs
- ✓ Anticipez les maintenances d'équipements

### Exécution

- ✓ Lancez les ordres à l'heure prévue
- ✓ Renseignez les quantités réelles immédiatement
- ✓ Documentez tout problème ou écart
- ✓ Créez les lots avec toutes les informations

### Qualité

- ✓ Inspectez systématiquement les réceptions
- ✓ Contrôlez les produits finis avant stockage
- ✓ Réagissez rapidement aux non-conformités
- ✓ Analysez les causes racines

### Maintenance

- ✓ Respectez les plannings de maintenance préventive
- ✓ Signalez immédiatement les pannes
- ✓ Documentez les interventions
- ✓ Suivez les indicateurs de performance équipements

---

**Notifications Email Automatiques** :
- Nouveau bon de commande à approuver
- Inspection qualité échouée
- Ordre de fabrication terminé