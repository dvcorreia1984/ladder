export interface Player {
  id: string;
  name: string;
  rank: number;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  winner_id: string;
  loser_id: string;
  winner_score: number;
  loser_score: number;
  created_at: string;
  winner?: Player;
  loser?: Player;
}

export interface Settings {
  key: string;
  value: string;
  updated_at: string;
}
