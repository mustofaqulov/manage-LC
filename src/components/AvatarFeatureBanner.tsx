import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const DISMISSED_KEY = 'avatar_feature_banner_dismissed';

const AvatarFeatureBanner: React.FC = () => {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true',
  );

  const isExamContext = location.pathname.includes('/exam-flow');

  if (!isAuthenticated || isExamContext || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  return (
    <div className="w-full">
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-500 to-violet-500 shadow-[0_2px_24px_rgba(139,92,246,0.45)]">
        <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.12)_50%,transparent_60%)] bg-[length:200%_100%] animate-[shimmer_2.8s_infinite] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto flex items-center justify-center gap-3 px-10 py-2">
          <span className="text-2xl leading-none select-none">📸</span>
          <p className="text-white text-sm font-semibold">
            Yangi imkoniyat — <span className="font-black">Profil rasm</span> qo'shish!
          </p>
          <button
            type="button"
            onClick={() => { handleDismiss(); navigate('/profile'); }}
            className="flex-shrink-0 px-4 py-1 bg-white text-violet-600 text-xs font-black rounded-full hover:bg-violet-50 transition-all hover:scale-105 shadow-md cursor-pointer relative z-10">
            Profilga o'tish →
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
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default AvatarFeatureBanner;
