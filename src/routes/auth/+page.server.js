import { redirect } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'

export const actions = {
  signup: async ({ request, locals: { supabase }, cookies }) => {
    const formData = await request.formData()
    const email = formData.get('email')
    const password = formData.get('password')

    // Local dev bypass
    if (env.USE_LOCAL_AUTH === 'true') {
      cookies.set('local-auth-email', email, { path: '/' })
      redirect(303, '/')
    }

    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      console.error(error)
      redirect(303, '/auth/error')
    } else {
      redirect(303, '/')
    }
  },
  login: async ({ request, locals: { supabase }, cookies }) => {
    const formData = await request.formData()
    const email = formData.get('email')
    const password = formData.get('password')

    // Local dev bypass
    if (env.USE_LOCAL_AUTH === 'true') {
      cookies.set('local-auth-email', email, { path: '/' })
      redirect(303, '/private')
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error(error)
      redirect(303, '/auth/error')
    } else {
      redirect(303, '/private')
    }
  },
}
