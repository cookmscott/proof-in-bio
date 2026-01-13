import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	// Redirect old /profile route to new /profile/[username] route
	const session = locals.session;
	const user = locals.user;

	if (!session || !user) {
		throw redirect(302, '/auth');
	}

	// Fetch the username to redirect to the new route
	const { data: profile } = await locals.supabase
		.from('user_profiles')
		.select('username')
		.eq('id', user.id)
		.single();

	if (profile?.username) {
		throw redirect(302, `/${profile.username}`);
	}

	// Fallback if no username found
	throw redirect(302, '/');
}
