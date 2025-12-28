import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals: { supabase } }) {
	const { data: photo, error: photoError } = await supabase
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

	if (photoError || !photo) {
		error(404, 'Not found');
	}

	return {
		photo,
		streamed: {
			// You can add other streamed data here later, like comments or related photos.
		}
	};
}