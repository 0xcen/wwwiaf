-- Add ranking field to fighters table
ALTER TABLE fighters ADD COLUMN rank FLOAT DEFAULT 0;

-- Add ranking and last engagement date fields to matches table
ALTER TABLE matches ADD COLUMN rank FLOAT DEFAULT 0;
ALTER TABLE matches ADD COLUMN last_engagement_date TIMESTAMP WITH TIME ZONE;

-- Create index on rank column for both tables to improve query performance
CREATE INDEX idx_fighters_rank ON fighters(rank);
CREATE INDEX idx_matches_rank ON matches(rank);