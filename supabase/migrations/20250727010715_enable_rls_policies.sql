-- Enable Row Level Security (RLS) and create security policies
-- This ensures users can only access data they're authorized to see

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- User profiles table policies
CREATE POLICY "Users can view public profiles" ON user_profiles
  FOR SELECT USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (trigger will bypass this with SECURITY DEFINER)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- User interests policies
CREATE POLICY "Anyone can view public user interests" ON user_interests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = user_interests.user_id
      AND (user_profiles.is_public = true OR user_profiles.id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own interests" ON user_interests
  FOR ALL USING (user_id = auth.uid());

-- Photos table policies
CREATE POLICY "Anyone can view public photos" ON photos
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own photos" ON photos
  FOR ALL USING (user_id = auth.uid());

-- Photos metadata table policies
CREATE POLICY "Anyone can view metadata for visible photos" ON photos_metadata
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = photos_metadata.photo_id
      AND (photos.is_public = true OR photos.user_id = auth.uid())
    )
  );

CREATE POLICY "Photo owners can manage metadata" ON photos_metadata
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = photos_metadata.photo_id
      AND photos.user_id = auth.uid()
    )
  );

-- Photo history policies (read-only for transparency)
CREATE POLICY "Anyone can view photo history for visible photos" ON photo_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = photo_history.photo_id
      AND (photos.is_public = true OR photos.user_id = auth.uid())
    )
  );

CREATE POLICY "Photo owners can insert history" ON photo_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = photo_history.photo_id
      AND photos.user_id = auth.uid()
    )
  );

-- Tags table policies (public read, authenticated users can create)
CREATE POLICY "Anyone can view tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Photo tags policies
CREATE POLICY "Anyone can view photo tags for visible photos" ON photo_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = photo_tags.photo_id
      AND (photos.is_public = true OR photos.user_id = auth.uid())
    )
  );

CREATE POLICY "Photo owners can manage photo tags" ON photo_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = photo_tags.photo_id
      AND photos.user_id = auth.uid()
    )
  );

-- Likes table policies
CREATE POLICY "Anyone can view likes for visible photos" ON likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = likes.photo_id
      AND (photos.is_public = true OR photos.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own likes" ON likes
  FOR ALL USING (user_id = auth.uid());

-- Comments table policies
CREATE POLICY "Anyone can view comments on visible photos" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = comments.photo_id
      AND (photos.is_public = true OR photos.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create comments on visible photos" ON comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = comments.photo_id
      AND photos.is_public = true
    )
  );

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users and photo owners can delete comments" ON comments
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = comments.photo_id
      AND photos.user_id = auth.uid()
    )
  );

-- Follows table policies
CREATE POLICY "Anyone can view follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON follows
  FOR ALL USING (follower_id = auth.uid());

-- Collections table policies
CREATE POLICY "Anyone can view public collections" ON collections
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own collections" ON collections
  FOR ALL USING (user_id = auth.uid());

-- Collection photos policies
CREATE POLICY "Anyone can view photos in public collections" ON collection_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_photos.collection_id
      AND (collections.is_public = true OR collections.user_id = auth.uid())
    )
  );

CREATE POLICY "Collection owners can manage collection photos" ON collection_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_photos.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- Activities table policies
CREATE POLICY "Users can view own activities" ON activities
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view activities of users they follow" ON activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM follows
      WHERE follows.following_id = activities.user_id
      AND follows.follower_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view public photo activities" ON activities
  FOR SELECT USING (
    activity_type IN ('photo_upload', 'like', 'comment') AND
    target_type = 'photo' AND
    EXISTS (
      SELECT 1 FROM photos
      WHERE photos.id = activities.target_id
      AND photos.is_public = true
    )
  );

CREATE POLICY "Anyone can view public user activities" ON activities
  FOR SELECT USING (
    activity_type = 'follow' AND
    target_type = 'user' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = activities.target_id
      AND user_profiles.is_public = true
    )
  );

CREATE POLICY "System can create activities" ON activities
  FOR INSERT WITH CHECK (true); -- Allow triggers to insert

-- Create a function to convert strings to kebab-case
CREATE OR REPLACE FUNCTION to_kebab_case(input_text TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            TRIM(input_text),
            '[\s_]+', '-', 'g'  -- Replace spaces and underscores with hyphens
          ),
          '[^a-z0-9-]', '', 'g'  -- Remove non-alphanumeric characters except hyphens
        ),
        '-+', '-', 'g'  -- Replace multiple consecutive hyphens with single hyphen
      ),
      '^-+|-+$', '', 'g'  -- Remove leading and trailing hyphens
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  -- Set search path to include both public and auth schemas
  SET search_path = public, auth;
  -- Log the attempt (visible in Supabase logs)
  RAISE LOG 'Creating user profile for user_id: %, email: %, username: %, display_name: %',
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'NULL'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'NULL');

  INSERT INTO public.user_profiles (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    -- Apply kebab-case transformation to username
    to_kebab_case(COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );

  RAISE LOG 'Successfully created user profile for user_id: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating user profile: %, SQLSTATE: %', SQLERRM, SQLSTATE;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile when auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
