'use client';

import { useState } from 'react';
import { Player } from '@/types';
import { useI18n } from '@/lib/i18n/context';

interface PaymentModalProps {
  player: Player;
  onClose: () => void;
  onSuccess?: () => void;
  kioskMode: boolean;
}

export default function PaymentModal({
  player,
  onClose,
  onSuccess,
  kioskMode,
}: PaymentModalProps) {
  const { t } = useI18n();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [cellNumber, setCellNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputSize = kioskMode ? 'px-6 py-4 text-xl' : 'px-4 py-2 text-base';
  const buttonSize = kioskMode ? 'px-8 py-4 text-xl' : 'px-4 py-2 text-base';
  const textSize = kioskMode ? 'text-2xl' : 'text-lg';
  const headerSize = kioskMode ? 'text-4xl' : 'text-2xl';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(t('paymentErrorInvalidAmount'));
      return;
    }

    if (!email || !email.includes('@')) {
      setError(t('paymentErrorInvalidEmail'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiate',
          player_id: player.id,
          amount: amountNum,
          currency: 'ZAR',
          description: description || `${t('paymentFor')} ${player.name}`,
          first_name: firstName,
          last_name: lastName,
          email: email,
          cell_number: cellNumber,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || t('paymentErrorGeneric'));
      }

      // Create and submit form to Payfast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.payfast_url;

      Object.entries(data.payfast_data).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      setError(err.message || t('paymentErrorGeneric'));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl ${kioskMode ? 'p-8 max-w-2xl w-full' : 'p-6 max-w-lg w-full'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`${headerSize} font-bold text-gray-800`}>
            {t('paymentTitle')} - {player.name}
          </h2>
          <button
            onClick={onClose}
            className={`${buttonSize} text-gray-500 hover:text-gray-700`}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
              {t('paymentAmount')} (ZAR) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white`}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
              {t('paymentDescription')}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white`}
              placeholder={t('paymentDescriptionPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
                {t('paymentFirstName')}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white`}
              />
            </div>
            <div>
              <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
                {t('paymentLastName')}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white`}
              />
            </div>
          </div>

          <div>
            <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
              {t('paymentEmail')} *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white`}
              required
            />
          </div>

          <div>
            <label className={`${textSize} font-semibold text-gray-700 block mb-2`}>
              {t('paymentCellNumber')}
            </label>
            <input
              type="tel"
              value={cellNumber}
              onChange={(e) => setCellNumber(e.target.value)}
              className={`${inputSize} w-full border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white`}
              placeholder="+27 82 123 4567"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`${buttonSize} flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg shadow-md transition-all`}
            >
              {t('paymentCancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${buttonSize} flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? t('paymentProcessing') : t('paymentProceed')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

