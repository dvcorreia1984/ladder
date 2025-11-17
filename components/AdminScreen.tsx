'use client';

import { useState, useEffect, useRef } from 'react';
import { Player } from '@/types';
import { useI18n } from '@/lib/i18n/context';
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
  const { t } = useI18n();
  const [pin, setPin] = useState('');
  const [adminPin, setAdminPin] = useState<string>('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'players' | 'settings'>('players');
  
  // Payment settings
  const [payfastMerchantId, setPayfastMerchantId] = useState('');
  const [payfastMerchantKey, setPayfastMerchantKey] = useState('');
  const [payfastPassphrase, setPayfastPassphrase] = useState('');
  
  // Player management
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminPin();
      loadPaymentSettings();
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

  const loadPaymentSettings = async () => {
    try {
      const [merchantId, merchantKey, passphrase] = await Promise.all([
        getSetting('payfast_merchant_id'),
        getSetting('payfast_merchant_key'),
        getSetting('payfast_passphrase'),
      ]);
      setPayfastMerchantId(merchantId || '');
      setPayfastMerchantKey(merchantKey || '');
      setPayfastPassphrase(passphrase || '');
    } catch (error) {
      console.error('Error loading payment settings:', error);
    }
  };

  const handleSavePaymentSettings = async () => {
    try {
      await Promise.all([
        setSetting('payfast_merchant_id', payfastMerchantId),
        setSetting('payfast_merchant_key', payfastMerchantKey),
        setSetting('payfast_passphrase', payfastPassphrase),
      ]);
      setMessage({ type: 'success', text: t('adminPaymentSettingsSaved') });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('adminPaymentSettingsError') });
      setTimeout(() => setMessage(null), 5000);
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
        setPinError(t('adminIncorrectPin'));
        setPin('');
      }
    } catch (error) {
      setPinError(t('adminErrorPinVerify'));
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
      setMessage({ type: 'error', text: t('adminErrorNameRequired') });
      return;
    }

    try {
      await createPlayer(newPlayerName.trim());
      setNewPlayerName('');
      setMessage({ type: 'success', text: t('adminPlayerCreated') });
      onDataChanged();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('adminErrorGeneric').replace('{action}', 'create player') });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setEditName(player.name);
  };

  const handleUpdatePlayer = async () => {
    if (!editingPlayer || !editName.trim()) {
      setMessage({ type: 'error', text: t('adminErrorNameRequired') });
      return;
    }

    try {
      await updatePlayer(editingPlayer.id, { name: editName.trim() });
      setEditingPlayer(null);
      setEditName('');
      setMessage({ type: 'success', text: t('adminPlayerUpdated') });
      onDataChanged();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('adminErrorGeneric').replace('{action}', 'update player') });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!confirm(t('adminConfirmDelete'))) {
      return;
    }

    try {
      await deletePlayer(id);
      setMessage({ type: 'success', text: t('adminPlayerDeleted') });
      onDataChanged();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('adminErrorGeneric').replace('{action}', 'delete player') });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleSeedPlayers = async () => {
    if (!confirm(t('adminConfirmSeed'))) {
      return;
    }

    try {
      await seedSamplePlayers();
      setMessage({ type: 'success', text: t('adminSeedSuccess') });
      onDataChanged();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('adminErrorGeneric').replace('{action}', 'seed players') });
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

          setMessage({ type: 'success', text: t('adminImportSuccess').replace('{count}', String(importedCount)) });
          onDataChanged();
          setTimeout(() => setMessage(null), 3000);
        } catch (error: any) {
          setMessage({ type: 'error', text: error.message || t('adminErrorGeneric').replace('{action}', 'import players') });
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
      setMessage({ type: 'error', text: t('adminErrorPinLength') });
      return;
    }

    try {
      await setSetting('admin_pin', adminPin);
      setMessage({ type: 'success', text: t('adminPinUpdated') });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('adminErrorGeneric').replace('{action}', 'update PIN') });
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
          {t('adminAccess')}
        </h1>
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
              {t('adminEnterPin')}
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError('');
              }}
              className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white`}
              placeholder={t('adminEnterPin')}
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
            {t('adminAuthenticate')}
          </button>
        </form>
        <p className={`mt-4 text-center ${kioskMode ? 'text-lg' : 'text-sm'} text-gray-500`}>
          {t('adminDefaultPin')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`${headerSize} font-bold text-gray-800`}>{t('adminTitle')}</h1>
        <button
          onClick={handleLogout}
          className={`${buttonSize} bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95`}
        >
          {t('adminLogout')}
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
          {t('adminPlayers')}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`${buttonSize} font-semibold ${
            activeTab === 'settings'
              ? 'border-b-4 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('adminSettings')}
        </button>
      </div>

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className={`${kioskMode ? 'text-3xl' : 'text-xl'} font-bold mb-4 text-gray-800`}>
              {t('adminAddNewPlayer')}
            </h2>
            <form onSubmit={handleCreatePlayer} className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder={t('adminPlayerName')}
                className={`${inputSize} flex-1 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white`}
                required
              />
              <button
                type="submit"
                className={`${buttonSize} bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95`}
              >
                {t('adminAdd')}
              </button>
            </form>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleExportCSV}
              className={`${buttonSize} bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95`}
            >
              {t('adminExportCSV')}
            </button>
            <label className={`${buttonSize} bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer text-center`}>
              {t('adminImportCSV')}
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
              {t('adminSeedPlayers')}
            </button>
          </div>

          <div>
            <h2 className={`${kioskMode ? 'text-3xl' : 'text-xl'} font-bold mb-4 text-gray-800`}>
              {t('adminCurrentPlayers')} ({players.length})
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
                        {t('adminRank')}{player.rank}
                      </span>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`${inputSize} flex-1 border-2 border-blue-300 rounded-lg text-gray-900 bg-white`}
                        autoFocus
                      />
                      <button
                        onClick={handleUpdatePlayer}
                        className={`${buttonSize} bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg`}
                      >
                        {t('adminSave')}
                      </button>
                      <button
                        onClick={() => setEditingPlayer(null)}
                        className={`${buttonSize} bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg`}
                      >
                        {t('adminCancel')}
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`${textSize} font-semibold text-gray-800`}>
                        {t('adminRank')}{player.rank} - {player.name}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPlayer(player)}
                          className={`${buttonSize} bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg`}
                        >
                          {t('adminEdit')}
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player.id)}
                          className={`${buttonSize} bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg`}
                        >
                          {t('adminDelete')}
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
              {t('adminPinHeading')}
            </h2>
            <div className="flex gap-2">
              <input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder={t('adminPinPlaceholder')}
                className={`${inputSize} flex-1 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white`}
                minLength={4}
              />
              <button
                onClick={handleUpdateAdminPin}
                className={`${buttonSize} bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95`}
              >
                {t('adminUpdatePin')}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className={`${kioskMode ? 'text-3xl' : 'text-xl'} font-bold mb-4 text-gray-800`}>
              {t('adminPaymentSettingsHeading')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
                  {t('adminPayfastMerchantId')}
                </label>
                <input
                  type="text"
                  value={payfastMerchantId}
                  onChange={(e) => setPayfastMerchantId(e.target.value)}
                  placeholder={t('adminPayfastMerchantId')}
                  className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white`}
                />
              </div>
              <div>
                <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
                  {t('adminPayfastMerchantKey')}
                </label>
                <input
                  type="password"
                  value={payfastMerchantKey}
                  onChange={(e) => setPayfastMerchantKey(e.target.value)}
                  placeholder={t('adminPayfastMerchantKey')}
                  className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white`}
                />
              </div>
              <div>
                <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
                  {t('adminPayfastPassphrase')}
                </label>
                <input
                  type="password"
                  value={payfastPassphrase}
                  onChange={(e) => setPayfastPassphrase(e.target.value)}
                  placeholder={t('adminPayfastPassphrase')}
                  className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white`}
                />
              </div>
              <button
                onClick={handleSavePaymentSettings}
                className={`${buttonSize} bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95`}
              >
                {t('adminSave')} {t('adminPaymentSettings')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
