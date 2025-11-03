'use client';

import { useState, useEffect } from 'react';
import { Player, Match } from '@/types';
import { getPlayers, getMatches } from '@/lib/api';
import LadderScreen from '@/components/LadderScreen';
import RecordMatchScreen from '@/components/RecordMatchScreen';
import HistoryScreen from '@/components/HistoryScreen';
import AdminScreen from '@/components/AdminScreen';

type Screen = 'ladder' | 'record' | 'history' | 'admin';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('ladder');
  const [kioskMode, setKioskMode] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for kiosk mode in localStorage
    const savedKioskMode = localStorage.getItem('kioskMode') === 'true';
    setKioskMode(savedKioskMode);
    
    // Enter fullscreen if kiosk mode
    if (savedKioskMode) {
      document.documentElement.classList.add('kiosk-mode');
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [playersData, matchesData] = await Promise.all([
        getPlayers(),
        getMatches(50),
      ]);
      setPlayers(playersData);
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleMatchRecorded = async () => {
    await loadData();
  };

  const handleToggleKioskMode = () => {
    const newKioskMode = !kioskMode;
    setKioskMode(newKioskMode);
    localStorage.setItem('kioskMode', String(newKioskMode));
    
    if (newKioskMode) {
      document.documentElement.classList.add('kiosk-mode');
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      document.documentElement.classList.remove('kiosk-mode');
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const buttonClass = kioskMode 
    ? 'px-8 py-6 text-2xl font-bold rounded-lg shadow-lg transition-all active:scale-95'
    : 'px-6 py-3 text-lg font-semibold rounded-lg shadow-md transition-all hover:scale-105 active:scale-95';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${kioskMode ? 'fixed inset-0 overflow-hidden' : ''}`}>
      {/* Navigation */}
      <nav className={`bg-white shadow-lg ${kioskMode ? 'p-4' : 'p-3'}`}>
        <div className={`container mx-auto flex ${kioskMode ? 'gap-4' : 'gap-2'} flex-wrap justify-center`}>
          <button
            onClick={() => setCurrentScreen('ladder')}
            className={`${buttonClass} ${
              currentScreen === 'ladder'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📊 Ladder
          </button>
          <button
            onClick={() => setCurrentScreen('record')}
            className={`${buttonClass} ${
              currentScreen === 'record'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🏆 Record Match
          </button>
          <button
            onClick={() => setCurrentScreen('history')}
            className={`${buttonClass} ${
              currentScreen === 'history'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📜 History
          </button>
          <button
            onClick={() => setCurrentScreen('admin')}
            className={`${buttonClass} ${
              currentScreen === 'admin'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ⚙️ Admin
          </button>
          <button
            onClick={handleToggleKioskMode}
            className={`${buttonClass} ${
              kioskMode
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {kioskMode ? '🖥️ Exit Kiosk' : '🖥️ Kiosk Mode'}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`container mx-auto ${kioskMode ? 'p-6 h-[calc(100vh-120px)] overflow-auto' : 'p-4'}`}>
        {currentScreen === 'ladder' && (
          <LadderScreen
            players={players}
            onChallenge={(player1, player2) => {
              setCurrentScreen('record');
            }}
            onMatchRecorded={handleMatchRecorded}
            kioskMode={kioskMode}
          />
        )}
        {currentScreen === 'record' && (
          <RecordMatchScreen
            players={players}
            onMatchRecorded={handleMatchRecorded}
            kioskMode={kioskMode}
          />
        )}
        {currentScreen === 'history' && (
          <HistoryScreen matches={matches} kioskMode={kioskMode} />
        )}
        {currentScreen === 'admin' && (
          <AdminScreen
            players={players}
            onDataChanged={loadData}
            isAuthenticated={isAdmin}
            onAuthenticate={setIsAdmin}
            kioskMode={kioskMode}
          />
        )}
      </main>
    </div>
  );
}
