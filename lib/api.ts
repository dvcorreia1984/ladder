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
export async function processMatchResult(match: Match): Promise<void> {
  const players = await getPlayers();
  const winner = players.find(p => p.id === match.winner_id);
  const loser = players.find(p => p.id === match.loser_id);

  if (!winner || !loser) {
    throw new Error('Winner or loser not found');
  }

  // Rule: If lower-ranked player beats higher-ranked player,
  // winner takes higher rank, loser moves one place down
  if (winner.rank > loser.rank) {
    // Winner was lower ranked - swap their positions
    const winnerOldRank = winner.rank;
    const loserOldRank = loser.rank;
    
    // Use anon key for ranking updates (allowed by RLS)
    // Winner takes loser's rank
    const { error: winnerError } = await supabase
      .from('players')
      .update({ rank: loserOldRank })
      .eq('id', winner.id);
    if (winnerError) throw winnerError;
    
    // Loser moves one place down (becomes winner's old rank)
    const { error: loserError } = await supabase
      .from('players')
      .update({ rank: winnerOldRank })
      .eq('id', loser.id);
    if (loserError) throw loserError;
    
    // If there are players between the old positions, shift them
    const playersBetween = players.filter(
      p => p.id !== winner.id && 
           p.id !== loser.id && 
           p.rank < loserOldRank && 
           p.rank > winnerOldRank
    );
    
    // Shift players down by 1
    for (const player of playersBetween) {
      const { error } = await supabase
        .from('players')
        .update({ rank: player.rank + 1 })
        .eq('id', player.id);
      if (error) throw error;
    }
  } else {
    // Winner was already higher ranked - no change needed
    // But we still record the match for history
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
