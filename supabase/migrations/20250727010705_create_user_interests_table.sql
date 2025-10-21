-- Create user_interests table for profile tags
CREATE TABLE IF NOT EXISTS user_interests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  interest VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE UNIQUE INDEX user_interests_unique_idx ON user_interests(user_id, interest);
CREATE INDEX user_interests_user_id_idx ON user_interests(user_id);
