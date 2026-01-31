import { appParams } from '@/lib/app-params';

const { token } = appParams;

function authHeader() {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}), ...authHeader() },
    ...options
  });
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw { status: res.status, data };
    return data;
  } catch (err) {
    if (err && err.status) throw err;
    throw { status: res.status, data: text };
  }
}

export default function restProvider() {
  const baseUrl = import.meta.env.VITE_REST_BASE_URL || '';

  const auth = {
    me: async () => {
      return fetchJson(`${baseUrl}/auth/me`);
    },
    login: async (payload) => {
      return fetchJson(`${baseUrl}/auth/login`, { method: 'POST', body: JSON.stringify(payload) });
    },
    logout: async () => {
      return fetchJson(`${baseUrl}/auth/logout`, { method: 'POST' });
    },
    redirectToLogin: (url) => { window.location.href = url; }
  };

  const entities = {
    Product: {
      list: async (params = {}) => {
        const qp = new URLSearchParams();
        if (params.page) qp.set('page', params.page);
        if (params.limit) qp.set('limit', params.limit);
        if (params.search) qp.set('search', params.search);
        const url = `${baseUrl}/products${qp.toString() ? `?${qp.toString()}` : ''}`;
        const data = await fetchJson(url);
        // normalize to { data, meta }
        return { data: data.items || data.data || data, meta: data.meta || { total: data.total || 0 } };
      },
      get: async (id) => {
        return fetchJson(`${baseUrl}/products/${id}`);
      }
    }
  };

  return { auth, entities };
}
