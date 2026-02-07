import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';

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
    <div className="flex items-center justify-center py-16 px-4">
      <div className="max-w-sm w-full">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg text-center">
          {/* Microphone icon */}
          <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-lg font-bold text-white mb-2">
            {t('examFlow.micAccessRequired')}
          </h2>

          {/* Description */}
          <p className="text-white/50 text-sm mb-6">
            {t('examFlow.micAccessDescription')}
          </p>

          {/* Buttons */}
          <button
            onClick={onEnableMicrophone}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all mb-2"
          >
            {t('examFlow.enableMicrophone')}
          </button>
          <button
            onClick={onCancel}
            className="w-full text-white/30 hover:text-white/50 py-2 text-sm font-medium transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MicPermissionScreen;
