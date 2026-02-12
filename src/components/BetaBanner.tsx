import React, { useState } from 'react';

/**
 * Beta versiya banner komponenti
 * Test rejimida ishlayotgan sayt uchun ogohlantirish
 */
export const BetaBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(
    () => localStorage.getItem('beta_banner_dismissed') !== 'true'
  );

  const handleDismiss = () => {
    localStorage.setItem('beta_banner_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Beta Badge */}
          <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-black uppercase tracking-wider">
            BETA
          </span>

          {/* Message */}
          <p className="text-sm font-medium">
            <span className="font-bold">Test rejimi:</span> Bu sayt beta versiyada ishlayapti.
            Xatolarni topgan bo'lsangiz, iltimos xabar bering.
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Yopish"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Beta Badge - Header yoki boshqa joylarda foydalanish uchun
 */
export const BetaBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-lg ${className}`}
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      BETA
    </span>
  );
};
