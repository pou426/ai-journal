-- Create tables
CREATE TABLE journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    entry TEXT NOT NULL,
    sentiment_score DOUBLE PRECISION,
    date DATE NOT NULL
);

CREATE TABLE snippets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    entry TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row-Level Security (RLS) on tables
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

-- Create policies for journals table
CREATE POLICY "Users can insert their own journal entries"
ON journals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
ON journals
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
ON journals
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own journal entries"
ON journals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for snippets table
CREATE POLICY "Users can insert their own snippets"
ON snippets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snippets"
ON snippets
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own snippets"
ON snippets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own snippets"
ON snippets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);