import { supabase } from '@/lib/supabase';

/* Entity name (used across the UI) → Postgres table */
const TABLES = {
  ClientProject: 'client_projects',
  Deliverable: 'deliverables',
  ChangeRequest: 'change_requests',
  DeliverableReview: 'deliverable_reviews',
  ProjectMessage: 'project_messages',
  ProjectPhoto: 'project_photos',
  TeamMember: 'team_members',
  Service: 'services',
  PortfolioProject: 'portfolio_projects',
  RoadmapMilestone: 'roadmap_milestones',
};

/* Fields that point at files in the private bucket. They are stored as "private:<path>"
   and swapped for a short-lived signed URL whenever rows are read. */
const PRIVATE_FIELDS = { Deliverable: 'file_url', ProjectPhoto: 'photo_url' };
const PRIVATE_PREFIX = 'private:';
const PUBLIC_BUCKET = 'public-assets';
const PRIVATE_BUCKET = 'client-files';
const SIGNED_URL_TTL = 60 * 60; // seconds

const fail = (error) => { throw new Error(error?.message || 'Request failed.'); };
const unwrap = ({ data, error }) => { if (error) fail(error); return data; };

/* crypto.randomUUID() only exists on https/localhost; getRandomValues works everywhere. */
const randomId = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');

const escapeLike = (value) => String(value).replace(/[\\%_]/g, '\\$&');

async function resolvePrivate(entity, result) {
  const field = PRIVATE_FIELDS[entity];
  if (!field || !result) return result;
  const rows = Array.isArray(result) ? result : [result];
  const paths = [...new Set(rows.map((r) => r[field]).filter((v) => typeof v === 'string' && v.startsWith(PRIVATE_PREFIX)).map((v) => v.slice(PRIVATE_PREFIX.length)))];
  if (!paths.length) return result;
  const { data } = await supabase.storage.from(PRIVATE_BUCKET).createSignedUrls(paths, SIGNED_URL_TTL);
  const map = new Map((data || []).map((d) => [d.path, d.signedUrl]));
  const swap = (row) => {
    const value = row[field];
    if (typeof value !== 'string' || !value.startsWith(PRIVATE_PREFIX)) return row;
    return { ...row, [field]: map.get(value.slice(PRIVATE_PREFIX.length)) || null };
  };
  return Array.isArray(result) ? result.map(swap) : swap(result);
}

function cleanPayload(data = {}) {
  const out = {};
  for (const [key, raw] of Object.entries(data)) {
    if (['id', 'created_date', 'updated_date'].includes(key) || raw === undefined) continue;
    let value = raw;
    if (key === 'client_email' && typeof value === 'string') value = value.trim().toLowerCase();
    if (key.endsWith('_date') && value === '') value = null;
    if (key === 'progress_percent') value = Math.min(100, Math.max(0, Number(value || 0)));
    out[key] = value;
  }
  return out;
}

function applySort(query, sort) {
  const value = sort || '-created_date';
  const descending = value.startsWith('-');
  const key = descending ? value.slice(1) : value;
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) return query;
  query = query.order(key, { ascending: !descending });
  return key === 'created_date' ? query : query.order('created_date', { ascending: true });
}

