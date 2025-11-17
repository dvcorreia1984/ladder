import { supabase, getSupabaseAdmin } from './supabase';
import { Player, Match } from '@/types';

// Players
export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('rank', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function createPlayer(name: string): Promise<Player> {
  // Get current max rank
  const players = await getPlayers();
  const maxRank = players.length > 0 ? Math.max(...players.map(p => p.rank)) : 0;
  const newRank = maxRank + 1;

  const { data, error } = await getSupabaseAdmin()
    .from('players')
    .insert({ name, rank: newRank })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
  const { data, error } = await getSupabaseAdmin()
    .from('players')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('players')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function reorderRanks(updates: { id: string; rank: number }[]): Promise<void> {
  const admin = getSupabaseAdmin();
  for (const update of updates) {
    const { error } = await admin
      .from('players')
      .update({ rank: update.rank })
      .eq('id', update.id);
    if (error) throw error;
  }
}

// Matches
export async function getMatches(limit: number = 100): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      winner:players!winner_id(*),
      loser:players!loser_id(*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function createMatch(
  winnerId: string,
  loserId: string,
  winnerScore: number,
  loserScore: number
): Promise<Match> {
  // Prevent duplicate matches (within 5 minutes)
  const recentMatches = await supabase
    .from('matches')
    .select('*')
    .eq('winner_id', winnerId)
    .eq('loser_id', loserId)
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());
  
  if (recentMatches.data && recentMatches.data.length > 0) {
    throw new Error('A match between these players was recently recorded. Please wait a few minutes.');
  }

  // Use anon key for match recording (allowed by RLS for kiosk mode)
  const { data, error } = await supabase
    .from('matches')
    .insert({
      winner_id: winnerId,
      loser_id: loserId,
      winner_score: winnerScore,
      loser_score: loserScore,
    })
    .select(`
      *,
      winner:players!winner_id(*),
      loser:players!loser_id(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
}

// Ladder ranking logic
// This now delegates to the API route which has server-side access to the service role key
export async function processMatchResult(match: Match): Promise<void> {
  const response = await fetch('/api/match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'processMatchResult',
      match: match,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process match result');
  }
}

// Settings
export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data?.value || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, {
      onConflict: 'key'
    });
  
  if (error) throw error;
}

// Seed sample players
export async function seedSamplePlayers(): Promise<void> {
  const existingPlayers = await getPlayers();
  if (existingPlayers.length > 0) {
    throw new Error('Players already exist. Clear players first to seed.');
  }

  const sampleNames = [
    'Alex Johnson',
    'Sarah Williams',
    'Michael Brown',
    'Emily Davis',
    'David Miller',
    'Jessica Wilson',
    'James Moore',
    'Amanda Taylor',
  ];

  const admin = getSupabaseAdmin();
  const players = sampleNames.map((name, index) => ({
    name,
    rank: index + 1,
  }));

  const { error } = await admin
    .from('players')
    .insert(players);
  
  if (error) throw error;
}

// Payments
export async function initiatePayment(
  playerId: string,
  amount: number,
  options?: {
    currency?: string;
    description?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    cellNumber?: string;
  }
): Promise<{ payment_id: string; payfast_url: string; payfast_data: Record<string, string> }> {
  const response = await fetch('/api/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'initiate',
      player_id: playerId,
      amount,
      currency: options?.currency || 'ZAR',
      description: options?.description,
      first_name: options?.firstName,
      last_name: options?.lastName,
      email: options?.email,
      cell_number: options?.cellNumber,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initiate payment');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to initiate payment');
  }

  return {
    payment_id: data.payment_id,
    payfast_url: data.payfast_url,
    payfast_data: data.payfast_data,
  };
}

export async function getPaymentStatus(paymentId: string): Promise<any> {
  const response = await fetch('/api/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'status',
      payment_id: paymentId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get payment status');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to get payment status');
  }

  return data.payment;
}

export async function getPayments(playerId?: string): Promise<any[]> {
  const admin = getSupabaseAdmin();
  let query = admin
    .from('payments')
    .select('*, player:players(*)')
    .order('created_at', { ascending: false });

  if (playerId) {
    query = query.eq('player_id', playerId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}
