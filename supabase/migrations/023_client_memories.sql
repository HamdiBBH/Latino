-- Migration 023: Client Memories Schema & Storage

-- 1. Create the user-memories storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-memories',
    'user-memories',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user-memories bucket
CREATE POLICY "Public read user memories" ON storage.objects FOR SELECT TO public USING (bucket_id = 'user-memories');

CREATE POLICY "Users can upload their own memories" ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'user-memories' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own memories" ON storage.objects FOR UPDATE TO authenticated 
USING (bucket_id = 'user-memories' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own memories" ON storage.objects FOR DELETE TO authenticated 
USING (bucket_id = 'user-memories' AND (storage.foldername(name))[1] = auth.uid()::text);


-- 2. Create client_memories table
CREATE TABLE IF NOT EXISTS client_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    caption TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_memories_user_id ON client_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_client_memories_created_at ON client_memories(created_at);

-- RLS Policies for client_memories
ALTER TABLE client_memories ENABLE ROW LEVEL SECURITY;

-- Users can view their own memories
CREATE POLICY "Users can view own memories" ON client_memories FOR SELECT
    USING (user_id = auth.uid());

-- Staff can view all memories (optional, but good for admin dashboard if needed later)
CREATE POLICY "Staff can view all memories" ON client_memories FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')));

-- Users can insert their own memories
CREATE POLICY "Users can insert own memories" ON client_memories FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own memories (e.g. caption, favorite)
CREATE POLICY "Users can update own memories" ON client_memories FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own memories
CREATE POLICY "Users can delete own memories" ON client_memories FOR DELETE
    USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_client_memories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_client_memories_updated_at ON client_memories;
CREATE TRIGGER trigger_client_memories_updated_at
    BEFORE UPDATE ON client_memories
    FOR EACH ROW
    EXECUTE FUNCTION update_client_memories_updated_at();
