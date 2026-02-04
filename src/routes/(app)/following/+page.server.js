import { fail } from '@sveltejs/kit';

export async function load({ locals: { supabase } }) {
  try {
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        username,
        display_name,
        avatar_url,
        photos (
          id,
          storage_url,
          like_count,
          view_count,
          title,
          created_at,
          width,
          height,
          blurhash,
          deleted_at
        )
      `)
      .is('photos.deleted_at', null)
      .limit(50);

    if (error) {
      console.error('Error fetching explore data:', error);
      return { users: [] };
    }

    if (!profiles || profiles.length === 0) {
        return { users: [] };
    }

    // Filter users that might not have photos and sort photos by date
    const usersWithPhotos = profiles
      .filter(p => p.photos && p.photos.length > 0)
      .map(user => ({
        ...user,
        photos: user.photos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }));
    
    return { users: usersWithPhotos };

  } catch (err) {
    console.error('Unexpected error:', err);
    return { users: [] };
  }
}
