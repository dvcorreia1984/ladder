'use client';

import { Player } from '@/types';

interface LadderScreenProps {
  players: Player[];
  onChallenge: (player1: Player, player2: Player) => void;
  kioskMode: boolean;
}

export default function LadderScreen({ players, onChallenge, kioskMode }: LadderScreenProps) {
  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}.`;
  };

  const textSize = kioskMode ? 'text-3xl' : 'text-xl';
  const buttonSize = kioskMode ? 'px-8 py-6 text-xl' : 'px-4 py-2 text-base';
  const rowPadding = kioskMode ? 'p-6' : 'p-4';

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h1 className={`${kioskMode ? 'text-5xl' : 'text-3xl'} font-bold mb-6 text-center text-gray-800`}>
        Current Ladder
      </h1>
      
      {players.length === 0 ? (
        <div className="text-center py-12">
          <p className={`${textSize} text-gray-500 mb-4`}>No players yet.</p>
          <p className={`${textSize} text-gray-400`}>Add players in Admin to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {players.map((player, index) => {
            const nextPlayer = players[index + 1];
            return (
              <div
                key={player.id}
                className={`${rowPadding} bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 flex items-center justify-between ${
                  kioskMode ? 'mb-4' : 'mb-2'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`${kioskMode ? 'text-4xl' : 'text-2xl'} font-bold text-blue-700 min-w-[80px]`}>
                    {getRankEmoji(player.rank)}
                  </span>
                  <span className={`${textSize} font-semibold text-gray-800`}>
                    {player.name}
                  </span>
                </div>
                
                {nextPlayer && (
                  <button
                    onClick={() => onChallenge(player, nextPlayer)}
                    className={`${buttonSize} bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md transition-all active:scale-95`}
                  >
                    Challenge {nextPlayer.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
