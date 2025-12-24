-- Create activities table for user activity feeds and notifications
-- This table powers the activity feed/timeline showing what users and people they follow are doing
-- It's an event log that captures all major user actions (uploads, likes, follows, comments)
-- The metadata JSONB field stores additional context specific to each activity type

CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
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
      'filename', NEW.filename
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
