import { error, fail, redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
	const currentUser = locals.user;
	const { username } = params;

	if (!currentUser) {
		throw redirect(302, '/login');
	}

	// Fetch the profile by username
	const { data: profile, error: profileError } = await locals.supabase
		.from('user_profiles')
		.select('*')
		.eq('username', username)
		.single();

	if (profileError || !profile) {
		throw error(404, 'User not found');
	}

    // Enforce ownership
	if (currentUser.id !== profile.id) {
		throw redirect(302, `/${username}`);
	}

	// Fetch user interests
	const { data: interests } = await locals.supabase
		.from('user_interests')
		.select('interest')
		.eq('user_id', profile.id);

	return {
		profile: profile || null,
		interests: interests?.map((i) => i.interest) || []
	};
}

export const actions = {
	default: async ({ request, locals, params }) => {
		const currentUser = locals.user;
		const { username } = params;

		if (!currentUser) {
			return fail(401, { error: 'Unauthorized' });
		}

		// Verify the current user owns this profile (double check)
		const { data: profile } = await locals.supabase
			.from('user_profiles')
			.select('id')
			.eq('username', username)
			.single();

		if (!profile || profile.id !== currentUser.id) {
			return fail(403, { error: 'You can only edit your own profile' });
		}

		const formData = await request.formData();
		const newUsername = formData.get('username')?.toString().trim();
		const display_name = formData.get('display_name');
		const bio = formData.get('bio');
		const website = formData.get('website');
		const location = formData.get('location');
		const interests =
			formData
				.get('interests')
				?.split(',')
				.map((i) => i.trim())
				.filter(Boolean) || [];
		const avatarFile = formData.get('avatar');

		// Fetch current profile to check change limits
		const { data: currentProfile, error: fetchError } = await locals.supabase
			.from('user_profiles')
			.select('username, username_changes')
			.eq('id', currentUser.id)
			.single();
		
		if (fetchError || !currentProfile) {
			return fail(500, { error: 'Failed to fetch user profile' });
		}

		const updateData = {
			display_name,
			bio,
			website,
			location
		};

		let usernameChanged = false;

		// Handle username change
		if (newUsername && newUsername !== currentProfile.username) {
			// Check limit
			if ((currentProfile.username_changes || 0) >= 2) {
				return fail(400, { error: 'Username can only be changed twice.' });
			}

			// Validate format (basic regex, adjust as needed)
			if (!/^[a-zA-Z0-9_-]{3,30}$/.test(newUsername)) {
				return fail(400, { error: 'Username must be 3-30 characters and contain only letters, numbers, underscores, or hyphens.' });
			}

			// Check uniqueness
			const { data: existingUser } = await locals.supabase
				.from('user_profiles')
				.select('id')
				.eq('username', newUsername)
				.single();

			if (existingUser) {
				return fail(400, { error: 'Username is already taken.' });
			}

			// Apply change
			updateData.username = newUsername;
			updateData.username_changes = (currentProfile.username_changes || 0) + 1;
			usernameChanged = true;
		}

		let avatar_url = null;

		// Upload avatar if provided
		if (avatarFile && avatarFile.size > 0) {
			// Validate file size (2MB max)
			if (avatarFile.size > 2097152) {
				return fail(400, { error: 'Avatar file size must be less than 2MB' });
			}

			// Validate file type
			const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
			if (!validTypes.includes(avatarFile.type)) {
				return fail(400, { error: 'Avatar must be a JPG, PNG, or WebP image' });
			}

			// Create unique filename
			const fileExt = avatarFile.name.split('.').pop();
			const fileName = `${currentUser.id}/avatar.${fileExt}`;

			// Convert File to ArrayBuffer
			const arrayBuffer = await avatarFile.arrayBuffer();

			// Upload to Supabase Storage
			const { error: uploadError } = await locals.supabase.storage
				.from('avatars')
				.upload(fileName, arrayBuffer, {
					contentType: avatarFile.type,
					upsert: true // Replace if exists
				});

			if (uploadError) {
				console.error('Avatar upload error:', uploadError);
				return fail(400, { error: `Failed to upload avatar: ${uploadError.message}` });
			}

			// Get public URL
			const { data: urlData } = locals.supabase.storage.from('avatars').getPublicUrl(fileName);

			avatar_url = urlData.publicUrl;
		}

		// Add avatar_url if it was uploaded
		if (avatar_url) {
			updateData.avatar_url = avatar_url;
		}

		// Update user profile
		const { error: updateError } = await locals.supabase
			.from('user_profiles')
			.update(updateData)
			.eq('id', currentUser.id);

		if (updateError) {
			console.error('Profile update error:', updateError);
			return fail(400, { error: updateError.message });
		}

		// Delete existing interests and insert new ones
		await locals.supabase.from('user_interests').delete().eq('user_id', currentUser.id);

		if (interests.length > 0) {
			const interestsData = interests.map((interest) => ({
				user_id: currentUser.id,
				interest
			}));

			const { error: interestsError } = await locals.supabase
				.from('user_interests')
				.insert(interestsData);

			if (interestsError) {
				return fail(400, { error: interestsError.message });
			}
		}

		if (usernameChanged) {
			throw redirect(302, `/${updateData.username}/edit`);
		}

		return { success: true };
	}
};
