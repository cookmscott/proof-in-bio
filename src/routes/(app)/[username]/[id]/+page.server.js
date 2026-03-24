import { error } from '@sveltejs/kit';

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

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals: { supabase } }) {
	let { data: photo, error: photoError } = await supabase
		.from('photos')
		.select(
			`
			*,
			user:user_profiles (
				username,
				display_name,
				avatar_url
			),
			metadata:photos_metadata (*)
		`
		)
		.eq('id', params.id)
		.is('deleted_at', null)
		.single();

	if (photoError && isMissingColumnError(photoError)) {
		const fallbackQuery = await supabase
			.from('photos')
			.select(
				`
				*,
				user:user_profiles (
					username,
					display_name,
					avatar_url
				),
				metadata:photos_metadata (*)
			`
			)
			.eq('id', params.id)
			.single();

		photo = fallbackQuery.data;
		photoError = fallbackQuery.error;
	}

	if (photoError || !photo) {
		throw error(404, 'Not found');
	}

	photo = {
		...photo,
		image_url: resolvePhotoUrl(supabase, photo)
	};

	return {
		photo,
		streamed: {
			// You can add other streamed data here later, like comments or related photos.
		}
	};
}
