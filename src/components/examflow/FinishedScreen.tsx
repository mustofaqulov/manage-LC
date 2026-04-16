import React from 'react';
import type { AttemptDetailResponse } from '../../api/types';

interface FinishedScreenProps {
  onGoToResults: () => void;
  attempt?: AttemptDetailResponse | null;
  isSubmitting?: boolean;
  recordings?: { id: string; label: string; assetId?: string; blob?: Blob }[];
  onDownloadRecording?: (recording: { assetId?: string; blob?: Blob }, index: number) => void;
  onDownloadAll?: () => void;
  isDownloading?: boolean;
}

const FinishedScreen: React.FC<FinishedScreenProps> = ({
  onGoToResults,
  isSubmitting = false,
  recordings = [],
  onDownloadAll,
  isDownloading = false,
}) => {
  if (isSubmitting) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-6 pb-6 pt-24 sm:pt-28 md:pt-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-black" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-white/60 text-lg font-medium">Submitting your exam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 pb-6 pt-24 sm:pt-28 md:pt-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.12),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,140,0,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />

      {/* Card */}
      <div className="relative max-w-lg w-full animate-[fadeInUp_0.7s_ease-out]">
        <div className="absolute -inset-6 bg-gradient-to-br from-green-500/15 via-orange-500/10 to-amber-500/10 rounded-[56px] blur-3xl opacity-70" />

        <div className="relative bg-white/5 backdrop-blur-2xl rounded-[24px] sm:rounded-[36px] md:rounded-[48px] p-8 sm:p-12 md:p-16 border border-white/10 shadow-[0_50px_120px_rgba(0,0,0,0.9)] text-center">

          {/* Success icon */}
          <div className="relative inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Exam Complete
          </h1>

          {/* Message */}
          <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-10 max-w-sm mx-auto">
            Your responses have been submitted. Results will appear in your history once evaluation is complete.
          </p>

          {/* Audio download */}
          {recordings.length > 0 && onDownloadAll && (
            <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5 mb-8 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-white/80 font-semibold text-sm">Audio recordings</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {recordings.length} ta javob yozildi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onDownloadAll}
                  disabled={isDownloading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  {isDownloading ? 'Tayyorlanmoqda...' : 'Download as MP3'}
                </button>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={onGoToResults}
            className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg uppercase shadow-[0_10px_50px_rgba(255,140,0,0.6)] hover:shadow-[0_15px_60px_rgba(255,140,0,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
            View History
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FinishedScreen;
