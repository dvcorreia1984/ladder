'use client';

import { useState, useEffect, useRef } from 'react';
import { Player } from '@/types';
import {
  createPlayer,
  updatePlayer,
  deletePlayer,
  getSetting,
  setSetting,
  seedSamplePlayers,
} from '@/lib/api';
import Papa from 'papaparse';

interface AdminScreenProps {
  players: Player[];
  onDataChanged: () => void;
  isAuthenticated: boolean;
  onAuthenticate: (auth: boolean) => void;
  kioskMode: boolean;
}

export default function AdminScreen({
  players,
  onDataChanged,
  isAuthenticated,
  onAuthenticate,
  kioskMode,
}: AdminScreenProps) {
  const [pin, setPin] = useState('');
  const [adminPin, setAdminPin] = useState<string>('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'players' | 'settings'>('players');
  
  // Player management
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminPin();
    }
  }, [isAuthenticated]);

  const loadAdminPin = async () => {
    try {
      const pin = await getSetting('admin_pin');
      setAdminPin(pin || '1234');
    } catch (error) {
      console.error('Error loading admin PIN:', error);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    try {
      const savedPin = await getSetting('admin_pin');
      const correctPin = savedPin || '1234';

      if (pin === correctPin) {
        onAuthenticate(true);
        setPin('');
      } else {
        setPinError('Incorrect PIN');
        setPin('');
      }
    } catch (error) {
      setPinError('Error verifying PIN');
    }
  };

  const handleLogout = () => {
    onAuthenticate(false);
    setPin('');
    setActiveTab('players');
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) {
      setMessage({ type: 'error', text: 'Player name is required' });
      return;
    }

    try {
      await createPlayer(newPlayerName.trim());
      setNewPlayerName('');
      setMessage({ type: 'success', text: 'Player created successfully' });
      onDataChanged();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create player' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setEditName(player.name);
  };

  const handleUpdatePlayer = async () => {
    if (!editingPlayer || !editName.trim()) {
      setMessage({ type: 'error', text: 'Player name is required' });
      return;
    }

    try {
      await updatePlayer(editingPlayer.id, { name: editName.trim() });
      setEditingPlayer(null);
      setEditName('');
      setMessage({ type: 'success', text: 'Player updated successfully' });
      onDataChanged();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update player' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this player? This will also delete their match history.')) {
      return;
    }

    try {
      await deletePlayer(id);
      setMessage({ type: 'success', text: 'Player deleted successfully' });
      onDataChanged();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete player' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleSeedPlayers = async () => {
    if (!confirm('This will add 8 sample players. Continue?')) {
      return;
    }

    try {
      await seedSamplePlayers();
      setMessage({ type: 'success', text: 'Sample players added successfully' });
      onDataChanged();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to seed players' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleExportCSV = () => {
    const csvData = players.map((p, index) => ({
      Rank: p.rank,
      Name: p.name,
      'Created At': new Date(p.created_at).toLocaleString(),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ladder_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const importedPlayers = results.data as any[];
          let importedCount = 0;

          for (const row of importedPlayers) {
            if (row.Name && row.Name.trim()) {
              await createPlayer(row.Name.trim());
              importedCount++;
            }
          }

          setMessage({ type: 'success', text: `Imported ${importedCount} players successfully` });
          onDataChanged();
          setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
          setMessage({ type: 'error', text: error.message || 'Failed to import players' });
          setTimeout(() => setMessage(null), 5000);
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      },
      error: (error) => {
        setMessage({ type: 'error', text: `CSV parse error: ${error.message}` });
        setTimeout(() => setMessage(null), 5000);
      },
    });
  };

  const handleUpdateAdminPin = async () => {
    if (!adminPin || adminPin.length < 4) {
      setMessage({ type: 'error', text: 'PIN must be at least 4 characters' });
      return;
    }

    try {
      await setSetting('admin_pin', adminPin);
      setMessage({ type: 'success', text: 'Admin PIN updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update PIN' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const textSize = kioskMode ? 'text-2xl' : 'text-lg';
  const inputSize = kioskMode ? 'px-6 py-4 text-xl' : 'px-4 py-2 text-base';
  const buttonSize = kioskMode ? 'px-8 py-4 text-xl' : 'px-4 py-2 text-base';
  const headerSize = kioskMode ? 'text-4xl' : 'text-2xl';

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
        <h1 className={`${headerSize} font-bold mb-6 text-center text-gray-800`}>
          Admin Access
        </h1>
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
              Enter PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError('');
              }}
              className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter admin PIN"
              autoFocus
              maxLength={10}
            />
            {pinError && (
              <p className="mt-2 text-red-600 text-sm">{pinError}</p>
            )}
          </div>
          <button
            type="submit"
            className={`${buttonSize} w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-all active:scale-95`}
          >
            Authenticate
          </button>
        </form>
        <p className={`mt-4 text-center ${kioskMode ? 'text-lg' : 'text-sm'} text-gray-500`}>
          Default PIN: 1234
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`${headerSize} font-bold text-gray-800`}>Admin Panel</h1>
        <button
          onClick={handleLogout}
          className={`${buttonSize} bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95`}
        >
          Logout
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('players')}
          className={`${buttonSize} font-semibold ${
            activeTab === 'players'
              ? 'border-b-4 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Players
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`${buttonSize} font-semibold ${
            activeTab === 'settings'
              ? 'border-b-4 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className={`${kioskMode ? 'text-3xl' : 'text-xl'} font-bold mb-4 text-gray-800`}>
              Add New Player
            </h2>
            <form onSubmit={handleCreatePlayer} className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Player name"
                className={`${inputSize} flex-1 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                required
              />
              <button
                type="submit"
                className={`${buttonSize} bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95`}
              >
                Add
              </button>
            </form>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleExportCSV}
              className={`${buttonSize} bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95`}
            >
              Export CSV
            </button>
            <label className={`${buttonSize} bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer text-center`}>
              Import CSV
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>
            <button
              onClick={handleSeedPlayers}
              className={`${buttonSize} bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95`}
            >
              Seed Sample Players
            </button>
          </div>

          <div>
            <h2 className={`${kioskMode ? 'text-3xl' : 'text-xl'} font-bold mb-4 text-gray-800`}>
              Current Players ({players.length})
            </h2>
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {editingPlayer?.id === player.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <span className={`${textSize} font-bold text-gray-600 w-12`}>
                        #{player.rank}
                      </span>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`${inputSize} flex-1 border-2 border-blue-300 rounded-lg`}
                        autoFocus
                      />
                      <button
                        onClick={handleUpdatePlayer}
                        className={`${buttonSize} bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg`}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPlayer(null)}
                        className={`${buttonSize} bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`${textSize} font-semibold text-gray-800`}>
                        #{player.rank} - {player.name}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPlayer(player)}
                          className={`${buttonSize} bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player.id)}
                          className={`${buttonSize} bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg`}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className={`${kioskMode ? 'text-3xl' : 'text-xl'} font-bold mb-4 text-gray-800`}>
              Admin PIN
            </h2>
            <div className="flex gap-2">
              <input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="New PIN (min 4 characters)"
                className={`${inputSize} flex-1 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                minLength={4}
              />
              <button
                onClick={handleUpdateAdminPin}
                className={`${buttonSize} bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95`}
              >
                Update PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
