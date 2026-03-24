import { error, fail } from '@sveltejs/kit';
import { ALLOW_ALL_PHOTOS } from '$lib/server/featureFlags';

function isMissingColumnError(err) {
	const combined = [err?.message, err?.details, err?.hint].filter(Boolean).join(' ').toLowerCase();
	return (
		combined.includes('column') ||
		combined.includes('schema cache') ||
		err?.code === 'PGRST204' ||
		err?.code === '42703'
	);
}

function resolvePhotoUrl(supabase, photo) {
	if (photo?.storage_url) {
		return photo.storage_url;
	}

	if (photo?.storage_key) {
		const { data } = supabase.storage.from('photos').getPublicUrl(photo.storage_key);
		return data?.publicUrl ?? null;
	}

	return null;
}

/**
 * Loads the profile and photos for a given username.
 */
export async function load({ params, locals }) {
	const { username } = params;
	const { supabase, user } = locals;

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
		throw error(404, 'User not found');
	}

	profile.interests = profile.interests || [];

	// Fetch the user's photos
	let photos = [];
	let photosError = null;

	const primaryPhotosQuery = await supabase
		.from('photos')
		.select('id, storage_url, storage_key, title, description, width, height')
		.eq('user_id', profile.id)
		.eq('is_public', true)
		.eq('is_archived', false)
		.is('deleted_at', null)
		.order('created_at', { ascending: false });

	photos = primaryPhotosQuery.data || [];
	photosError = primaryPhotosQuery.error;

	if (photosError && isMissingColumnError(photosError)) {
		const fallbackPhotosQuery = await supabase
			.from('photos')
			.select('id, storage_url, storage_key, title, description, width, height')
			.eq('user_id', profile.id)
			.eq('is_public', true)
			.order('created_at', { ascending: false });

		photos = fallbackPhotosQuery.data || [];
		photosError = fallbackPhotosQuery.error;
	}

	if (photosError) {
		console.error('Error fetching photos:', photosError);
	}

	const normalizedPhotos = (photos || []).map((photo) => ({
		...photo,
		image_url: resolvePhotoUrl(supabase, photo)
	}));

	// Determine if the logged-in user can edit this profile
	const canEdit = user?.id === profile.id;

	return {
		profile,
		photos: normalizedPhotos,
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
		const photoIds = rawIds
			? rawIds
					.split(',')
					.map((id) => id.trim())
					.filter(Boolean)
			: [];

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
