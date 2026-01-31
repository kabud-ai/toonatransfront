import { base44 } from '../base44Client';

function wrapEntity(entity) {
  if (!entity) return {};
  return {
    list: (...args) => entity.list(...args),
    get: (...args) => entity.get ? entity.get(...args) : entity.retrieve ? entity.retrieve(...args) : Promise.reject(new Error('get not implemented')),
    create: (...args) => entity.create ? entity.create(...args) : Promise.reject(new Error('create not implemented')),
    update: (...args) => entity.update ? entity.update(...args) : Promise.reject(new Error('update not implemented')),
    delete: (...args) => entity.delete ? entity.delete(...args) : Promise.reject(new Error('delete not implemented')),
    search: (...args) => entity.search ? entity.search(...args) : Promise.reject(new Error('search not implemented'))
  };
}

export default function sdkProvider() {
  const auth = {
    me: (...args) => base44.auth.me(...args),
    login: (...args) => base44.auth.login ? base44.auth.login(...args) : Promise.reject(new Error('login not available')),
    logout: (...args) => base44.auth.logout ? base44.auth.logout(...args) : Promise.resolve(),
    redirectToLogin: (...args) => base44.auth.redirectToLogin ? base44.auth.redirectToLogin(...args) : undefined
  };

  const entities = new Proxy({}, {
    get(_, entityName) {
      // base44.entities keys may be capitalized; try both
      const e = base44.entities?.[entityName] || base44.entities?.[String(entityName).toLowerCase()];
      return wrapEntity(e);
    }
  });

  return { auth, entities };
}
