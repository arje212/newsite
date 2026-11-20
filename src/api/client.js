const API_ROOT = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || `Request failed (${response.status})`);
  return payload;
}

const entityApi = new Proxy({}, {
  get: (_, entityName) => ({
    list: (sort) => request(`/api/${entityName}${sort ? `?sort=${encodeURIComponent(sort)}` : ''}`),
    get: (id) => request(`/api/${entityName}/${encodeURIComponent(id)}`),
    filter: (filters = {}, sort) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
      });
      if (sort) params.set('sort', sort);
      return request(`/api/${entityName}?${params.toString()}`);
    },
    create: (data) => request(`/api/${entityName}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/${entityName}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/${entityName}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    subscribe: (callback, interval = 4000) => {
      let active = true;
      let known = new Set();
      let initialized = false;
      const poll = async () => {
        try {
          const rows = await request(`/api/${entityName}?limit=100`);
          if (!active) return;
          const next = new Set(rows.map((row) => row.id));
          if (initialized) rows.forEach((row) => {
            if (!known.has(row.id)) callback({ type: 'create', id: row.id, data: row });
          });
          known.forEach((id) => {
            if (!next.has(id)) callback({ type: 'delete', id });
          });
          known = next;
          initialized = true;
        } catch (error) {
          // Polling is best-effort; the next interval retries automatically.
        }
      };
      poll();
      const timer = window.setInterval(poll, interval);
      return () => { active = false; window.clearInterval(timer); };
    },
  }),
});

export const api = {
  entities: entityApi,
  auth: {
    me: () => request('/api/auth/me'),
    login: (credentials) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
  },
  users: {
    invite: (data) => request('/api/users/invite', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request('/api/users'),
  },
  contact: {
    submit: (data) => request('/api/contact', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request('/api/admin/contact-messages'),
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const body = new FormData();
        body.append('file', file);
        return request('/api/uploads', { method: 'POST', body });
      },
      SendEmail: (data) => request('/api/notifications/email', { method: 'POST', body: JSON.stringify(data) }).catch((error) => ({ delivered: false, error: error.message })),
    },
  },
};

export default api;
