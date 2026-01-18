import React from 'react';
import { useTranslation } from '../i18n/useTranslation';

const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-[#050505]">
      {/* Dark cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#120e08] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,115,0,0.25),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Glow */}
        <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/30 to-amber-400/30 blur-3xl rounded-[4rem] opacity-60" />

        {/* Card */}
        <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-14 shadow-[0_40px_140px_rgba(0,0,0,0.9)]">
          {/* Icon */}
          <div
            className="mx-auto mb-8 w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-400
            flex items-center justify-center text-5xl shadow-[0_20px_60px_rgba(255,115,0,0.45)]
            animate-pulse">
            🏆
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black mb-4 text-white">
            {t('leaderboardExtended.leaderboardTitle')}
          </h1>

          {/* Subtitle */}
          <p className="text-white/60 text-lg leading-relaxed mb-10">
            {t('leaderboardExtended.leaderboardSubtitle')}
          </p>

          {/* Accent line */}
          <div className="w-20 h-1.5 bg-gradient-to-r from-orange-500 to-amber-400 mx-auto rounded-full" />

          {/* Status badge */}
          <div
            className="mt-10 inline-flex items-center gap-2 px-6 py-2 rounded-full
            bg-white/10 border border-white/15 text-sm font-bold text-orange-400 uppercase tracking-wider">
            {t('leaderboardExtended.inDevelopment')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
