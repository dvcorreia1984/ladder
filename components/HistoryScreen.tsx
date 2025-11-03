'use client';

import { Match } from '@/types';
import { useI18n } from '@/lib/i18n/context';
import { format } from 'date-fns';

interface HistoryScreenProps {
  matches: Match[];
  kioskMode: boolean;
}

export default function HistoryScreen({ matches, kioskMode }: HistoryScreenProps) {
  const { t } = useI18n();
  const textSize = kioskMode ? 'text-2xl' : 'text-base';
  const headerSize = kioskMode ? 'text-4xl' : 'text-2xl';
  const rowPadding = kioskMode ? 'p-5' : 'p-3';

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h1 className={`${headerSize} font-bold mb-6 text-center text-gray-800`}>
        {t('historyTitle')}
      </h1>

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <p className={`${textSize} text-gray-500`}>{t('historyNoMatches')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className={`${rowPadding} ${textSize} text-left font-bold text-gray-700`}>{t('historyDate')}</th>
                <th className={`${rowPadding} ${textSize} text-left font-bold text-gray-700`}>{t('historyWinner')}</th>
                <th className={`${rowPadding} ${textSize} text-left font-bold text-gray-700`}>{t('historyScore')}</th>
                <th className={`${rowPadding} ${textSize} text-left font-bold text-gray-700`}>{t('historyLoser')}</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className={rowPadding}>
                    <span className={textSize}>
                      {format(new Date(match.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </td>
                  <td className={rowPadding}>
                    <span className={`${textSize} font-semibold text-green-700`}>
                      {match.winner?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className={rowPadding}>
                    <span className={`${textSize} font-bold`}>
                      {match.winner_score} - {match.loser_score}
                    </span>
                  </td>
                  <td className={rowPadding}>
                    <span className={`${textSize} font-semibold text-red-700`}>
                      {match.loser?.name || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
