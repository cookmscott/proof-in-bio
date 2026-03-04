import { createBrowserClient, isBrowser } from '@supabase/ssr'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'

export const load = async ({ data, depends, fetch }) => {
  /**
   * Declare a dependency so the layout can be invalidated, for example, on
   * session refresh.
   */
  depends('supabase:auth')

  const browser = isBrowser()
  const supabase = browser
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: {
          fetch,
        },
      })
    : null

  // Use the server-validated session when running on the server to avoid
  // relying on cookie data that hasn't been verified. On the client, getSession
  // is safe to call.
  let session

  if (browser) {
    const {
      data: { session: browserSession },
    } = await supabase.auth.getSession()
    session = browserSession
  } else {
    session = data.session
  }

  const user = browser
    ? (
        await supabase.auth.getUser()
      ).data.user
    : data.user

  return { session, supabase, user }
}
