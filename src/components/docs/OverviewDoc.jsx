import React from 'react';
import { Badge } from '@/components/ui/badge';

export default function OverviewDoc() {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <h1>📋 Documentation Système ERP</h1>
      
      <p>Système ERP complet pour la gestion de production industrielle intégrant la fabrication, l'inventaire, les ventes, les achats, la qualité, la maintenance et l'administration.</p>

      <h2>🏗️ Modules Principaux</h2>
      
      <div className="grid grid-cols-2 gap-4 not-prose my-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">🏭 Production</h3>
          <p className="text-sm text-muted-foreground">Ordres de fabrication, recettes, nomenclatures, planification</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">📦 Inventaire</h3>
          <p className="text-sm text-muted-foreground">Gestion stocks, traçabilité lots, alertes</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">💰 Ventes</h3>
          <p className="text-sm text-muted-foreground">Commandes clients, facturation, suivi livraisons</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">🛒 Achats</h3>
          <p className="text-sm text-muted-foreground">Commandes, fournisseurs, réceptions</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">✅ Qualité</h3>
          <p className="text-sm text-muted-foreground">Inspections, contrôles, traçabilité</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">🔧 Maintenance</h3>
          <p className="text-sm text-muted-foreground">Préventive, corrective, équipements</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">👥 Administration</h3>
          <p className="text-sm text-muted-foreground">Utilisateurs, rôles, permissions</p>
        </div>
      </div>

      <h2>🚀 Démarrage Rapide</h2>
      
      <h3>Première Connexion</h3>
      <ol>
        <li>Recevez l'email d'invitation</li>
        <li>Créez votre mot de passe</li>
        <li>Personnalisez votre tableau de bord</li>
        <li>Consultez le guide correspondant à votre rôle</li>
      </ol>

      <h3>Navigation</h3>
      <ul>
        <li><strong>Menu latéral</strong> : Accès modules selon permissions</li>
        <li><strong>Recherche globale</strong> : Icône recherche en haut à droite</li>
        <li><strong>Notifications</strong> : Icône cloche</li>
        <li><strong>Profil</strong> : Cliquez sur votre nom</li>
      </ul>

      <h2>🌍 Langues Supportées</h2>
      <div className="flex gap-2 not-prose">
        <Badge>🇫🇷 Français</Badge>
        <Badge>🇬🇧 Anglais</Badge>
        <Badge>🇸🇦 Arabe</Badge>
      </div>

      <h2>🔐 Sécurité</h2>
      <ul>
        <li>Permissions granulaires par module et action</li>
        <li>Rôles personnalisables</li>
        <li>Audit trail complet</li>
        <li>Données chiffrées</li>
      </ul>

      <h2>📊 Technologies</h2>
      <ul>
        <li><strong>Frontend</strong> : React 18, Tailwind CSS, Shadcn/ui</li>
        <li><strong>Backend</strong> : Base44 Platform (BaaS)</li>
        <li><strong>État</strong> : TanStack Query</li>
        <li><strong>Graphiques</strong> : Recharts</li>
      </ul>

      <h2>📱 Accès Mobile</h2>
      <p>L'application est responsive et s'adapte aux écrans mobiles et tablettes.</p>

      <h2>❓ Aide et Support</h2>
      <p>Pour toute question :</p>
      <ol>
        <li>Consultez le guide correspondant à votre rôle</li>
        <li>Utilisez la fonction de recherche</li>
        <li>Contactez votre administrateur système</li>
      </ol>

      <hr />
      <p className="text-sm text-muted-foreground">
        <strong>Version</strong> : 1.1.0 | <strong>Dernière MAJ</strong> : Avril 2026
      </p>
    </div>
  );
}