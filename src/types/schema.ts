export interface Fighter {
  id: string;
  username: string; // twitter handle
  image: string; // twitter profile image
}

export interface Match {
  id: string;
  fighter1_id: string; // relation to fighters table
  fighter2_id: string; // relation to fighters table
  votes_fighter1: number;
  votes_fighter2: number;
}

// all votes for a match by adding fighter 1 votes and fighter 2 votes
