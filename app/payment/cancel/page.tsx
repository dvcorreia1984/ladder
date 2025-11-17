'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';

export default function PaymentCancelPage() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-orange-600 mb-4">{t('paymentCancelled')}</h1>
        <p className="text-gray-600 mb-6">{t('paymentCancelledMessage')}</p>
        
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

