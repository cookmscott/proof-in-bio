import { supabase } from '$lib/supabaseClient';
import { error, fail } from '@sveltejs/kit';
import { ALLOW_ALL_PHOTOS } from '$lib/server/featureFlags';

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
		.is('deleted_at', null)
		.order('created_at', { ascending: false });

	if (photosError) {
		console.error('Error fetching photos:', photosError);
	}

	// Determine if the logged-in user can edit this profile
	const canEdit = session?.user?.id === profile.id;

	return {
		profile,
		photos: photos || [],
		canEdit,
		allowAllPhotos: ALLOW_ALL_PHOTOS
	};
}

export const actions = {
	deletePhotos: async ({ request, locals, params }) => {
		const currentUser = locals.user;
		const { username } = params;

		if (!currentUser) {
			return fail(401, { error: 'Unauthorized' });
		}

		const { data: profile, error: profileError } = await locals.supabase
			.from('user_profiles')
			.select('id')
			.eq('username', username)
			.single();

		if (profileError || !profile) {
			return fail(404, { error: 'User not found' });
		}

		if (profile.id !== currentUser.id) {
			return fail(403, { error: 'You can only edit your own photos' });
		}

		const formData = await request.formData();
		const rawIds = formData.get('photo_ids')?.toString().trim();
		const photoIds = rawIds ? rawIds.split(',').map((id) => id.trim()).filter(Boolean) : [];

		if (photoIds.length === 0) {
			return fail(400, { error: 'No photos selected' });
		}

		const { error: updateError } = await locals.supabase
			.from('photos')
			.update({ deleted_at: new Date().toISOString() })
			.in('id', photoIds)
			.eq('user_id', currentUser.id);

		if (updateError) {
			console.error('Photo delete error:', updateError);
			return fail(400, { error: updateError.message });
		}

		return { success: true };
	}
};
