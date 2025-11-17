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

export interface Payment {
  id: string;
  player_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  transaction_id?: string;
  payfast_payment_id?: string;
  created_at: string;
  updated_at: string;
  player?: Player;
}

export interface PaymentRequest {
  player_id: string;
  amount: number;
  currency?: string;
  description?: string;
}
