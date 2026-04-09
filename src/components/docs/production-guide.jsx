# Guide Production

## Vue d'ensemble

Ce guide est destiné aux responsables de production, opérateurs et gestionnaires de fabrication. Il couvre la gestion des ordres de fabrication, des recettes, des nomenclatures, des gammes et des équipements.

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

## 5. Gammes Opératoires (Routings)

### Qu'est-ce qu'une Gamme ?

Une gamme décrit la séquence d'opérations nécessaires pour fabriquer un produit, incluant les postes de travail et les temps alloués.

### Créer une Gamme

1. Accédez à **Production → Gammes**
2. Cliquez sur **Nouvelle gamme**
3. Définissez :
   - Nom et code
   - Produit associé
4. Ajoutez les opérations :
   - Séquence et nom de l'opération
   - Poste de travail
   - Heures planifiées
   - Coût horaire

### Postes de Travail

Les postes de travail (Workstations) représentent :
- Machines spécifiques
- Équipes/opérateurs
- Lignes de production

Chaque poste possède :
- Capacité par heure
- Coût horaire
- Horaires de travail
- Statut (actif, maintenance, inactif)

## 6. Fiches de Fabrication (Job Cards)

### Rôle des Fiches

Les fiches de fabrication tracent l'exécution réelle de chaque opération :
- Temps réels vs planifiés
- Opérateur assigné
- Quantités produites et rebuts

### Suivi d'une Fiche

1. Accédez à **Production → Fiches de Fabrication**
2. Ouvrez la fiche correspondant à votre opération
3. Cliquez sur **Démarrer**
4. À la fin :
   - Indiquez la quantité produite
   - Renseignez le temps réel
   - Notez les rebuts éventuels
5. Cliquez sur **Terminer**

## 7. Gestion des Rebuts (Scrap)

### Déclarer un Rebut

1. Accédez à **Production → Rebuts**
2. Cliquez sur **Nouvelle entrée**
3. Renseignez :
   - Produit et quantité
   - Raison (défaut, casse, surproduction, rejet qualité)
   - Ordre de fabrication associé (optionnel)
   - Coût unitaire
4. Validez

### Suivi des Pertes

Les rebuts sont tracés avec :
- Coût total des pertes
- Taux de rebut par produit
- Identification des causes récurrentes

## 8. Sous-traitance

### Créer un Ordre de Sous-traitance

1. Accédez à **Production → Sous-traitance**
2. Cliquez sur **Nouvel ordre**
3. Définissez :
   - Fournisseur sous-traitant
   - Produit à fabriquer
   - Quantité et délai
   - Composants à envoyer au sous-traitant

### Suivi

Les statuts : `Brouillon` → `Envoyé` → `En cours` → `Terminé`

## 9. Planification de Production

### Créer un Plan de Production

1. Allez dans **Production → Planification**
2. Cliquez sur **Nouveau plan**
3. Définissez :
   - Produit à fabriquer
   - Quantité prévue
   - Date de production
   - Recette à utiliser

### Convertir en Ordre

Lorsque le plan est prêt :
1. Ouvrez le plan
2. Cliquez sur **Créer l'ordre de fabrication**
3. L'ordre est créé automatiquement avec toutes les données

## 10. Gestion des Équipements

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

## 11. Contrôle Qualité

### Créer une Inspection

1. Allez dans **Qualité → Inspections**
2. Cliquez sur **Nouvelle inspection**
3. Type d'inspection :
   - **Réception** : Matières premières reçues
   - **En cours** : Pendant la production
   - **Finale** : Produit fini
   - **Périodique** : Contrôle régulier du stock

### Résultats

- **Réussite** : Lot libéré automatiquement
- **Échec** : Lot mis en quarantaine
- **Conditionnel** : Nécessite validation manuelle

## 12. Bonnes Pratiques

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
- ✓ Déclarez tous les rebuts

### Maintenance

- ✓ Respectez les plannings de maintenance préventive
- ✓ Signalez immédiatement les pannes
- ✓ Documentez les interventions
- ✓ Suivez les indicateurs de performance équipements

---

**Dernière MAJ** : Avril 2026