function makeEntity(entity) {
  const table = TABLES[entity];
  if (!table) throw new Error(`Unknown entity: ${entity}`);

  const list = async (sort) => resolvePrivate(entity, unwrap(await applySort(supabase.from(table).select('*'), sort)));

  return {
    list,
    get: async (id) => resolvePrivate(entity, unwrap(await supabase.from(table).select('*').eq('id', id).single())),
    filter: async (filters = {}, sort) => {
      let query = supabase.from(table).select('*');
      for (const [key, value] of Object.entries(filters)) {
        if (value === undefined || value === null || value === '') continue;
        query = key === 'client_email' ? query.ilike(key, escapeLike(value)) : query.eq(key, value);
      }
      return resolvePrivate(entity, unwrap(await applySort(query, sort)));
    },
    create: async (data) => resolvePrivate(entity, unwrap(await supabase.from(table).insert(cleanPayload(data)).select().single())),
    update: async (id, data) => resolvePrivate(entity, unwrap(await supabase.from(table).update(cleanPayload(data)).eq('id', id).select().single())),
    delete: async (id) => { unwrap(await supabase.from(table).delete().eq('id', id)); return null; },
    /* Live updates through Supabase Realtime (currently enabled for project_messages). */
    subscribe: (callback) => {
      const channel = supabase
        .channel(`rt-${table}-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, (payload) => callback({ type: 'create', id: payload.new.id, data: payload.new }))
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table }, (payload) => callback({ type: 'delete', id: payload.old.id }))
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    },
  };
}

const entityApi = new Proxy({}, { get: (_, name) => makeEntity(String(name)) });

async function loadProfile(authUser) {
  const { data, error } = await supabase.from('profiles').select('id,email,full_name,role').eq('id', authUser.id).maybeSingle();
  if (error) console.error('Could not load profile (did you run supabase/migrations/0001_init.sql?):', error.message);
  return data || {
    id: authUser.id,
    email: authUser.email,
    full_name: authUser.user_metadata?.full_name || authUser.email,
    role: 'client',
  };
}

async function functionError(error, fallback) {
  try {
    const body = await error.context?.json?.();
    if (body?.error) return new Error(body.error);
  } catch { /* ignore */ }
  return new Error(error?.message || fallback);
}

export const api = {
  entities: entityApi,
  auth: {
    me: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in to continue.');
      return loadProfile(session.user);
    },
    login: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email: String(email || '').trim().toLowerCase(), password });
      if (error) throw new Error('Email or password is incorrect.');
      return { user: await loadProfile(data.user) };
    },
    logout: async () => { await supabase.auth.signOut(); },
  },
  users: {
    /* Creating a login needs the service-role key, so it runs in the `create-client` Edge Function. */
    invite: async (payload) => {
      const { data, error } = await supabase.functions.invoke('create-client', { body: payload });
      if (error) throw await functionError(error, 'Could not create client account.');
      if (data?.error) throw new Error(data.error);
      return data;
    },
    list: async () => unwrap(await supabase.from('profiles').select('id,email,full_name,role,created_date').order('created_date', { ascending: false })),
  },
  contact: {
    submit: async ({ name, email, message }) => {
      const row = { name: String(name || '').trim().slice(0, 120), email: String(email || '').trim().slice(0, 254), message: String(message || '').trim().slice(0, 5000) };
      if (!row.name || !/^\S+@\S+\.\S+$/.test(row.email) || row.message.length < 10) {
        throw new Error('Enter your name, a valid email, and a message of at least 10 characters.');
      }
      const { error } = await supabase.from('contact_messages').insert(row);
      if (error) fail(error);
      return { message: 'Your message has been received.' };
    },
    list: async () => unwrap(await supabase.from('contact_messages').select('*').order('created_date', { ascending: false }).limit(200)),
  },
  integrations: {
    Core: {
      /* UploadFile({ file })                → public bucket, returns a permanent public URL
         UploadFile({ file, private: true }) → private bucket, returns "private:<path>" */
      UploadFile: async ({ file, private: isPrivate = false }) => {
        const ext = (file.name.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
        const path = `${randomId()}${ext ? `.${ext}` : ''}`;
        const bucket = isPrivate ? PRIVATE_BUCKET : PUBLIC_BUCKET;
        const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type || undefined, upsert: false });
        if (error) fail(error);
        const file_url = isPrivate ? `${PRIVATE_PREFIX}${path}` : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
        return { file_url, original_name: file.name, size: file.size, mime_type: file.type };
      },
      /* Notifications are recorded in the `notifications` table. Nothing is emailed until you
         connect a delivery service (see README), so we never claim delivery. */
      SendEmail: async ({ to, subject, body }) => {
        const { error } = await supabase.from('notifications').insert({ recipient: String(to || ''), subject: String(subject || ''), body: String(body || '') });
        if (error) return { delivered: false, error: error.message };
        return { delivered: false, message: 'Notification saved.' };
      },
    },
  },
};

export default api;