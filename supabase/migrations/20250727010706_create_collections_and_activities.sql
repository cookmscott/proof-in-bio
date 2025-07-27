-- Create collections (albums) and activity tracking system
-- Collections allow users to group photos, activities power feeds and notifications

-- Collections table for user-created photo albums
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100) NOT NULL,
  cover_photo_id UUID REFERENCES photos(id),
  is_public BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes and constraints
CREATE UNIQUE INDEX collections_user_slug_idx ON collections(user_id, slug);
CREATE INDEX collections_user_id_idx ON collections(user_id);
CREATE INDEX collections_is_public_idx ON collections(is_public);

-- Collection_photos junction table
CREATE TABLE IF NOT EXISTS collection_photos (
  id SERIAL PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes and constraints
CREATE UNIQUE INDEX collection_photos_unique_idx ON collection_photos(collection_id, photo_id);
CREATE INDEX collection_photos_collection_id_idx ON collection_photos(collection_id);
CREATE INDEX collection_photos_photo_id_idx ON collection_photos(photo_id);

-- Activities table for user activity feeds and notifications
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  activity_type VARCHAR(50) NOT NULL, -- 'photo_upload', 'like', 'comment', 'follow', 'collection_create'
  target_type VARCHAR(50), -- 'photo', 'user', 'collection', 'comment'
  target_id UUID, -- ID of the target object
  metadata JSONB, -- Additional context data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for activity queries
CREATE INDEX activities_user_id_idx ON activities(user_id);
CREATE INDEX activities_type_idx ON activities(activity_type);
CREATE INDEX activities_created_at_idx ON activities(created_at DESC);
CREATE INDEX activities_target_idx ON activities(target_type, target_id);

-- Create trigger for collections updated_at
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create activity when users perform actions
CREATE OR REPLACE FUNCTION create_activity_on_like()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (user_id, activity_type, target_type, target_id, metadata)
  VALUES (NEW.user_id, 'like', 'photo', NEW.photo_id, jsonb_build_object('liked_at', NEW.created_at));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_activity_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (user_id, activity_type, target_type, target_id, metadata)
  VALUES (NEW.user_id, 'comment', 'photo', NEW.photo_id, jsonb_build_object('comment_id', NEW.id));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_activity_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (user_id, activity_type, target_type, target_id, metadata)
  VALUES (NEW.follower_id, 'follow', 'user', NEW.following_id, jsonb_build_object('followed_at', NEW.created_at));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_activity_on_photo_upload()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activities (user_id, activity_type, target_type, target_id, metadata)
  VALUES (NEW.user_id, 'photo_upload', 'photo', NEW.id, 
    jsonb_build_object(
      'filename', NEW.filename,
      'c2pa_status', NEW.c2pa_status
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create activity triggers
CREATE TRIGGER activity_on_like_trigger
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_on_like();

CREATE TRIGGER activity_on_comment_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_on_comment();

CREATE TRIGGER activity_on_follow_trigger
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_on_follow();

CREATE TRIGGER activity_on_photo_upload_trigger
  AFTER INSERT ON photos
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_on_photo_upload();