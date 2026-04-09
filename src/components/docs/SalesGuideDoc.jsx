import React from 'react';
import { Badge } from '@/components/ui/badge';

export default function SalesGuideDoc() {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <h1>💰 Guide Ventes</h1>
      
      <p>Ce guide est destiné aux commerciaux, responsables des ventes et gestionnaires de commandes clients. Il couvre la création et le suivi des commandes, la facturation et les statistiques commerciales.</p>

      <h2>1. Tableau de Bord Ventes</h2>

      <p>Le dashboard principal affiche les indicateurs de vente en temps réel :</p>
      <ul>
        <li><strong>Chiffre d'affaires</strong> : Total des commandes livrées</li>
        <li><strong>Commandes en cours</strong> : Commandes confirmées + expédiées</li>
        <li><strong>Total commandes</strong> : Toutes statuts confondus</li>
        <li><strong>Dernières commandes</strong> : Les 5 commandes les plus récentes</li>
      </ul>

      <h2>2. Créer une Commande de Vente</h2>

      <ol>
        <li>Accédez à <strong>Ventes → Commandes de Vente</strong></li>
        <li>Cliquez sur <strong>Nouvelle commande</strong></li>
        <li>Renseignez les informations client (nom, email, téléphone, adresse)</li>
        <li>Sélectionnez l'<strong>entrepôt source</strong></li>
        <li>Ajoutez les lignes de commande (produit, quantité, prix, remise)</li>
        <li>Configurez la TVA et le mode de paiement</li>
        <li>Cliquez sur <strong>Créer la commande</strong></li>
      </ol>

      <blockquote>
        <p>Le numéro de commande est généré automatiquement (ex: <code>CMD-A1B2C3</code>)</p>
      </blockquote>

      <h2>3. Cycle de Vie d'une Commande</h2>

      <div className="not-prose overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th className="border p-2 text-left">Statut</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Actions possibles</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2"><Badge variant="secondary">Brouillon</Badge></td>
              <td className="border p-2">En cours de préparation</td>
              <td className="border p-2">Confirmer, Annuler</td>
            </tr>
            <tr>
              <td className="border p-2"><Badge className="bg-blue-100 text-blue-800">Confirmé</Badge></td>
              <td className="border p-2">Validé, prêt à expédier</td>
              <td className="border p-2">Expédier, Annuler</td>
            </tr>
            <tr>
              <td className="border p-2"><Badge className="bg-amber-100 text-amber-800">Expédié</Badge></td>
              <td className="border p-2">En transit — <strong>stock déduit</strong></td>
              <td className="border p-2">Marquer livré</td>
            </tr>
            <tr>
              <td className="border p-2"><Badge className="bg-green-100 text-green-800">Livré</Badge></td>
              <td className="border p-2">Commande clôturée</td>
              <td className="border p-2">Imprimer facture</td>
            </tr>
            <tr>
              <td className="border p-2"><Badge className="bg-red-100 text-red-800">Annulé</Badge></td>
              <td className="border p-2">Commande annulée</td>
              <td className="border p-2">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>4. Expédition et Impact sur le Stock</h2>

      <p>Lors de l'expédition (<strong>Confirmé → Expédié</strong>) :</p>
      <ul>
        <li>Les quantités sont <strong>déduites automatiquement</strong> du stock de l'entrepôt source</li>
        <li>Un mouvement de stock de type <em>Sortie</em> est enregistré pour chaque ligne</li>
        <li>La référence à la commande est conservée dans l'historique des mouvements</li>
      </ul>

      <blockquote>
        <p>⚠️ Vérifiez la disponibilité du stock avant d'expédier. En cas de stock insuffisant, une alerte sera affichée.</p>
      </blockquote>

      <h2>5. Modes de Paiement</h2>

      <ul>
        <li>💵 <strong>Espèces</strong> : Paiement comptant</li>
        <li>🏦 <strong>Virement bancaire</strong> : Transfert bancaire</li>
        <li>📄 <strong>Chèque</strong> : Paiement par chèque</li>
        <li>💳 <strong>Carte bancaire</strong> : Paiement par carte</li>
        <li>📝 <strong>Autre</strong> : Modalité personnalisée</li>
      </ul>

      <p>Statuts de paiement : <strong>Non payé</strong> / <strong>Partiel</strong> / <strong>Payé</strong></p>

      <h2>6. Facturation et Impression</h2>

      <ol>
        <li>Ouvrez la commande de vente</li>
        <li>Cliquez sur <strong>Imprimer la facture</strong> 🖨️</li>
        <li>Une fenêtre d'impression s'ouvre avec la facture formatée</li>
        <li>Imprimez ou sauvegardez en PDF</li>
      </ol>

      <p>La facture inclut : en-tête, infos client, tableau des lignes, totaux HT/TVA/TTC, mode de paiement et notes.</p>

      <h2>7. Bonnes Pratiques</h2>

      <ul>
        <li>✓ Vérifiez la disponibilité du stock avant confirmation</li>
        <li>✓ Renseignez toujours l'adresse de livraison</li>
        <li>✓ Mettez à jour le statut à chaque étape du cycle de vie</li>
        <li>✓ Imprimez et transmettez la facture à la livraison</li>
        <li>✓ Confirmez le statut de paiement dès réception</li>
        <li>✓ Coordonnez avec le service stock pour les ruptures</li>
      </ul>

      <hr />
      <p className="text-sm text-muted-foreground">
        <strong>Version</strong> : 1.1.0 | <strong>Dernière MAJ</strong> : Avril 2026
      </p>
    </div>
  );
}