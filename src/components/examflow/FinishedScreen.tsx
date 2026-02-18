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
  attempt,
  isSubmitting = false,
  recordings = [],
  onDownloadRecording,
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

  const hasScore = attempt?.totalScore != null;
  const scorePercent = attempt?.scorePercentage != null ? Math.round(attempt.scorePercentage) : null;

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 pb-6 pt-24 sm:pt-28 md:pt-32 overflow-hidden">
      {/* Dark background with gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.12),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,140,0,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />

      {/* Main card */}
      <div className="relative max-w-2xl w-full animate-[fadeInUp_0.7s_ease-out]">
        {/* Glow underneath */}
        <div className="absolute -inset-6 bg-gradient-to-br from-green-500/15 via-orange-500/10 to-amber-500/10 rounded-[56px] blur-3xl opacity-70" />

        {/* Glassmorphic card */}
        <div className="relative bg-white/5 backdrop-blur-2xl rounded-[48px] p-12 md:p-16 border border-white/10 shadow-[0_50px_120px_rgba(0,0,0,0.9)] text-center">
          {/* Success icon */}
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">Exam Complete</h1>

          {/* Status */}
          {attempt?.status === 'SUBMITTED' || attempt?.status === 'SCORING' ? (
            <p className="text-white/50 text-lg mb-10">
              Your responses have been submitted and will be evaluated shortly.
            </p>
          ) : attempt?.status === 'SCORED' && hasScore ? (
            <p className="text-white/50 text-lg mb-10">Your performance has been evaluated</p>
          ) : (
            <p className="text-white/50 text-lg mb-10">
              Your responses have been submitted successfully.
            </p>
          )}

          {/* Score display */}
          {hasScore && (
            <div className="space-y-8 mb-10">
              {/* Overall score */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-[28px] blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-[24px] p-8">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">
                    Overall Score
                  </p>
                  <p className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                    {scorePercent !== null ? `${scorePercent}%` : attempt.totalScore}
                  </p>
                  {attempt.maxTotalScore && (
                    <p className="text-white/30 text-sm mt-2">/ {attempt.maxTotalScore}</p>
                  )}
                </div>
              </div>

              {/* CEFR Level */}
              {attempt.estimatedCefrLevel && (
                <div className="flex justify-center">
                  <span className="px-6 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-lg font-black uppercase">
                    Estimated: CEFR {attempt.estimatedCefrLevel}
                  </span>
                </div>
              )}

              {/* Section scores */}
              {attempt.sections && attempt.sections.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {attempt.sections.map((section) => (
                    <div key={section.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                      <p className="text-orange-400 text-xs font-bold uppercase mb-2 truncate">{section.sectionTitle}</p>
                      <p className="text-3xl font-black text-white">
                        {section.sectionScore != null
                          ? `${section.sectionScore}${section.maxSectionScore ? `/${section.maxSectionScore}` : ''}`
                          : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Summary */}
              {attempt.aiSummary && (
                <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                  <p className="text-white/60 text-sm leading-relaxed">{attempt.aiSummary}</p>
                </div>
              )}
            </div>
          )}

          {/* No score yet */}
          {!hasScore && (
            <p className="text-white/60 text-lg font-medium leading-relaxed max-w-md mx-auto mb-8">
              Your responses are being evaluated. Results will be available in your history.
            </p>
          )}

          {recordings.length > 0 && onDownloadAll && (
            <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-white/80 font-semibold">Audio recordings</p>
                  <p className="text-white/40 text-xs">
                    {recordings.length} javob yozildi • Bitta fayl sifatida yuklab olish
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onDownloadAll}
                  disabled={isDownloading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  {isDownloading ? 'Processing...' : 'Download Audio'}
                </button>
              </div>
            </div>
          )}

          {/* Button */}
          <button
            onClick={onGoToResults}
            className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white py-6 rounded-2xl font-black text-xl uppercase shadow-[0_10px_50px_rgba(255,140,0,0.6)] hover:shadow-[0_15px_60px_rgba(255,140,0,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4">
            View History
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
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

export default FinishedScreen;


