import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package } from 'lucide-react';

export default function InventoryGuideDoc() {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <h1>Guide Gestionnaire d'Inventaire</h1>

      <Alert className="my-4">
        <Package className="h-4 w-4" />
        <AlertDescription>
          Vous gérez le suivi des stocks, la traçabilité des lots, les alertes et le réapprovisionnement.
        </AlertDescription>
      </Alert>

      <h2>📊 Votre Tableau de Bord</h2>

      <h3>Widgets Recommandés</h3>
      <ul>
        <li><strong>Stock bas</strong> : Produits sous le seuil</li>
        <li><strong>Valeur de l'inventaire</strong> : Valeur totale</li>
        <li><strong>Suggestions de réapprovisionnement</strong> : Alertes automatiques</li>
        <li><strong>Ordres de fabrication</strong> : Pour anticiper les besoins</li>
      </ul>

      <h2>📦 Gestion des Stocks</h2>

      <h3>Vue d'ensemble</h3>
      <p><strong>Inventaire → Niveaux de Stock</strong></p>
      <p>Pour chaque produit, vous voyez :</p>
      <ul>
        <li><strong>Quantité disponible</strong></li>
        <li><strong>Quantité réservée</strong> (ordres de fabrication)</li>
        <li><strong>Valeur</strong> (quantité × coût)</li>
        <li><strong>Entrepôt</strong></li>
        <li><strong>Alertes</strong> (icône si stock bas)</li>
      </ul>

      <h3>Configurer les Seuils</h3>
      <p><strong>Inventaire → Alertes de Stock</strong></p>
      <p>Pour chaque produit :</p>
      <ul>
        <li><strong>Seuil minimum</strong> : Alerte si en dessous</li>
        <li><strong>Seuil maximum</strong> : Alerte surstock</li>
        <li><strong>Point de réapprovisionnement</strong> : Déclenche suggestion</li>
        <li><strong>Quantité de réapprovisionnement</strong> : Quantité suggérée</li>
      </ul>

      <h3>Types d'Alertes</h3>
      <div className="grid grid-cols-2 gap-3 not-prose my-4">
        <div className="border rounded-lg p-3 bg-red-50 border-red-200">
          <div className="font-semibold text-red-900">🔴 Critique</div>
          <p className="text-sm text-red-700">Stock à zéro ou négatif</p>
        </div>
        <div className="border rounded-lg p-3 bg-orange-50 border-orange-200">
          <div className="font-semibold text-orange-900">🟠 Stock bas</div>
          <p className="text-sm text-orange-700">En dessous du seuil minimum</p>
        </div>
        <div className="border rounded-lg p-3 bg-yellow-50 border-yellow-200">
          <div className="font-semibold text-yellow-900">🟡 Réappro</div>
          <p className="text-sm text-yellow-700">Point de réapprovisionnement</p>
        </div>
        <div className="border rounded-lg p-3 bg-purple-50 border-purple-200">
          <div className="font-semibold text-purple-900">🟣 Surstock</div>
          <p className="text-sm text-purple-700">Au-dessus du seuil maximum</p>
        </div>
      </div>

      <h2>📝 Mouvements de Stock</h2>

      <h3>Enregistrer un Mouvement</h3>
      <ol>
        <li><strong>Inventaire → Niveaux de Stock</strong></li>
        <li>Cliquez sur <strong>Enregistrer un Mouvement</strong></li>
        <li>Sélectionnez le <strong>Type</strong> :
          <ul>
            <li><strong>Entrée</strong> : Ajout de stock</li>
            <li><strong>Sortie</strong> : Retrait</li>
            <li><strong>Transfert</strong> : Entre entrepôts</li>
            <li><strong>Ajustement</strong> : Correction après inventaire</li>
          </ul>
        </li>
        <li>Produit, Quantité, Entrepôt, Lot, Notes</li>
        <li>Cliquez sur <strong>Enregistrer</strong></li>
      </ol>

      <h3>Mouvements Automatiques</h3>
      <p>Créés automatiquement lors de :</p>
      <ul>
        <li>Réception de marchandises → Entrée</li>
        <li>Démarrage ordre fabrication → Sortie matières</li>
        <li>Fin ordre fabrication → Entrée produits finis</li>
        <li>Mise en quarantaine → Transfert</li>
      </ul>

      <h2>🏷️ Traçabilité des Lots</h2>

      <h3>Qu'est-ce qu'un Lot ?</h3>
      <p>Un ensemble de produits :</p>
      <ul>
        <li>Fabriqués ensemble (même ordre)</li>
        <li>Ou reçus ensemble (même réception)</li>
        <li>Identifiés par numéro unique</li>
        <li>Traçables individuellement</li>
      </ul>

      <h3>Consulter les Lots</h3>
      <p><strong>Inventaire → Traçabilité des Lots</strong></p>
      <p>Informations disponibles :</p>
      <ul>
        <li>Numéro de lot</li>
        <li>Produit</li>
        <li>Quantités (initiale/actuelle)</li>
        <li>Entrepôt</li>
        <li>Dates (fabrication, expiration)</li>
        <li>Statut (disponible, réservé, quarantaine, expiré)</li>
        <li>Statut qualité (approuvé, rejeté, en attente)</li>
      </ul>

      <h3>Historique d'un Lot</h3>
      <ol>
        <li>Cliquez sur un lot</li>
        <li>Onglet <strong>Mouvements</strong></li>
        <li>Vous voyez tous les déplacements avec dates, quantités, références</li>
      </ol>

      <h3>Mettre en Quarantaine</h3>
      <ol>
        <li>Trouvez le lot concerné</li>
        <li>Cliquez sur <strong>Actions → Mettre en quarantaine</strong></li>
        <li>Le statut change à <strong>Quarantaine</strong></li>
        <li>Le stock n'est plus disponible</li>
        <li>Un mouvement est créé automatiquement</li>
      </ol>

      <h3>Libérer de Quarantaine</h3>
      <p>Après validation qualité :</p>
      <ol>
        <li><strong>Actions → Libérer de quarantaine</strong></li>
        <li>Le lot redevient <strong>Disponible</strong></li>
      </ol>

      <h2>🏢 Gestion des Entrepôts</h2>

      <h3>Créer un Entrepôt</h3>
      <ol>
        <li><strong>Inventaire → Entrepôts</strong></li>
        <li>Cliquez sur <strong>Ajouter un Entrepôt</strong></li>
        <li>Renseignez : Nom, Code, Adresse, Site</li>
        <li>Cliquez sur <strong>Enregistrer</strong></li>
      </ol>

      <h3>Vue par Entrepôt</h3>
      <ul>
        <li>Consultez le stock de chaque entrepôt</li>
        <li>Comparez les niveaux</li>
        <li>Identifiez les besoins de transfert</li>
      </ul>

      <h2>🔄 Réapprovisionnement Automatique</h2>

      <h3>Générer des Suggestions</h3>
      <ol>
        <li><strong>Achats → Réapprovisionnement Automatique</strong></li>
        <li>Cliquez sur <strong>Générer les suggestions</strong></li>
        <li>Le système analyse :
          <ul>
            <li>Stocks actuels vs seuils</li>
            <li>Consommation récente</li>
            <li>Ordres de fabrication en cours</li>
          </ul>
        </li>
      </ol>

      <h3>Consulter les Suggestions</h3>
      <p>Chaque suggestion contient :</p>
      <ul>
        <li>Produit à commander</li>
        <li>Stock actuel</li>
        <li>Quantité suggérée</li>
        <li>Fournisseur préféré</li>
        <li>Coût estimé</li>
        <li>Priorité (basse → critique)</li>
      </ul>

      <h3>Approuver une Suggestion</h3>
      <ol>
        <li>Examinez la suggestion</li>
        <li>Ajustez la quantité si nécessaire</li>
        <li>Cliquez sur <strong>Approuver</strong></li>
        <li>Un bon de commande est créé automatiquement</li>
      </ol>

      <h2>📊 Rapports et Analyses</h2>

      <h3>Valeur de l'Inventaire</h3>
      <p>Widget dashboard : Valeur totale = Σ (quantité × coût unitaire)</p>

      <h3>Rotation des Stocks</h3>
      <p>Identifiez :</p>
      <ul>
        <li><strong>Forte rotation</strong> : Bonne gestion</li>
        <li><strong>Faible rotation</strong> : Risque surstock</li>
        <li><strong>Produits obsolètes</strong></li>
      </ul>

      <h3>Analyse ABC</h3>
      <ul>
        <li><strong>A</strong> : Forte valeur, prioritaire</li>
        <li><strong>B</strong> : Valeur moyenne</li>
        <li><strong>C</strong> : Faible valeur, gestion simplifiée</li>
      </ul>

      <h2>🔍 Inventaires Physiques</h2>

      <h3>Enregistrer les Comptages</h3>
      <ol>
        <li>Notez les quantités réelles</li>
        <li>Comparez avec le système</li>
        <li>Pour chaque écart :
          <ul>
            <li><strong>Inventaire → Mouvements</strong></li>
            <li>Créez un mouvement <strong>Ajustement</strong></li>
            <li>Ajustez la quantité (+ ou -)</li>
            <li>Notez la raison</li>
          </ul>
        </li>
      </ol>

      <h2>🎯 Bonnes Pratiques</h2>

      <h3>Gestion Quotidienne</h3>
      <ul>
        <li>✅ Consultez les alertes chaque matin</li>
        <li>✅ Traitez les suggestions de réapprovisionnement</li>
        <li>✅ Vérifiez les lots proches expiration</li>
        <li>✅ Suivez les mouvements de la journée</li>
      </ul>

      <h3>Configuration</h3>
      <ul>
        <li>✅ Seuils réalistes basés sur consommation</li>
        <li>✅ Revoyez trimestriellement</li>
        <li>✅ Fournisseurs préférés dans catalogue</li>
        <li>✅ Coûts unitaires à jour</li>
      </ul>

      <h3>Traçabilité</h3>
      <ul>
        <li>✅ Suivi par lot pour produits critiques</li>
        <li>✅ Vérifiez dates expiration</li>
        <li>✅ Documentez les quarantaines</li>
        <li>✅ Utilisez les notes</li>
      </ul>

      <h2>❓ Problèmes Courants</h2>

      <p><strong>Stock négatif</strong></p>
      <ul>
        <li>Créez un ajustement pour corriger</li>
        <li>Identifiez la cause</li>
        <li>Prévenez la production</li>
      </ul>

      <p><strong>Lot non trouvé</strong></p>
      <ul>
        <li>Vérifiez l'orthographe</li>
        <li>Utilisez la recherche globale</li>
        <li>Peut avoir été consommé entièrement</li>
      </ul>

      <p><strong>Suggestions incorrectes</strong></p>
      <ul>
        <li>Vérifiez les seuils configurés</li>
        <li>Vérifiez les quantités réservées</li>
        <li>Régénérez les suggestions</li>
      </ul>

      <hr />
      <p className="text-sm text-muted-foreground">
        Consultez le guide Acheteur pour le processus de commande.
      </p>
    </div>
  );
}