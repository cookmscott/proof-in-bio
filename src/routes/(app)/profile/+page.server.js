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
        const username = formData.get('username');
        const display_name = formData.get('display_name');
        const bio = formData.get('bio');
        const website = formData.get('website');
        const location = formData.get('location');
        const interests = formData.get('interests')?.split(',').map(i => i.trim()).filter(Boolean) || [];

        console.log({
            username,
            display_name,
            bio,
            website,
            location,
            interests,
        });

        // Update user profile
        const { error: updateError } = await locals.supabase
            .from('user_profiles')
            .update({
                username,
                display_name,
                bio,
                website,
                location
            })
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
