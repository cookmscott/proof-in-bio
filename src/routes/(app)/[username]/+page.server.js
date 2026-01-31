import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';

/**
 * Loads the profile and photos for a given username.
 */
export async function load({ params, locals: { supabase } }) {
	const { username } = params;
	const { data: { session } } = await supabase.auth.getSession();

	// Fetch the user profile based on the username in the URL
	const { data: profile, error: profileError } = await supabase
		.from('user_profiles')
		.select(
			`
            id,
            username,
            display_name,
            avatar_url,
            bio,
            website,
            location,
            interests:user_interests ( interest )
        `
		)
		.eq('username', username)
		.single();

	if (profileError || !profile) {
		// If the user doesn't exist, return a 404
		error(404, 'User not found');
	}

	// Fetch the user's photos
	const { data: photos, error: photosError } = await supabase
		.from('photos')
		.select('id, storage_url, storage_key, title, description, width, height')
		.eq('user_id', profile.id)
		.eq('is_public', true)
		.eq('is_archived', false)
		.order('created_at', { ascending: false });

	if (photosError) {
		console.error('Error fetching photos:', photosError);
	}

	// Determine if the logged-in user can edit this profile
	const canEdit = session?.user?.id === profile.id;

	return {
		profile,
		photos: photos || [],
		canEdit
	};
}
