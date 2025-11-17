'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Payment } from '@/types';
import { useI18n } from '@/lib/i18n/context';

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const paymentId = searchParams.get('payment_id');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentId) {
      checkPaymentStatus();
    }
  }, [paymentId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'status',
          payment_id: paymentId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPayment(data.payment);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('paymentChecking')}</p>
        </div>
      </div>
    );
  }

  const isSuccess = payment?.status === 'completed';
  const isPending = payment?.status === 'pending';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {isSuccess ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">{t('paymentSuccess')}</h1>
            <p className="text-gray-600 mb-2">{t('paymentThankYou')}</p>
            {payment?.transaction_id && (
              <p className="text-sm text-gray-500 mb-6">
                {t('paymentTransactionId')}: {payment.transaction_id}
              </p>
            )}
          </>
        ) : isPending ? (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-yellow-600 mb-4">{t('paymentPending')}</h1>
            <p className="text-gray-600 mb-6">{t('paymentPendingMessage')}</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">{t('paymentFailed')}</h1>
            <p className="text-gray-600 mb-6">{t('paymentFailedMessage')}</p>
          </>
        )}
        
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all"
        >
          {t('paymentReturnHome')}
        </button>
      </div>
    </div>
  );
}

