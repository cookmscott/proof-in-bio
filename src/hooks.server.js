import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { createSupabaseServer, safeGetSession } from '$lib/server/supabase.js';
import { env } from '$env/dynamic/private';

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
  // Local dev bypass
  if (env.USE_LOCAL_AUTH === 'true') {
    const email = event.cookies.get('local-auth-email');

    if (email) {
      event.locals.session = {
        access_token: 'local-dev-token',
        user: {
          id: `local-user-${Buffer.from(email).toString('base64')}`,
          email
        }
      };
      event.locals.user = event.locals.session.user;
    } 
    else {
      event.locals.session = null;
      event.locals.user = null;
    }
  }
  else {
    const { session, user } = await event.locals.safeGetSession();
    event.locals.session = session;
    event.locals.user = user;
  }

  if (!event.locals.session && event.url.pathname.startsWith('/private')) {
    redirect(303, '/auth');
  }
  else if (event.locals.session && event.url.pathname === '/auth') {
    redirect(303, '/private');
  }

  return resolve(event);
};

export const handle = sequence(supabase, authGuard);

