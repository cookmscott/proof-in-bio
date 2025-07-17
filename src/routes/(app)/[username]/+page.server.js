import { supabase } from '$lib/supabaseClient';

/**
 * Securely fetches the authenticated user from Supabase Auth server.
 */
export async function load({ request, cookies }) {
    // Get the access token from cookies (adjust if you use a different cookie name)
    const access_token = cookies.get('sb-access-token');
    if (!access_token) {
        return { user: null };
    }

    // Use supabase.auth.getUser() to securely fetch the user
    const { data, error } = await supabase.auth.getUser(access_token);
    if (error || !data?.user) {
        return { user: null };
    }

    return {
        user: data.user
    };
}
