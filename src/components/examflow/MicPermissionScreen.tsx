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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 pt-24 sm:pt-28 md:pt-32 overflow-y-auto">
      {/* Semi-transparent backdrop - Header ko'rinib turadi */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Floating card with entrance animation - Kichikroq */}
      <div className="relative max-w-md w-full my-auto animate-[fadeInUp_0.6s_ease-out]">
        {/* Orange glow underneath - Kichikroq */}
        <div className="absolute -inset-3 bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-yellow-500/10 rounded-[32px] blur-2xl opacity-60" />

        {/* Glassmorphic card - Kichikroq padding */}
        <div className="relative bg-white/5 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.9)]">
          {/* Microphone icon with pulse - Kichikroq */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full blur-lg opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,140,0,0.6)]">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>
          </div>

          {/* Title - Kichikroq */}
          <h2 className="text-xl sm:text-2xl font-black text-white mb-3 sm:mb-4 text-center tracking-tight">
            {t('examFlow.micAccessRequired')}
          </h2>

          {/* Short description - Kichikroq */}
          <p className="text-white/60 text-sm sm:text-base mb-5 sm:mb-6 text-center font-medium leading-relaxed">
            {t('examFlow.micAccessDescription')}
          </p>

          {/* Primary button - Kichikroq */}
          <button
            onClick={onEnableMicrophone}
            className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white py-3 sm:py-3.5 rounded-xl font-bold text-base sm:text-lg shadow-[0_6px_30px_rgba(255,140,0,0.5)] hover:shadow-[0_8px_40px_rgba(255,140,0,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mb-3">
            {t('examFlow.enableMicrophone')}
          </button>

          {/* Secondary cancel button - Kichikroq */}
          <button
            onClick={onCancel}
            className="w-full text-white/40 hover:text-white/70 py-2 font-semibold text-sm transition-colors duration-200">
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

