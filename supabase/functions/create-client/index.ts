// Creates a client login. Only callable by a signed-in admin.
// Deploy:  supabase functions deploy create-client
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed.' });

  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: { user } } = await caller.auth.getUser();
    if (!user) return json(401, { error: 'Please sign in to continue.' });

    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== 'admin') return json(403, { error: 'Administrator access is required.' });

    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? '').trim().toLowerCase();
    const fullName = String(body.full_name ?? '').trim();
    const password = String(body.password ?? '');
    if (!/^\S+@\S+\.\S+$/.test(email) || !fullName || password.length < 12) {
      return json(400, { error: 'Provide a valid email, full name, and password with at least 12 characters.' });
    }

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) {
      const exists = /already|registered|exists/i.test(error.message);
      return json(exists ? 409 : 400, { error: exists ? 'An account with this email already exists.' : error.message });
    }

    return json(201, {
      id: data.user!.id,
      email,
      full_name: fullName,
      role: 'client',
      created_date: data.user!.created_at,
    });
  } catch (e) {
    console.error(e);
    return json(500, { error: 'Something went wrong.' });
  }
});
