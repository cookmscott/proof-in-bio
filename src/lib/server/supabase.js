import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export function createSupabaseServer(cookies) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, { ...options, path: '/' });
        });
      }
    }
  });
}

export async function safeGetSession(supabase) {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) return { session: null, user: null };

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error) return { session: null, user: null };
  return { session, user };
}

