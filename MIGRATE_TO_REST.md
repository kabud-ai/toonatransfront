# MIGRATE_TO_REST — Plan de migration vers API REST

Date: 31 janvier 2026

## Résumé
- But : Remplacer l'usage direct de `@base44/sdk` par une couche d'abstraction HTTP REST pour pouvoir changer de backend sans modifier la logique métier des pages.
- Point d'insertion principal : [src/api/apiClient.js](src/api/apiClient.js) (wrapper / factory).
- Fichiers clés : [src/api/base44Client.js](src/api/base44Client.js), [src/lib/AuthContext.jsx](src/lib/AuthContext.jsx), [DISCOVERY_REPORT.md](DISCOVERY_REPORT.md).

## Objectifs
- Masquer la source des données (SDK vs REST) derrière une API client unique.
- Conserver l'API consommée par les pages autant que possible.
- Ajouter un flag `VITE_API_PROVIDER` pour choisir `base44` ou `rest`.
- Centraliser la normalisation des réponses et la gestion d'erreurs/auth.

## Approche générale
1. Implémenter une "adapter factory" dans `src/api/apiClient.js` qui exporte la même surface (`auth`, `entities`, helpers) que le code actuel consomme.
2. Fournir deux implémentations :
   - `sdkProvider` : wrapper minimal autour de `base44`.
   - `restProvider` : client REST (fetch/axios) qui normalise les réponses.
3. Migrer par étapes : tests unitaires → staging → production.

## Phases détaillées

### 1) Préparation
- Créer une branche `migrate/rest-adapter`.
- Ajouter dans la doc et `.env` :
  - `VITE_API_PROVIDER=base44` (par défaut)
  - `VITE_REST_BASE_URL=https://api.example.com`
- Documenter la stratégie dans ce fichier.

### 2) Implémentation du client adaptateur (core)
- Éditer [src/api/apiClient.js](src/api/apiClient.js).
- Factory : instancier `sdkProvider` ou `restProvider` selon `import.meta.env.VITE_API_PROVIDER`.
- Surface exposée minimale (compatibilité avec code existant) :
  - `auth`: `me()`, `login()`, `logout()`, `redirectToLogin()`
  - `entities.<Entity>`: `list(params)`, `get(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `search(query)`

### 3) Implémentation `sdkProvider`
- Wrapper autour de [src/api/base44Client.js](src/api/base44Client.js).
- Mappe directement `base44.auth.*` et `base44.entities.*` vers la surface `apiClient`.
- Normaliser erreurs en `{ type, message, code }`.

### 4) Implémentation `restProvider`
- Client HTTP : `fetch` (ou `axios` si préféré).
- Auth :
  - Header `Authorization: Bearer <token>` (token depuis `src/lib/app-params.js`).
  - Endpoints : `GET /auth/me`, `POST /auth/login`, `POST /auth/logout`.
- Entities :
  - REST conventionnel (`GET /products`, `GET /products/:id`, `POST /products`, etc.).
  - Supporter pagination/filtre via query params (`?page=1&limit=20&search=...`).
- Normalisation : transformer response shape en `{ data, meta }` si UI attend ce format.
- Erreurs : uniformiser les erreurs HTTP vers des erreurs applicatives.

### 5) Migration progressive
- Utiliser `VITE_API_PROVIDER` pour basculer entre fournisseurs.
- Prioriser tests/stabilisation sur pages critiques : Auth, Inventory, Products, Warehouses.
- Déployer en staging d’abord, vérifications manuelles et tests automatisés.

### 6) Tests & CI
- Unit tests pour :
  - `apiClient` factory (sélection du provider).
  - `restProvider` (avec mocks fetch/axios).
  - Normalizers et mapping critical.
- Smoke tests / E2E pour :
  - Login / me
  - Lister produits
  - Créer mouvement de stock
- Ajouter job CI si possible.

## Détails techniques & exemples

- Exemple de factory (concept) :
```js
// src/api/apiClient.js (concept)
import sdkProvider from './providers/sdkProvider';
import restProvider from './providers/restProvider';

const providerName = import.meta.env.VITE_API_PROVIDER || 'base44';
const provider = providerName === 'rest' ? restProvider() : sdkProvider();
export default provider;
```

- Exemples de signatures attendues :
  - `await apiClient.auth.me()` -> `{ user, roles, ... }`
  - `await apiClient.entities.Product.list({ page, limit, search })` -> `{ data: [...], meta: { total, page } }`

- Intégration avec `AuthContext.jsx` :
  - Remplacer appels directs `base44.auth.me()` par `apiClient.auth.me()` (transparent si adapter conforme).

- React Query :
  - Garder `src/lib/query-client.js`.
  - S'assurer que les normalizers produisent des clés/objets stables pour le caching.

## Checklist de migration
- [ ] Ajouter `VITE_REST_BASE_URL` et `VITE_API_PROVIDER` dans la doc.
- [ ] Implémenter `src/api/apiClient.js` (factory).
- [ ] Implémenter `sdkProvider` (wrapper minimal).
- [ ] Implémenter `restProvider` (fetch/axios).
- [ ] Normalizers pour entities et erreurs.
- [ ] Mettre à jour `AuthContext.jsx` pour utiliser `apiClient`.
- [ ] Tests unitaires pour `apiClient` et `restProvider`.
- [ ] Tester Inventory scanner et la recherche produit/lot.
- [ ] Basculement staging → production.

## Risques & mitigations
- Différences de shape entre SDK et REST : utiliser des normalizers et tests.
- Auth (sessions vs tokens) : standardiser sur Bearer token, adapter backend si nécessaire.
- Surface SDK utilisée directement à de multiples endroits : couvrir par adapter complet pour éviter refactor massif.

## Estimation (ordre de grandeur)
- Adapter factory + `sdkProvider` : 1–2 jours.
- `restProvider` + normalizers pour 6–8 entités principales : 3–6 jours.
- Tests et stabilisation : 2–4 jours.
- Total approximatif : 1–2 semaines selon complexité des mappings et disponibilité du backend REST.

## Prochaines actions possibles (je peux faire)
- Créer maintenant `src/api/apiClient.js` (squelette factory + `sdkProvider`).
- Implémenter un `restProvider` minimal pour `Product` (ex: `list`, `get`).
- Ajouter tests unitaires basiques pour la factory/provider.

---
Dis-moi quelle action tu veux que je fasse ensuite (créer le squelette `apiClient`, implémenter un provider REST exemple, ou autre).
