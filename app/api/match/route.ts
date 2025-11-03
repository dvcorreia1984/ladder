import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { Player, Match } from '@/types';

// This API route handles match creation and ranking updates server-side
// This ensures we have proper permissions for admin operations

async function getPlayers() {
  const { data, error } = await getSupabaseAdmin()
    .from('players')
    .select('*')
    .order('rank', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

async function processMatchResult(match: Match): Promise<void> {
  const players = await getPlayers();
  const winner = players.find(p => p.id === match.winner_id);
  const loser = players.find(p => p.id === match.loser_id);

  if (!winner || !loser) {
    throw new Error('Winner or loser not found');
  }

  console.log('[processMatchResult] Processing:', { winner: winner.name, winnerRank: winner.rank, loser: loser.name, loserRank: loser.rank });

  // Rule: If lower-ranked player beats higher-ranked player,
  // winner takes higher rank, loser moves one place down
  // All players below the loser's rank move down by 1 (like a queue)
  if (winner.rank > loser.rank) {
    console.log('[processMatchResult] Ranks will be swapped');
    const winnerOldRank = winner.rank;
    const loserOldRank = loser.rank;
    
    // All players below the loser's rank will move down by 1
    const playersBelow = players.filter(
      p => p.id !== winner.id && 
           p.id !== loser.id && 
           p.rank > loserOldRank
    );
    
    // Use admin client (this is server-side so it has the service role key)
    const admin = getSupabaseAdmin();
    const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('[processMatchResult] Using admin client, service role key available:', hasServiceRole);
    
    // Store old ranks before making any changes
    const oldRanks = new Map<string, number>();
    oldRanks.set(winner.id, winnerOldRank);
    oldRanks.set(loser.id, loserOldRank);
    for (const player of playersBelow) {
      oldRanks.set(player.id, player.rank);
    }
    
    // Use temporary ranks to avoid conflicts during updates
    const maxRank = Math.max(...players.map(p => p.rank));
    let tempRankOffset = maxRank + 1000;
    
    // Step 1: Move all affected players to temporary ranks (highest rank first)
    const affectedPlayers = [
      ...playersBelow,
      loser,
      winner
    ].sort((a, b) => b.rank - a.rank);
    
    for (const player of affectedPlayers) {
      const { error } = await admin
        .from('players')
        .update({ rank: tempRankOffset })
        .eq('id', player.id);
      if (error) {
        throw new Error(`Failed to move player ${player.id} to temporary rank: ${error.message}`);
      }
      tempRankOffset++;
    }
    
    // Step 2: Update all players to their final ranks using stored old ranks
    // Winner takes loser's rank
    const { error: winnerError } = await admin
      .from('players')
      .update({ rank: loserOldRank })
      .eq('id', winner.id);
    if (winnerError) {
      throw new Error(`Failed to update winner rank: ${winnerError.message}`);
    }
    
    // Loser moves one place down (rank increases by 1)
    const { error: loserError } = await admin
      .from('players')
      .update({ rank: loserOldRank + 1 })
      .eq('id', loser.id);
    if (loserError) {
      throw new Error(`Failed to update loser rank: ${loserError.message}`);
    }
    
    // All players below the loser shift down by 1 (rank increases by 1) - update from lowest to highest
    const sortedBelow = [...playersBelow].sort((a, b) => a.rank - b.rank);
    for (const player of sortedBelow) {
      const oldRank = oldRanks.get(player.id)!;
      const { error } = await admin
        .from('players')
        .update({ rank: oldRank + 1 })
        .eq('id', player.id);
      if (error) {
        throw new Error(`Failed to update player below loser rank: ${error.message}`);
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    console.log('[API Match Route] Received request:', { action, matchIds: params.match ? `${params.match.winner_id} vs ${params.match.loser_id}` : 'none' });

    if (action === 'processMatchResult') {
      const match: Match = params.match;
      await processMatchResult(match);
      console.log('[API Match Route] Rankings updated successfully');
      return NextResponse.json({ success: true, message: 'Rankings updated successfully' });
    }
    
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('[API Match Route] Error processing match result:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

