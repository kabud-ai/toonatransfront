
# Rapport de découverte — projet "toonatransfront-1"

Date: 31 janvier 2026

## Résumé rapide
- Application frontend React + Vite destinée à la gestion manufacturière (plateforme Base44).
- Entrée principale : `src/main.jsx`. Routage et pages configurés via `src/pages.config.js` et `src/App.jsx`.

## Stack & outils
- React 18, Vite, Tailwind CSS
- @tanstack/react-query (caching), react-router-dom (routing)
- SDK & intégration : `@base44/sdk`
- Charts : `recharts`
- Notifications : `sonner`
- Linting : ESLint, configuration moderne

## Scripts utiles
- `npm install` — installer dépendances
- `npm run dev` — lancer le dev server (Vite)
- `npm run build` — build de production
- `npm run lint` — lancer ESLint

## Structure importante (chemins clés)
- `src/main.jsx` — point d'entrée
- `src/App.jsx` — providers (Auth, QueryClient), Router
- `src/pages.config.js` — map des pages et layout
- `src/Layout.jsx` — layout global (Sidebar, Header, theme)
- `src/api/base44Client.js` — init `@base44/sdk`
- `src/api/apiClient.js` — (VIDE) wrapper API attendu
- `src/lib/AuthContext.jsx` — gestion auth / app settings
- `src/lib/query-client.js` — config React Query
- `src/components/` — UI et composants réutilisables

## Observations importantes
- `src/api/apiClient.js` est vide : prévoir implémentation d'un client HTTP/wrapper (axios/fetch) ou utiliser directement `base44`.
- Auth : `AuthContext` vérifie les settings publics et appelle `base44.auth.me()` ; gère `auth_required` et `user_not_registered`.
- i18n : implémentation client simple (`components/i18n`), traductions FR/EN/AR disponibles.
- `unityConverter.jsx` : conversion d'unités basique (kg/g/t, L/ml, m/cm). Fonctionnelle mais limitée (pas de conversions masse↔volume par densité).
- TODO détecté : `src/pages/Inventory.jsx` a un commentaire `// TODO: Search for product/lot by code`.
- Tests : pas de framework de tests détecté (aucun fichier de tests, pas de config Vitest/Jest).

## Risques & points d'attention
- Dépendance au SDK Base44 : vérifier variables d'environnement `VITE_BASE44_APP_ID` / `VITE_BASE44_APP_BASE_URL` avant d'exécuter.
- `apiClient.js` absent peut compliquer les wrappers, la gestion d'erreurs et les mocks pour tests.
- Pas de tests automatiques : risque de régressions.

## Recommandations immédiates (priorité)
1. Implémenter ou clarifier `src/api/apiClient.js` (wrapper axios avec baseURL, gestion token).  
2. Ajouter une suite minimaliste de tests (Vitest + React Testing Library) et un test pour `AuthContext` et `convertUnity`.  
3. Traiter le TODO dans `src/pages/Inventory.jsx` (scan → recherche produit/lot).  
4. Vérifier `.env` et variables `VITE_BASE44_*` localement (ne pas committer de tokens).  
5. Ajouter lazy-loading des pages (performance) et couverture de tests pour pages critiques (Dashboard, Inventory).

## Commandes rapides
```bash
npm install
npm run dev
```

## 5 fichiers à consulter en priorité
1. `src/lib/AuthContext.jsx` — logique d'auth et erreurs (auth_required / user_not_registered)
2. `src/api/base44Client.js` — initialisation SDK Base44
3. `src/api/apiClient.js` — (à implémenter) wrapper API
4. `src/App.jsx` — point d'assemblage, providers et routage
5. `src/pages/Inventory.jsx` — TODO critique lié au scanner

---
Fichier généré rapidement sur demande. Si vous voulez, je peux créer un `apiClient` basique et/ou ajouter un test pour `convertUnity` maintenant.
