-- Posts table for user-generated content
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text NOT NULL,
  
  -- Post content
  caption text,
  media_urls text[] DEFAULT '{}'::text[],
  categories text[] DEFAULT '{}'::text[], -- DNA categories like 'values', 'interests', etc.
  
  -- Depth system
  depth_level integer DEFAULT 1 CHECK (depth_level >= 1 AND depth_level <= 4),
  
  -- Engagement metrics (can be updated via triggers or application logic)
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  
  -- Moderation & visibility
  is_approved boolean DEFAULT true,
  is_visible boolean DEFAULT true,
  report_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_clerk_user_id ON posts(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_categories ON posts USING gin (categories);
CREATE INDEX IF NOT EXISTS idx_posts_depth_level ON posts(depth_level);
CREATE INDEX IF NOT EXISTS idx_posts_is_visible ON posts(is_visible) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts(deleted_at) WHERE deleted_at IS NULL;

-- Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS trg_posts_set_timestamp ON posts;
CREATE TRIGGER trg_posts_set_timestamp
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Full-text search on captions
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION posts_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.caption, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_posts_search_vector ON posts;
CREATE TRIGGER trg_posts_search_vector
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION posts_search_vector_trigger();

CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING gin (search_vector);

-- Enable Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all visible, non-deleted posts
CREATE POLICY "Users can view visible posts"
  ON posts FOR SELECT
  USING (is_visible = true AND deleted_at IS NULL);

-- Policy: Users can create their own posts
CREATE POLICY "Users can create their own posts"
  ON posts FOR INSERT
  WITH CHECK (true); -- You may want to add auth check here

-- Policy: Users can update their own posts
CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  USING (true); -- You may want to add auth check: clerk_user_id = auth.jwt() ->> 'sub'
  WITH CHECK (true);

-- Policy: Users can delete their own posts (soft delete)
CREATE POLICY "Users can delete their own posts"
  ON posts FOR UPDATE
  USING (true); -- You may want to add auth check here
  WITH CHECK (true);

