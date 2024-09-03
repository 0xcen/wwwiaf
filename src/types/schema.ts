export interface Fighter {
  id: string;
  username: string; // twitter handle
  image: string; // twitter profile image
  rank: number; // New field
}

export interface Match {
  id: string;
  fighter1_id: string; // relation to fighters table
  fighter2_id: string; // relation to fighters table
  votes_fighter1: number;
  votes_fighter2: number;
  rank: number; // New field
  lastEngagementDate: Date; // New field
}

export interface Debate {
  id: string;
  topic: string;
  debater1: string;
  debater2: string;
  votes_debater1: number;
  votes_debater2: number;
  last_blink: Date | null;
  image_url: string;
}
