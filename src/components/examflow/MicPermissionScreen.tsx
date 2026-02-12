import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import styles from './MicPermissionScreen.module.scss';

interface MicPermissionScreenProps {
  onEnableMicrophone: () => void;
  onCancel: () => void;
}

const MicPermissionScreen: React.FC<MicPermissionScreenProps> = ({
  onEnableMicrophone,
  onCancel,
}) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark immersive background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1410] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,140,0,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,180,60,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] opacity-30" />

      {/* Floating card with entrance animation */}
      <div className="relative max-w-lg w-full my-auto animate-[fadeInUp_0.6s_ease-out]">
        {/* Orange glow underneath */}
        <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-yellow-500/10 rounded-[48px] blur-3xl opacity-60" />

        {/* Glassmorphic card */}
        <div className="relative bg-white/5 backdrop-blur-2xl rounded-[40px] p-6 sm:p-10 md:p-12 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
          {/* Microphone icon with pulse */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto mb-6 sm:mb-8 md:mb-10">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,140,0,0.6)]">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 md:mb-5 text-center tracking-tight">
            {t('examFlow.micAccessRequired')}
          </h2>

          {/* Short description */}
          <p className="text-white/60 text-base sm:text-lg mb-6 sm:mb-8 md:mb-10 text-center font-medium leading-relaxed">
            {t('examFlow.micAccessDescription')}
          </p>

          {/* Primary button */}
          <button
            onClick={onEnableMicrophone}
            className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white py-3.5 sm:py-4 md:py-5 rounded-2xl font-black text-lg sm:text-xl shadow-[0_8px_40px_rgba(255,140,0,0.5)] hover:shadow-[0_12px_50px_rgba(255,140,0,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mb-4">
            {t('examFlow.enableMicrophone')}
          </button>

          {/* Secondary cancel button */}
          <button
            onClick={onCancel}
            className="w-full text-white/40 hover:text-white/70 py-3 font-semibold text-base transition-colors duration-200">
            {t('common.cancel')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MicPermissionScreen;

