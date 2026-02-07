import React from 'react';
import type { AttemptDetailResponse } from '../../src/api/types';

interface FinishedScreenProps {
  onGoToResults: () => void;
  attempt?: AttemptDetailResponse | null;
  isSubmitting?: boolean;
}

const FinishedScreen: React.FC<FinishedScreenProps> = ({
  onGoToResults,
  attempt,
  isSubmitting = false,
}) => {
  if (isSubmitting) {
    return (
      <div className="flex items-center justify-center py-16 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Submitting...</p>
        </div>
      </div>
    );
  }

  const hasScore = attempt?.totalScore != null;
  const scorePercent = attempt?.scorePercentage != null ? Math.round(attempt.scorePercentage) : null;

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg text-center">
          {/* Success icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-white mb-2">Exam Complete</h1>

          {/* Status */}
          <p className="text-white/40 text-sm mb-5">
            {attempt?.status === 'SCORING'
              ? 'Your responses are being evaluated...'
              : 'Your responses have been submitted.'}
          </p>

          {/* Score display */}
          {hasScore && (
            <div className="space-y-4 mb-5">
              <div className="bg-black/20 rounded-xl p-4">
                <p className="text-white/40 text-xs font-medium mb-1">Overall Score</p>
                <p className="text-3xl font-bold text-orange-400">
                  {scorePercent !== null ? `${scorePercent}%` : attempt.totalScore}
                </p>
              </div>

              {attempt.estimatedCefrLevel && (
                <span className="inline-block px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
                  CEFR {attempt.estimatedCefrLevel}
                </span>
              )}

              {attempt.sections && attempt.sections.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {attempt.sections.map((section) => (
                    <div key={section.id} className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/40 text-xs truncate mb-1">{section.sectionTitle}</p>
                      <p className="text-lg font-bold text-white">
                        {section.sectionScore ?? '—'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Button */}
          <button
            onClick={onGoToResults}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishedScreen;
