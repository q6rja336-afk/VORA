-- VORA: Continue Watching progress table
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS watch_progress (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          TEXT        NOT NULL,
  content_id       TEXT        NOT NULL,
  position_seconds NUMERIC     NOT NULL DEFAULT 0,
  duration_seconds NUMERIC     NOT NULL DEFAULT 0,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, content_id)
);

-- Index for fast lookups per user
CREATE INDEX IF NOT EXISTS idx_watch_progress_user_id ON watch_progress (user_id, updated_at DESC);

-- Row Level Security (enable for production)
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see/edit their own rows
CREATE POLICY "Users manage their own progress"
  ON watch_progress
  FOR ALL
  USING  (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
