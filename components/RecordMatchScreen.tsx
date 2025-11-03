'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types';
import { createMatch, processMatchResult } from '@/lib/api';

interface RecordMatchScreenProps {
  players: Player[];
  onMatchRecorded: () => void | Promise<void>;
  kioskMode: boolean;
}

export default function RecordMatchScreen({ players, onMatchRecorded, kioskMode }: RecordMatchScreenProps) {
  const [winnerId, setWinnerId] = useState<string>('');
  const [loserId, setLoserId] = useState<string>('');
  const [winnerScore, setWinnerScore] = useState<string>('');
  const [loserScore, setLoserScore] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (players.length > 0 && !winnerId) {
      setWinnerId(players[0].id);
    }
  }, [players, winnerId]);

  // Set initial loser when winner is set
  useEffect(() => {
    if (winnerId && !loserId) {
      const winner = players.find(p => p.id === winnerId);
      if (winner) {
        // Find the first challengable player (up to 3 ranks above)
        const challengablePlayers = players.filter(p => 
          p.id !== winnerId &&
          p.rank < winner.rank && 
          (winner.rank - p.rank) <= 3
        );
        if (challengablePlayers.length > 0) {
          setLoserId(challengablePlayers[0].id);
        }
      }
    }
  }, [winnerId, players, loserId]);

  // Clear loser selection when winner changes and current loser is no longer valid
  useEffect(() => {
    if (winnerId && loserId) {
      const winner = players.find(p => p.id === winnerId);
      const loser = players.find(p => p.id === loserId);
      
      if (winner && loser) {
        // Check if the current loser is still a valid challenge option
        const isValidChallenge = loser.rank < winner.rank && (winner.rank - loser.rank) <= 3;
        if (!isValidChallenge) {
          setLoserId('');
        }
      }
    }
  }, [winnerId, players, loserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!winnerId || !loserId) {
      setError('Please select both winner and loser');
      return;
    }

    if (winnerId === loserId) {
      setError('Winner and loser must be different players');
      return;
    }

    // Challenge restriction: winner can only challenge up to 3 players above them
    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id === loserId);

    if (winner && loser) {
      // Winner's rank should be higher (lower rank number = higher position)
      // So loser should have a lower rank number (higher position)
      // And the difference should be at most 3
      if (loser.rank > winner.rank) {
        setError('You cannot challenge players ranked below you');
        return;
      }
      
      if (winner.rank - loser.rank > 3) {
        setError('You can only challenge players up to 3 ranks above you');
        return;
      }
    }

    const wScore = parseInt(winnerScore);
    const lScore = parseInt(loserScore);

    if (isNaN(wScore) || isNaN(lScore) || wScore <= lScore) {
      setError('Winner score must be higher than loser score');
      return;
    }

    setIsSubmitting(true);

    try {
      const match = await createMatch(winnerId, loserId, wScore, lScore);
      await processMatchResult(match);
      
      // Immediately refresh the ladder data
      await onMatchRecorded();
      
      setSuccess(true);
      setWinnerScore('');
      setLoserScore('');
      
      // Clear success message after a short delay
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to record match');
      console.error('Error recording match:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const textSize = kioskMode ? 'text-2xl' : 'text-lg';
  const inputSize = kioskMode ? 'px-6 py-4 text-xl' : 'px-4 py-2 text-base';
  const buttonSize = kioskMode ? 'px-12 py-6 text-2xl' : 'px-6 py-3 text-lg';

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h1 className={`${kioskMode ? 'text-5xl' : 'text-3xl'} font-bold mb-6 text-center text-gray-800`}>
        Record Match Result
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {error && (
          <div className={`${kioskMode ? 'p-4 text-xl' : 'p-3 text-base'} bg-red-100 text-red-700 rounded-lg border border-red-300`}>
            {error}
          </div>
        )}

        {success && (
          <div className={`${kioskMode ? 'p-4 text-xl' : 'p-3 text-base'} bg-green-100 text-green-700 rounded-lg border border-green-300`}>
            Match recorded successfully! Updating ladder...
          </div>
        )}

        <div>
          <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
            Winner
          </label>
          <select
            value={winnerId}
            onChange={(e) => setWinnerId(e.target.value)}
            className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white`}
            disabled={isSubmitting}
            style={{ color: 'rgb(17, 24, 39)' }}
          >
            <option value="" style={{ color: 'rgb(17, 24, 39)', backgroundColor: 'white' }}>Select winner...</option>
            {players.map(player => (
              <option key={player.id} value={player.id} style={{ color: 'rgb(17, 24, 39)', backgroundColor: 'white' }}>
                {player.name} (Rank #{player.rank})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
            Winner Score
          </label>
          <input
            type="number"
            value={winnerScore}
            onChange={(e) => setWinnerScore(e.target.value)}
            min="0"
            className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white`}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
            Opponent
          </label>
          <select
            value={loserId}
            onChange={(e) => setLoserId(e.target.value)}
            className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white`}
            disabled={isSubmitting}
            style={{ color: 'rgb(17, 24, 39)' }}
          >
            <option value="" style={{ color: 'rgb(17, 24, 39)', backgroundColor: 'white' }}>Select opponent...</option>
            {(() => {
              const winner = players.find(p => p.id === winnerId);
              // Filter players: can only challenge up to 3 ranks above (lower rank number = higher position)
              const challengablePlayers = winner 
                ? players.filter(p => 
                    p.id !== winnerId &&
                    p.rank < winner.rank && 
                    (winner.rank - p.rank) <= 3
                  )
                : players.filter(p => p.id !== winnerId);
              
              return challengablePlayers.map(player => (
                <option key={player.id} value={player.id} style={{ color: 'rgb(17, 24, 39)', backgroundColor: 'white' }}>
                  {player.name} (Rank #{player.rank})
                </option>
              ));
            })()}
          </select>
          {winnerId && (() => {
            const winner = players.find(p => p.id === winnerId);
            const challengableCount = winner 
              ? players.filter(p => 
                  p.id !== winnerId &&
                  p.rank < winner.rank && 
                  (winner.rank - p.rank) <= 3
                ).length
              : 0;
            
            if (challengableCount === 0) {
              return (
                <p className={`${kioskMode ? 'text-lg' : 'text-sm'} text-gray-500 mt-2`}>
                  No challengable players above this player
                </p>
              );
            }
            return null;
          })()}
        </div>

        <div>
          <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
            Loser Score
          </label>
          <input
            type="number"
            value={loserScore}
            onChange={(e) => setLoserScore(e.target.value)}
            min="0"
            className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white`}
            disabled={isSubmitting}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${buttonSize} w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? 'Recording...' : 'Record Match'}
        </button>
      </form>
    </div>
  );
}
