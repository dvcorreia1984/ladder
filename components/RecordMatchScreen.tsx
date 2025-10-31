'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types';
import { createMatch, processMatchResult } from '@/lib/api';

interface RecordMatchScreenProps {
  players: Player[];
  onMatchRecorded: () => void;
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
    if (players.length > 1 && !loserId) {
      setLoserId(players[1].id);
    }
  }, [players]);

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
      
      setSuccess(true);
      setWinnerScore('');
      setLoserScore('');
      
      setTimeout(() => {
        onMatchRecorded();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to record match');
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
            className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500`}
            disabled={isSubmitting}
          >
            <option value="">Select winner...</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>
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
            className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500`}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
            Loser
          </label>
          <select
            value={loserId}
            onChange={(e) => setLoserId(e.target.value)}
            className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500`}
            disabled={isSubmitting}
          >
            <option value="">Select loser...</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name} (Rank #{player.rank})
              </option>
            ))}
          </select>
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
            className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500`}
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
