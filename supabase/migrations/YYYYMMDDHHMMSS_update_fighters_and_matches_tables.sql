-- Update fighters table
ALTER TABLE fighters
DROP COLUMN wins,
DROP COLUMN losses,
ADD COLUMN image TEXT;

-- Update matches table
ALTER TABLE matches
DROP COLUMN winner_id,
ADD COLUMN votes_fighter1 INTEGER DEFAULT 0,
ADD COLUMN votes_fighter2 INTEGER DEFAULT 0;

-- In case the tables don't exist, create them with the new structure
CREATE TABLE IF NOT EXISTS fighters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fighter1_id UUID REFERENCES fighters(id),
  fighter2_id UUID REFERENCES fighters(id),
  votes_fighter1 INTEGER DEFAULT 0,
  votes_fighter2 INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);