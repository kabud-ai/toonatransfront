import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Factory } from 'lucide-react';

export default function ProductionGuideDoc() {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <h1>Guide Directeur de Production</h1>

      <Alert className="my-4">
        <Factory className="h-4 w-4" />
        <AlertDescription>
          En tant que Directeur de Production, vous gérez la planification et le suivi de la fabrication.
        </AlertDescription>
      </Alert>

      <h2>📊 Votre Tableau de Bord</h2>

      <h3>Widgets Recommandés</h3>
      <ul>
        <li><strong>Ordres de fabrication en cours</strong> : Vue temps réel</li>
        <li><strong>Délais de production moyens</strong> : Suivi des performances</li>
        <li><strong>Inspections qualité</strong> : Résumé des contrôles</li>
        <li><strong>Ordres récents</strong> : Derniers ordres créés</li>
      </ul>

      <h3>Personnalisation</h3>
      <ol>
        <li>Dashboard → <strong>Mon Tableau de Bord</strong></li>
        <li>Cliquez sur <strong>Personnaliser les widgets</strong></li>
        <li>Sélectionnez vos widgets préférés</li>
        <li>Cliquez sur <strong>Enregistrer</strong></li>
      </ol>

      <h2>🏭 Gestion des Ordres de Fabrication</h2>

      <h3>Créer un Ordre de Fabrication</h3>
      <ol>
        <li>Allez dans <strong>Production → Ordres de Fabrication</strong></li>
        <li>Cliquez sur <strong>Créer un Ordre</strong></li>
        <li>Renseignez :
          <ul>
            <li><strong>Numéro d'ordre</strong> : Auto-généré ou manuel</li>
            <li><strong>Produit</strong> : Produit à fabriquer</li>
            <li><strong>Quantité</strong> : À produire</li>
            <li><strong>Entrepôt</strong> : Lieu de production</li>
            <li><strong>Recette</strong> : Recette à utiliser</li>
            <li><strong>Dates planifiées</strong> : Début et fin</li>
          </ul>
        </li>
        <li>Cliquez sur <strong>Créer</strong></li>
      </ol>

      <h3>Statuts des Ordres</h3>
      <div className="grid grid-cols-2 gap-3 not-prose my-4">
        <div className="border rounded-lg p-3">
          <div className="font-semibold">Brouillon</div>
          <p className="text-sm text-muted-foreground">Ordre en cours de création</p>
        </div>
        <div className="border rounded-lg p-3">
          <div className="font-semibold">Planifié</div>
          <p className="text-sm text-muted-foreground">Validé, en attente</p>
        </div>
        <div className="border rounded-lg p-3">
          <div className="font-semibold">En cours</div>
          <p className="text-sm text-muted-foreground">Production en cours</p>
        </div>
        <div className="border rounded-lg p-3">
          <div className="font-semibold">Terminé</div>
          <p className="text-sm text-muted-foreground">Production achevée</p>
        </div>
      </div>

      <h3>Démarrer un Ordre</h3>
      <ol>
        <li>Trouvez l'ordre <strong>Planifié</strong> ou <strong>Confirmé</strong></li>
        <li>Cliquez sur <strong>Actions → Démarrer</strong></li>
        <li>Le statut passe à <strong>En cours</strong></li>
        <li>Les matières premières sont consommées automatiquement</li>
      </ol>

      <h3>Terminer un Ordre</h3>
      <ol>
        <li>Trouvez l'ordre <strong>En cours</strong></li>
        <li>Cliquez sur <strong>Actions → Terminer</strong></li>
        <li>Le système :
          <ul>
            <li>Crée les lots de produits finis</li>
            <li>Met à jour les stocks</li>
            <li>Calcule les coûts réels</li>
            <li>Change le statut à <strong>Terminé</strong></li>
          </ul>
        </li>
      </ol>

      <h2>📋 Gestion des Recettes</h2>

      <h3>Créer une Recette</h3>
      <ol>
        <li>Allez dans <strong>Production → Recettes</strong></li>
        <li>Cliquez sur <strong>Nouvelle Recette</strong></li>
        <li>Renseignez : Titre, Code, Type, Description</li>
        <li>Ajoutez les <strong>Étapes de Production</strong> :
          <ul>
            <li>Cliquez sur <strong>Ajouter une étape</strong></li>
            <li>Décrivez l'étape</li>
            <li>Ajoutez les composants :
              <ul>
                <li>Matière première</li>
                <li>Quantité</li>
                <li>Unité</li>
              </ul>
            </li>
          </ul>
        </li>
        <li>Cliquez sur <strong>Enregistrer</strong></li>
      </ol>

      <h3>Versions de Recettes</h3>
      <ul>
        <li>Chaque modification crée une nouvelle version</li>
        <li>Historique dans <strong>Production → Historique des Recettes</strong></li>
        <li>Possibilité de restaurer une ancienne version</li>
      </ul>

      <h3>Coûts</h3>
      <p>Le coût est calculé automatiquement selon :</p>
      <ul>
        <li>Quantités de matières premières</li>
        <li>Coûts unitaires des matières</li>
      </ul>

      <h2>🔧 Nomenclatures (BOM)</h2>

      <h3>Créer une Nomenclature</h3>
      <ol>
        <li>Allez dans <strong>Production → Nomenclatures</strong></li>
        <li>Cliquez sur <strong>Nouvelle Nomenclature</strong></li>
        <li>Renseignez :
          <ul>
            <li><strong>Nom</strong> : Nom descriptif</li>
            <li><strong>Produit de sortie</strong> : Produit fini</li>
            <li><strong>Quantité de sortie</strong> : Quantité produite</li>
          </ul>
        </li>
        <li>Ajoutez les <strong>Composants</strong> avec quantités</li>
        <li>Le coût est calculé automatiquement</li>
      </ol>

      <h3>BOM Multi-niveaux</h3>
      <p>Un composant peut avoir sa propre BOM. Le système calcule les besoins en cascade.</p>

      <h2>📅 Planification de Production</h2>

      <h3>Créer un Plan</h3>
      <ol>
        <li>Allez dans <strong>Production → Plans de Production</strong></li>
        <li>Cliquez sur <strong>Nouveau Plan</strong></li>
        <li>Renseignez : Produit, Recette, Quantité, Date</li>
        <li>Le coût estimé est calculé</li>
      </ol>

      <h3>Vue Gantt</h3>
      <p>Dashboard → <strong>Planification</strong> : Visualisez tous les ordres sur une ligne de temps.</p>

      <h2>📦 Gestion des Stocks</h2>

      <h3>Vérifier la Disponibilité</h3>
      <p>Avant de créer un ordre :</p>
      <ol>
        <li>Allez dans <strong>Inventaire → Niveaux de Stock</strong></li>
        <li>Vérifiez les matières premières nécessaires</li>
        <li>Si insuffisant, contactez les achats</li>
      </ol>

      <h3>Consommation et Production</h3>
      <ul>
        <li><strong>Au démarrage</strong> : Matières consommées automatiquement</li>
        <li><strong>À la fin</strong> : Lots de produits finis créés automatiquement</li>
        <li>Mouvements de stock enregistrés</li>
        <li>Traçabilité complète</li>
      </ul>

      <h2>✅ Contrôle Qualité</h2>

      <h3>Inspections</h3>
      <ul>
        <li>Inspections automatiques en fin d'ordre</li>
        <li>Consultez dans <strong>Qualité → Inspections</strong></li>
        <li>Vérifiez que les lots sont validés</li>
      </ul>

      <h3>Indicateurs</h3>
      <p>Sur votre dashboard :</p>
      <ul>
        <li><strong>Taux de réussite</strong> : % inspections réussies</li>
        <li><strong>En attente</strong> : Inspections à traiter</li>
        <li><strong>Non-conformités</strong> : Problèmes identifiés</li>
      </ul>

      <h2>📈 Rapports et KPI</h2>

      <h3>KPI Disponibles</h3>
      <p>Dashboard → <strong>KPIs & Analytiques</strong> :</p>
      <ul>
        <li><strong>TRG</strong> : Taux de Rendement Global</li>
        <li><strong>Débit</strong> : Production par jour</li>
        <li><strong>Temps de cycle</strong> : Temps moyen</li>
        <li><strong>Taux de rebut</strong> : Pertes</li>
        <li><strong>Livraison à temps</strong> : % dans les délais</li>
      </ul>

      <h3>Export</h3>
      <p>Dashboard → <strong>Rapport d'Audit</strong> pour télécharger un PDF complet.</p>

      <h2>🛠️ Bonnes Pratiques</h2>

      <h3>Planification</h3>
      <ul>
        <li>✅ Planifiez à l'avance</li>
        <li>✅ Vérifiez les stocks avant création</li>
        <li>✅ Utilisez la vue Gantt pour optimiser</li>
        <li>✅ Communiquez avec les achats</li>
      </ul>

      <h3>Recettes</h3>
      <ul>
        <li>✅ Documentez clairement chaque étape</li>
        <li>✅ Codes cohérents</li>
        <li>✅ Testez avant production série</li>
        <li>✅ Conservez l'historique</li>
      </ul>

      <h3>Suivi</h3>
      <ul>
        <li>✅ Dashboard quotidien</li>
        <li>✅ Traitez les alertes rapidement</li>
        <li>✅ Vérifiez les inspections qualité</li>
        <li>✅ Analysez les KPI hebdomadairement</li>
      </ul>

      <h2>❓ Problèmes Courants</h2>

      <p><strong>Impossible de démarrer un ordre</strong></p>
      <ul>
        <li>Vérifiez le stock de matières premières</li>
        <li>Vérifiez le statut (doit être Planifié ou Confirmé)</li>
      </ul>

      <p><strong>Coût de recette incorrect</strong></p>
      <ul>
        <li>Vérifiez les prix unitaires des matières</li>
        <li>Recalculez en sauvegardant à nouveau</li>
      </ul>

      <p><strong>Lots non créés</strong></p>
      <ul>
        <li>Vérifiez que le produit nécessite un suivi par lot</li>
        <li>Assurez-vous que l'ordre est terminé</li>
      </ul>

      <hr />
      <p className="text-sm text-muted-foreground">
        Pour plus d'informations, consultez les guides Inventaire et Qualité.
      </p>
    </div>
  );
}