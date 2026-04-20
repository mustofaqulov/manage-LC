import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DISMISSED_KEY = 'leaderboard_announcement_v1_dismissed';

const LeaderboardAnnouncementBanner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true',
  );

  const isExamContext = location.pathname.includes('/exam-flow');
  const isLeaderboard = location.pathname.includes('/leaderboard');

  if (isExamContext || isLeaderboard || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  return (
    <div className="w-full">
      <div className="relative bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 shadow-[0_2px_24px_rgba(255,115,0,0.45)]">
        {/* Shimmer */}
        <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.15)_50%,transparent_60%)] bg-[length:200%_100%] animate-[shimmer_3s_infinite] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto flex items-center justify-center gap-3 px-10 py-2">
          <span className="text-2xl leading-none select-none">🏆</span>
          <p className="text-white text-sm font-semibold">
            Yangi!{' '}
            <span className="font-black">Reyting taxtasi</span> — eng yaxshi o'quvchilar orasida o'z o'rningni bil!
          </p>
          <button
            type="button"
            onClick={() => { handleDismiss(); navigate('/leaderboard'); }}
            className="flex-shrink-0 px-4 py-1 bg-white text-orange-600 text-xs font-black rounded-full
              hover:bg-orange-50 transition-all hover:scale-105 shadow-md cursor-pointer relative z-10">
            Ko'rish →
          </button>
        </div>

        <button
          onClick={handleDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          aria-label="Yopish">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default LeaderboardAnnouncementBanner;
