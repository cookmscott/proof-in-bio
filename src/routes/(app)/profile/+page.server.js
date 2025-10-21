import { redirect, fail } from '@sveltejs/kit';

export async function load({ locals }) {
    // Use locals.session and locals.user directly (already set by hooks)
    const session = locals.session;
    const user = locals.user;

    if (!session || !user) {
        throw redirect(302, '/auth');
    }

    // Fetch user profile data
    const { data: profile, error: profileError } = await locals.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch user interests
    const { data: interests, error: interestsError } = await locals.supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', user.id);

    return {
        session,
        user,
        profile: profile || null,
        interests: interests?.map(i => i.interest) || []
    };
}

export const actions = {
    updateProfile: async ({ request, locals }) => {
        const session = locals.session;
        const user = locals.user;

        if (!session || !user) {
            return fail(401, { error: 'Unauthorized' });
        }

        console.log({session, user});

        const formData = await request.formData();
        const display_name = formData.get('display_name');
        const bio = formData.get('bio');
        const website = formData.get('website');
        const location = formData.get('location');
        const interests = formData.get('interests')?.split(',').map(i => i.trim()).filter(Boolean) || [];
        const avatarFile = formData.get('avatar');

        console.log({
            display_name,
            bio,
            website,
            location,
            interests,
            avatarFile: avatarFile?.name || 'none'
        });

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
            const fileName = `${user.id}/avatar.${fileExt}`;

            // Convert File to ArrayBuffer
            const arrayBuffer = await avatarFile.arrayBuffer();

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await locals.supabase.storage
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
            const { data: urlData } = locals.supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            avatar_url = urlData.publicUrl;
            console.log('Avatar uploaded:', avatar_url);
        }

        // Prepare update data (no username - it shouldn't be changed)
        const updateData = {
            display_name,
            bio,
            website,
            location
        };

        // Add avatar_url if it was uploaded
        if (avatar_url) {
            updateData.avatar_url = avatar_url;
        }

        // Update user profile
        const { error: updateError } = await locals.supabase
            .from('user_profiles')
            .update(updateData)
            .eq('id', user.id);

        console.log('after update');

        if (updateError) {
            console.log({updateError});

            return fail(400, { error: updateError.message });
        }

        // Delete existing interests and insert new ones
        await locals.supabase
            .from('user_interests')
            .delete()
            .eq('user_id', user.id);

        if (interests.length > 0) {
            const interestsData = interests.map(interest => ({
                user_id: user.id,
                interest
            }));

            const { error: interestsError } = await locals.supabase
                .from('user_interests')
                .insert(interestsData);

            if (interestsError) {
                return fail(400, { error: interestsError.message });
            }
        }

        return { success: true };
    }
};
