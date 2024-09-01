-- Ensure rank columns are DOUBLE PRECISION
ALTER TABLE fighters ALTER COLUMN rank TYPE DOUBLE PRECISION;
ALTER TABLE matches ALTER COLUMN rank TYPE DOUBLE PRECISION;

-- Add a default value to rank columns if not already set
ALTER TABLE fighters ALTER COLUMN rank SET DEFAULT 0;
ALTER TABLE matches ALTER COLUMN rank SET DEFAULT 0;

-- Ensure last_engagement_date exists on matches table
ALTER TABLE matches ADD COLUMN IF NOT EXISTS last_engagement_date TIMESTAMP WITH TIME ZONE;

-- Recreate indexes with DESC order for better performance on recent rankings
DROP INDEX IF EXISTS idx_fighters_rank;
CREATE INDEX idx_fighters_rank ON fighters(rank DESC);

DROP INDEX IF EXISTS idx_matches_rank;
CREATE INDEX idx_matches_rank ON matches(rank DESC);