'use client';

import { useState, useEffect } from 'react';
import { Player } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import { createMatch, processMatchResult } from '@/lib/api';

interface ChallengeModalProps {
  challenger: Player;
  target: Player;
  onClose: () => void;
  onMatchRecorded: () => Promise<void>;
  kioskMode: boolean;
}

export default function ChallengeModal({
  challenger,
  target,
  onClose,
  onMatchRecorded,
  kioskMode,
}: ChallengeModalProps) {
  const { t } = useI18n();
  const [winnerScore, setWinnerScore] = useState<string>('');
  const [loserScore, setLoserScore] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Determine winner based on the challenge (challenger wins if they beat someone above them)
  const winner = challenger;
  const loser = target;

  useEffect(() => {
    // Close modal on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const wScore = parseInt(winnerScore);
    const lScore = parseInt(loserScore);

    if (isNaN(wScore) || isNaN(lScore) || wScore <= lScore) {
      setError(t('challengeErrorScore'));
      return;
    }

    // Validate challenge restriction
    if (challenger.rank <= target.rank) {
      setError(t('challengeErrorInvalid'));
      return;
    }
    
    if (challenger.rank - target.rank > 3) {
      setError(t('challengeErrorMaxRank'));
      return;
    }

    setIsSubmitting(true);

    try {
      const match = await createMatch(winner.id, loser.id, wScore, lScore);
      await processMatchResult(match);
      
      // Immediately refresh the ladder data
      await onMatchRecorded();
      
      setSuccess(true);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
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
  const headingSize = kioskMode ? 'text-4xl' : 'text-2xl';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className={`${headingSize} font-bold text-gray-800`}>
              {t('challengeTitle')}
            </h2>
            <button
              onClick={onClose}
              className={`${kioskMode ? 'text-3xl' : 'text-2xl'} text-gray-500 hover:text-gray-700 transition-colors`}
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className={`${kioskMode ? 'p-4 text-xl' : 'p-3 text-base'} bg-red-100 text-red-700 rounded-lg border border-red-300`}>
              {error}
            </div>
          )}

          {success && (
            <div className={`${kioskMode ? 'p-4 text-xl' : 'p-3 text-base'} bg-green-100 text-green-700 rounded-lg border border-green-300`}>
              {t('challengeSuccess')}
            </div>
          )}

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-gray-200">
            <p className={`${textSize} font-semibold text-gray-700 mb-2`}>
              🏆 {winner.name}
            </p>
            <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
              {t('challengeWinnerScore')}
            </label>
            <input
              type="number"
              value={winnerScore}
              onChange={(e) => setWinnerScore(e.target.value)}
              min="0"
              className={`${inputSize} w-full border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white`}
              disabled={isSubmitting}
              required
              autoFocus
            />
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border-2 border-gray-200">
            <p className={`${textSize} font-semibold text-gray-700 mb-2`}>
              😢 {loser.name}
            </p>
            <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
              {t('challengeLoserScore')}
            </label>
            <input
              type="number"
              value={loserScore}
              onChange={(e) => setLoserScore(e.target.value)}
              min="0"
              className={`${inputSize} w-full border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white`}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`${buttonSize} flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t('challengeCancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${buttonSize} flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? t('challengeRecording') : t('challengeRecordMatch')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

