import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { createSupabaseServer, safeGetSession } from '$lib/server/supabase.js';

const supabase = async ({ event, resolve }) => {
  const supabase = createSupabaseServer(event.cookies);
  event.locals.supabase = supabase;
  event.locals.safeGetSession = () => safeGetSession(supabase);

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });
};

const authGuard = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  if (!event.locals.session && event.url.pathname.startsWith('/private')) {
    redirect(303, '/auth');
  }

  if (event.locals.session && event.url.pathname === '/auth') {
    redirect(303, '/private');
  }

  return resolve(event);
};

export const handle = sequence(supabase, authGuard);

