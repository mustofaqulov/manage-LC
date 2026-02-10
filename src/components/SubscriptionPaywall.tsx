import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';

const SubscriptionPaywall: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#ff7300]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {t('premium.title')}
        </h2>
        <p className="text-gray-500 mb-8">
          {t('premium.description')}
        </p>
        <Link
          to="/subscribe"
          className="block w-full py-3 px-6 bg-[#ff7300] hover:bg-[#e56800] text-white font-semibold rounded-xl transition-colors mb-3"
        >
          {t('premium.subscribeButton')}
        </Link>
        <Link
          to="/"
          className="block text-gray-400 hover:text-gray-600 text-sm transition-colors"
        >
          {t('premium.backHome')}
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionPaywall;

