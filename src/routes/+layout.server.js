import { createSupabaseServer, safeGetSession } from '$lib/server/supabase.js';

export const load = async ({ cookies }) => {
  const supabase = createSupabaseServer(cookies);
  const { session, user } = await safeGetSession(supabase);

  return {
    session,
    user,
    cookies: cookies.getAll()
  };
};

