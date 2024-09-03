-- Create debates table
CREATE TABLE debates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic TEXT NOT NULL,
    debater1 TEXT NOT NULL,
    debater2 TEXT NOT NULL,
    votes_debater1 INTEGER DEFAULT 0,
    votes_debater2 INTEGER DEFAULT 0,
    last_blink TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_engagement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_at for efficient sorting
CREATE INDEX idx_debates_created_at ON debates(created_at);

-- Create index on last_engagement_date for efficient sorting
CREATE INDEX idx_debates_last_engagement ON debates(last_engagement_date);

-- Create or replace function to increment votes
CREATE OR REPLACE FUNCTION increment(x INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN x + 1;
END;
$$ LANGUAGE plpgsql;