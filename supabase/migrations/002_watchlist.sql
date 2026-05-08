-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Using TEXT for demo flexibility
    content_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, content_id)
);

-- Enable RLS
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Allow all for demo purposes
CREATE POLICY "Allow all for demo" ON watchlist
    FOR ALL
    USING (true)
    WITH CHECK (true);
