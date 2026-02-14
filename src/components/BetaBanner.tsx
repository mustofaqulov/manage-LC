import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'beta_banner_dismissed';

/**
 * Beta versiya banner komponenti
 * Test rejimida ishlayotgan sayt uchun ogohlantirish
 * Animatsiya va liquid glass effect bilan
 */
export const BetaBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') {
      setIsDismissed(true);
      document.body.classList.add('beta-banner-dismissed');
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    document.body.classList.add('beta-banner-dismissed');
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 animate-gradient-x" />

      {/* Liquid glass overlay with blur */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/10" />

      {/* Animated floating bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-32 h-32 bg-white/10 rounded-full -top-16 -left-8 animate-float-slow blur-xl" />
        <div className="absolute w-24 h-24 bg-white/10 rounded-full top-0 left-1/4 animate-float-medium blur-lg" />
        <div className="absolute w-28 h-28 bg-white/10 rounded-full -top-12 right-1/4 animate-float-fast blur-xl" />
        <div className="absolute w-20 h-20 bg-white/10 rounded-full top-0 -right-4 animate-float-slow blur-lg" />
      </div>

      {/* Content */}
      <div className="relative backdrop-blur-sm bg-gradient-to-r from-white/5 to-white/10 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap px-4 py-2 text-white relative">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110 group"
            aria-label="Close beta banner"
          >
            <svg
              className="w-4 h-4 text-white/70 group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {/* Animated Beta Badge */}
          <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-black uppercase tracking-wider animate-pulse shadow-lg">
            BETA
          </span>

          {/* Message */}
          <p className="text-sm font-medium text-center">
            <span className="font-bold">Test rejimi:</span> Bu sayt beta versiyada ishlayapti.
            <span className="hidden sm:inline"> Xatolarni topgan bo'lsangiz,</span>{' '}
            <a
              href="https://t.me/mustofaqulof"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold underline hover:text-white/90 transition-all hover:scale-105"
            >
              <svg className="w-4 h-4 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
              </svg>
              @mustofaqulof
            </a>
            <span className="hidden sm:inline"> ga xabar bering.</span>
          </p>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        @keyframes float-medium {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-15px) translateX(-8px);
          }
        }
        @keyframes float-fast {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-25px) translateX(12px);
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease infinite;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 5s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
      `}</style>
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
