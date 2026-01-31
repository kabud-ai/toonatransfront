import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, Settings } from 'lucide-react';

export default function AdminGuideDoc() {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <h1>Guide Administrateur</h1>

      <Alert className="my-4">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          En tant qu'administrateur, vous avez un accès complet au système. Votre rôle est de configurer le système, gérer les utilisateurs et superviser les opérations.
        </AlertDescription>
      </Alert>

      <h2>👥 Gestion des Utilisateurs</h2>

      <h3>Inviter un Nouvel Utilisateur</h3>
      <ol>
        <li>Allez dans <strong>Administration → Gestion des Utilisateurs</strong></li>
        <li>Cliquez sur <strong>Inviter un Utilisateur</strong></li>
        <li>Renseignez : Email, Nom complet, Rôle</li>
        <li>Cliquez sur <strong>Envoyer l'invitation</strong></li>
        <li>L'utilisateur recevra un email avec un lien</li>
      </ol>

      <h3>Modifier un Utilisateur</h3>
      <p>Dans la liste des utilisateurs, cliquez sur l'icône d'édition pour modifier le nom, rôle ou statut.</p>

      <h3>Désactiver un Utilisateur</h3>
      <p>Cliquez sur <strong>Actions → Désactiver</strong>. L'utilisateur ne pourra plus se connecter mais ses données sont conservées.</p>

      <h2>🔐 Gestion des Rôles et Permissions</h2>

      <h3>Créer un Nouveau Rôle</h3>
      <ol>
        <li>Allez dans <strong>Administration → Gestion des Rôles</strong></li>
        <li>Cliquez sur <strong>Nouveau Rôle</strong></li>
        <li>Renseignez :
          <ul>
            <li><strong>Nom</strong> : Nom descriptif (ex: "Opérateur Production")</li>
            <li><strong>Code</strong> : Code unique (ex: "production_operator")</li>
            <li><strong>Description</strong> : Description du rôle</li>
          </ul>
        </li>
        <li>Configurez les <strong>Permissions</strong> par module</li>
      </ol>

      <h3>Permissions par Module</h3>
      <div className="grid grid-cols-2 gap-4 not-prose my-4">
        <div className="border rounded-lg p-3">
          <h4 className="font-semibold mb-2">Dashboard</h4>
          <ul className="text-sm space-y-1">
            <li>✓ view - Voir le tableau de bord</li>
          </ul>
        </div>
        <div className="border rounded-lg p-3">
          <h4 className="font-semibold mb-2">Produits</h4>
          <ul className="text-sm space-y-1">
            <li>✓ view - Consulter</li>
            <li>✓ create - Créer</li>
            <li>✓ edit - Modifier</li>
            <li>✓ delete - Supprimer</li>
          </ul>
        </div>
        <div className="border rounded-lg p-3">
          <h4 className="font-semibold mb-2">Ordres de Fabrication</h4>
          <ul className="text-sm space-y-1">
            <li>✓ view, create, edit, delete</li>
            <li>✓ execute - Exécuter/valider</li>
          </ul>
        </div>
        <div className="border rounded-lg p-3">
          <h4 className="font-semibold mb-2">Inventaire</h4>
          <ul className="text-sm space-y-1">
            <li>✓ view, create, edit, delete</li>
            <li>✓ adjust - Ajuster quantités</li>
          </ul>
        </div>
        <div className="border rounded-lg p-3">
          <h4 className="font-semibold mb-2">Lots</h4>
          <ul className="text-sm space-y-1">
            <li>✓ view, create, edit, delete</li>
            <li>✓ quarantine - Mettre en quarantaine</li>
          </ul>
        </div>
        <div className="border rounded-lg p-3">
          <h4 className="font-semibold mb-2">Bons de Commande</h4>
          <ul className="text-sm space-y-1">
            <li>✓ view, create, edit, delete</li>
            <li>✓ approve - Approuver</li>
          </ul>
        </div>
      </div>

      <h3>Exemples de Rôles Préconfigurés</h3>
      
      <h4>🏭 Directeur de Production</h4>
      <ul>
        <li>Dashboard : ✓ view</li>
        <li>Produits, Recettes, BOM : ✓ all</li>
        <li>Ordres de Fabrication : ✓ all + execute</li>
        <li>Inventaire : ✓ view</li>
        <li>Rapports : ✓ view</li>
      </ul>

      <h4>📦 Gestionnaire d'Inventaire</h4>
      <ul>
        <li>Dashboard : ✓ view</li>
        <li>Produits : ✓ view</li>
        <li>Inventaire : ✓ all + adjust</li>
        <li>Entrepôts : ✓ all</li>
        <li>Lots : ✓ all + quarantine</li>
      </ul>

      <h4>🛒 Acheteur</h4>
      <ul>
        <li>Dashboard : ✓ view</li>
        <li>Fournisseurs : ✓ all</li>
        <li>Bons de Commande : ✓ all + approve</li>
        <li>Réceptions : ✓ all</li>
        <li>Inventaire : ✓ view</li>
      </ul>

      <h4>✅ Contrôleur Qualité</h4>
      <ul>
        <li>Dashboard : ✓ view</li>
        <li>Qualité : ✓ all + approve</li>
        <li>Lots : ✓ view + quarantine</li>
        <li>Ordres de Fabrication : ✓ view</li>
      </ul>

      <Alert className="my-4">
        <AlertDescription>
          ⚠️ <strong>Note</strong> : Les rôles système (Admin) ne peuvent pas être modifiés.
        </AlertDescription>
      </Alert>

      <h2>⚙️ Configuration Système</h2>

      <h3>Paramètres Généraux</h3>
      <p>Dans <strong>Configuration → Paramètres</strong>, onglet <strong>Général</strong> :</p>
      <ul>
        <li>Nom de l'entreprise</li>
        <li>Secteur d'activité</li>
        <li>Devise par défaut</li>
        <li>Fuseau horaire</li>
        <li>Format de date</li>
      </ul>

      <h3>Configuration des Modules</h3>
      <p>Onglet <strong>Modules</strong> : Activez/désactivez les modules selon vos besoins.</p>

      <h3>Apparence</h3>
      <p>Onglet <strong>Apparence</strong> : Configurez la couleur principale et le logo.</p>

      <h2>🏢 Gestion des Sites</h2>
      <ol>
        <li>Allez dans <strong>Configuration → Sites</strong></li>
        <li>Cliquez sur <strong>Nouveau Site</strong></li>
        <li>Renseignez : Nom, Adresse, Contact</li>
        <li>Les entrepôts peuvent ensuite être affectés aux sites</li>
      </ol>

      <h2>📊 Tableaux de Bord</h2>

      <h3>Widgets Disponibles pour Admin</h3>
      <ul>
        <li>Ordres de fabrication en cours</li>
        <li>Stock bas</li>
        <li>Commandes d'achat en attente</li>
        <li>Délais de production moyens</li>
        <li>Inspections qualité</li>
        <li>Valeur de l'inventaire</li>
        <li>Suggestions de réapprovisionnement</li>
      </ul>

      <h3>Personnalisation</h3>
      <ol>
        <li>Dashboard → <strong>Mon Tableau de Bord</strong></li>
        <li>Cliquez sur <strong>Personnaliser les widgets</strong></li>
        <li>Cochez les widgets souhaités</li>
        <li>Cliquez sur <strong>Enregistrer</strong></li>
      </ol>

      <h2>📈 Rapports et Audit</h2>

      <h3>Générer un Rapport d'Audit</h3>
      <ol>
        <li>Sur le Dashboard, cliquez sur <strong>Rapport d'Audit</strong></li>
        <li>Le système génère un PDF avec :
          <ul>
            <li>Statistiques de production</li>
            <li>État de l'inventaire</li>
            <li>Métriques qualité</li>
            <li>Statistiques par module</li>
          </ul>
        </li>
      </ol>

      <h2>🔍 Recherche Globale</h2>
      <p>Cliquez sur l'icône de recherche en haut à droite pour rechercher dans tous les modules avec filtres avancés.</p>

      <h2>🛠️ Maintenance et Support</h2>

      <h3>Bonnes Pratiques</h3>
      <ul>
        <li>✅ Sauvegarde automatique par Base44</li>
        <li>✅ Audit régulier des permissions</li>
        <li>✅ Formation des utilisateurs</li>
        <li>✅ Surveillance des alertes</li>
      </ul>

      <h3>Résolution de Problèmes</h3>
      <p><strong>Un utilisateur ne peut pas accéder à un module</strong></p>
      <ul>
        <li>Vérifiez les permissions du rôle</li>
        <li>Vérifiez que l'utilisateur est actif</li>
      </ul>

      <p><strong>Les widgets ne s'affichent pas</strong></p>
      <ul>
        <li>L'utilisateur doit personnaliser son dashboard</li>
        <li>Vérifiez les permissions du rôle</li>
      </ul>

      <h2>📋 Checklist Configuration Initiale</h2>
      <ul>
        <li>☐ Créer les sites de production</li>
        <li>☐ Créer les entrepôts</li>
        <li>☐ Définir les rôles personnalisés</li>
        <li>☐ Inviter les utilisateurs</li>
        <li>☐ Configurer les paramètres généraux</li>
        <li>☐ Importer les produits</li>
        <li>☐ Importer les fournisseurs</li>
        <li>☐ Configurer les seuils d'alerte</li>
        <li>☐ Tester les permissions</li>
        <li>☐ Former les utilisateurs</li>
      </ul>

      <h2>🎓 Formation des Utilisateurs</h2>
      <ul>
        <li>Organisez des sessions par rôle</li>
        <li>Fournissez les guides appropriés</li>
        <li>Créez un environnement de test</li>
        <li>Encouragez les retours utilisateurs</li>
      </ul>

      <hr />
      <p className="text-sm text-muted-foreground">
        Consultez les autres guides pour comprendre les cas d'usage de chaque rôle.
      </p>
    </div>
  );
}