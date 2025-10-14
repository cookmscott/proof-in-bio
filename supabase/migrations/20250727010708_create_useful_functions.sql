-- Create useful database functions for common queries
-- These functions provide optimized, reusable query logic

-- Function to get user feed (photos from followed users)
CREATE OR REPLACE FUNCTION get_user_feed(user_uuid UUID, page_size INTEGER DEFAULT 20, page_offset INTEGER DEFAULT 0)
RETURNS TABLE (
  photo_id UUID,
  user_id UUID,
  username VARCHAR,
  display_name VARCHAR,
  avatar_url VARCHAR,
  filename VARCHAR,
  title VARCHAR,
  storage_url VARCHAR,
  thumbnail_url VARCHAR,
  like_count BIGINT,
  comment_count BIGINT,
  is_liked BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS photo_id,
    p.user_id,
    u.username,
    u.display_name,
    u.avatar_url,
    p.filename,
    p.title,
    p.storage_url,
    p.thumbnail_url,
    COALESCE(l.like_count, 0) AS like_count,
    COALESCE(c.comment_count, 0) AS comment_count,
    EXISTS(SELECT 1 FROM likes WHERE photo_id = p.id AND user_id = user_uuid) AS is_liked,
    p.created_at
  FROM photos p
  JOIN user_profiles u ON p.user_id = u.id
  LEFT JOIN (
    SELECT photo_id, COUNT(*) AS like_count
    FROM likes
    GROUP BY photo_id
  ) l ON p.id = l.photo_id
  LEFT JOIN (
    SELECT photo_id, COUNT(*) AS comment_count
    FROM comments
    GROUP BY photo_id
  ) c ON p.id = c.photo_id
  WHERE p.is_public = true
    AND (
      p.user_id = user_uuid OR -- user's own photos
      EXISTS(SELECT 1 FROM follows WHERE follower_id = user_uuid AND following_id = p.user_id) -- followed users
    )
  ORDER BY p.created_at DESC
  LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get public discover feed (trending/recent photos)
CREATE OR REPLACE FUNCTION get_discover_feed(page_size INTEGER DEFAULT 20, page_offset INTEGER DEFAULT 0)
RETURNS TABLE (
  photo_id UUID,
  user_id UUID,
  username VARCHAR,
  display_name VARCHAR,
  avatar_url VARCHAR,
  filename VARCHAR,
  title VARCHAR,
  storage_url VARCHAR,
  thumbnail_url VARCHAR,
  like_count BIGINT,
  comment_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS photo_id,
    p.user_id,
    u.username,
    u.display_name,
    u.avatar_url,
    p.filename,
    p.title,
    p.storage_url,
    p.thumbnail_url,
    COALESCE(l.like_count, 0) AS like_count,
    COALESCE(c.comment_count, 0) AS comment_count,
    p.created_at
  FROM photos p
  JOIN user_profiles u ON p.user_id = u.id
  LEFT JOIN (
    SELECT photo_id, COUNT(*) AS like_count
    FROM likes
    GROUP BY photo_id
  ) l ON p.id = l.photo_id
  LEFT JOIN (
    SELECT photo_id, COUNT(*) AS comment_count
    FROM comments
    GROUP BY photo_id
  ) c ON p.id = c.photo_id
  WHERE p.is_public = true
    AND p.c2pa_status = 'verified'
  ORDER BY (COALESCE(l.like_count, 0) + COALESCE(c.comment_count, 0)) DESC, p.created_at DESC
  LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile with stats
CREATE OR REPLACE FUNCTION get_user_profile(username_param VARCHAR)
RETURNS TABLE (
  user_id UUID,
  username VARCHAR,
  display_name VARCHAR,
  bio TEXT,
  avatar_url VARCHAR,
  website VARCHAR,
  location VARCHAR,
  is_verified BOOLEAN,
  photo_count BIGINT,
  follower_count BIGINT,
  following_count BIGINT,
  total_likes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS user_id,
    u.username,
    u.display_name,
    u.bio,
    u.avatar_url,
    u.website,
    u.location,
    u.is_verified,
    COALESCE(p.photo_count, 0) AS photo_count,
    COALESCE(fr.follower_count, 0) AS follower_count,
    COALESCE(fg.following_count, 0) AS following_count,
    COALESCE(l.total_likes, 0) AS total_likes,
    u.created_at
  FROM user_profiles u
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS photo_count
    FROM photos
    WHERE is_public = true
    GROUP BY user_id
  ) p ON u.id = p.user_id
  LEFT JOIN (
    SELECT following_id, COUNT(*) AS follower_count
    FROM follows
    GROUP BY following_id
  ) fr ON u.id = fr.following_id
  LEFT JOIN (
    SELECT follower_id, COUNT(*) AS following_count
    FROM follows
    GROUP BY follower_id
  ) fg ON u.id = fg.follower_id
  LEFT JOIN (
    SELECT photos.user_id, COUNT(likes.id) AS total_likes
    FROM photos
    LEFT JOIN likes ON photos.id = likes.photo_id
    WHERE photos.is_public = true
    GROUP BY photos.user_id
  ) l ON u.id = l.user_id
  WHERE u.username = username_param AND u.is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search photos by tags and text
CREATE OR REPLACE FUNCTION search_photos(
  search_term TEXT DEFAULT '',
  tag_names TEXT[] DEFAULT '{}',
  page_size INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  photo_id UUID,
  user_id UUID,
  username VARCHAR,
  display_name VARCHAR,
  avatar_url VARCHAR,
  filename VARCHAR,
  title VARCHAR,
  description TEXT,
  storage_url VARCHAR,
  thumbnail_url VARCHAR,
  like_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS photo_id,
    p.user_id,
    u.username,
    u.display_name,
    u.avatar_url,
    p.filename,
    p.title,
    p.description,
    p.storage_url,
    p.thumbnail_url,
    COALESCE(l.like_count, 0) AS like_count,
    p.created_at
  FROM photos p
  JOIN user_profiles u ON p.user_id = u.id
  LEFT JOIN (
    SELECT photo_id, COUNT(*) AS like_count
    FROM likes
    GROUP BY photo_id
  ) l ON p.id = l.photo_id
  WHERE p.is_public = true
    AND p.c2pa_status = 'verified'
    AND (
      search_term = '' OR
      p.title ILIKE '%' || search_term || '%' OR
      p.description ILIKE '%' || search_term || '%' OR
      u.username ILIKE '%' || search_term || '%'
    )
    AND (
      array_length(tag_names, 1) IS NULL OR
      EXISTS (
        SELECT 1 FROM photo_tags pt
        JOIN tags t ON pt.tag_id = t.id
        WHERE pt.photo_id = p.id
        AND t.name = ANY(tag_names)
      )
    )
  ORDER BY COALESCE(l.like_count, 0) DESC, p.created_at DESC
  LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get photo details with C2PA verification info
CREATE OR REPLACE FUNCTION get_photo_details(photo_uuid UUID)
RETURNS TABLE (
  photo_id UUID,
  user_id UUID,
  username VARCHAR,
  display_name VARCHAR,
  avatar_url VARCHAR,
  filename VARCHAR,
  title VARCHAR,
  description TEXT,
  storage_url VARCHAR,
  thumbnail_url VARCHAR,
  c2pa_status VARCHAR,
  c2pa_verified_at TIMESTAMP WITH TIME ZONE,
  camera VARCHAR,
  lens VARCHAR,
  focal_length VARCHAR,
  aperture VARCHAR,
  shutter_speed VARCHAR,
  iso INTEGER,
  captured_at TIMESTAMP WITH TIME ZONE,
  like_count BIGINT,
  comment_count BIGINT,
  view_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Increment view count
  UPDATE photos SET view_count = view_count + 1 WHERE id = photo_uuid;
  
  RETURN QUERY
  SELECT 
    p.id AS photo_id,
    p.user_id,
    u.username,
    u.display_name,
    u.avatar_url,
    p.filename,
    p.title,
    p.description,
    p.storage_url,
    p.thumbnail_url,
    p.c2pa_status,
    p.c2pa_verified_at,
    p.camera,
    p.lens,
    p.focal_length,
    p.aperture,
    p.shutter_speed,
    p.iso,
    p.captured_at,
    COALESCE(l.like_count, 0) AS like_count,
    COALESCE(c.comment_count, 0) AS comment_count,
    p.view_count,
    p.created_at
  FROM photos p
  JOIN user_profiles u ON p.user_id = u.id
  LEFT JOIN (
    SELECT photo_id, COUNT(*) AS like_count
    FROM likes
    GROUP BY photo_id
  ) l ON p.id = l.photo_id
  LEFT JOIN (
    SELECT photo_id, COUNT(*) AS comment_count
    FROM comments
    GROUP BY photo_id
  ) c ON p.id = c.photo_id
  WHERE p.id = photo_uuid
    AND (p.is_public = true OR p.user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;