import { redirect } from '@sveltejs/kit';

function toKebabCase(value) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function baseUsernameForUser(user) {
	const emailPrefix = user?.email?.split('@')[0] || '';
	const raw = user?.user_metadata?.username || user?.user_metadata?.display_name || emailPrefix || 'user';
	const normalized = toKebabCase(raw);
	return normalized.length >= 3 ? normalized : `user-${user.id.slice(0, 8)}`;
}

async function ensureProfileExists(locals, user) {
	const existingProfileQuery = await locals.supabase
		.from('user_profiles')
		.select('username')
		.eq('id', user.id)
		.maybeSingle();

	if (existingProfileQuery.data?.username) {
		return existingProfileQuery.data.username;
	}

	const baseUsername = baseUsernameForUser(user);
	const displayName =
		user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

	for (let attempt = 0; attempt < 10; attempt += 1) {
		const candidateUsername = attempt === 0 ? baseUsername : `${baseUsername}-${attempt + 1}`;
		const insertResult = await locals.supabase
			.from('user_profiles')
			.insert({
				id: user.id,
				email: user.email,
				username: candidateUsername,
				display_name: displayName
			})
			.select('username')
			.single();

		if (insertResult.data?.username) {
			return insertResult.data.username;
		}

		const message = [insertResult.error?.message, insertResult.error?.details, insertResult.error?.hint]
			.filter(Boolean)
			.join(' ')
			.toLowerCase();

		const isUniqueViolation =
			insertResult.error?.code === '23505' ||
			message.includes('duplicate key') ||
			message.includes('unique');

		if (!isUniqueViolation) {
			console.error('Failed to bootstrap user profile', insertResult.error);
			break;
		}
	}

	return null;
}

export async function load({ locals }) {
	// Redirect old /profile route to new /profile/[username] route
	const session = locals.session;
	const user = locals.user;

	if (!session || !user) {
		throw redirect(302, '/auth');
	}

	const username = await ensureProfileExists(locals, user);

	if (username) {
		throw redirect(302, `/${username}`);
	}

	// Fallback if no username found
	throw redirect(302, '/');
}
