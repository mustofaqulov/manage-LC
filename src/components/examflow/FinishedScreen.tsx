import React, { useState } from 'react';
import type { AttemptDetailResponse, ResponseResponse } from '../../api/types';
import { SkillType, QuestionType } from '../../api/types';

interface FinishedScreenProps {
  onGoToResults: () => void;
  attempt?: AttemptDetailResponse | null;
  isSubmitting?: boolean;
  recordings?: { id: string; label: string; assetId?: string; blob?: Blob }[];
  onDownloadRecording?: (recording: { assetId?: string; blob?: Blob }, index: number) => void;
  onDownloadAll?: () => void;
  isDownloading?: boolean;
}

const skillLabel: Record<SkillType, string> = {
  [SkillType.READING]: 'Reading',
  [SkillType.LISTENING]: 'Listening',
  [SkillType.WRITING]: 'Writing',
  [SkillType.SPEAKING]: 'Speaking',
};

const skillColor: Record<SkillType, string> = {
  [SkillType.READING]: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  [SkillType.LISTENING]: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  [SkillType.WRITING]: 'text-green-400 bg-green-500/10 border-green-500/30',
  [SkillType.SPEAKING]: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
};

const SubjectiveResponseDetail: React.FC<{ response: ResponseResponse }> = ({ response }) => {
  const [open, setOpen] = useState(false);

  const hasRubric = response.rubricScores && response.rubricScores.length > 0;
  const score =
    response.scoreAwarded != null && response.maxScore != null
      ? `${response.scoreAwarded}/${response.maxScore}`
      : null;

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-white/50 text-xs uppercase tracking-wider font-bold">
            {response.questionType === QuestionType.SPEAKING_RESPONSE ? 'Speaking' : 'Writing'}
          </span>
          {score && (
            <span className="text-orange-400 font-bold text-sm">{score} pts</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/8 pt-3">
          {response.aiSummary && (
            <p className="text-white/60 text-sm leading-relaxed">{response.aiSummary}</p>
          )}
          {hasRubric && (
            <div className="space-y-2">
              {response.rubricScores!.map((rs) => (
                <div key={rs.criterionId} className="bg-black/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/70 text-xs font-semibold">{rs.criterionName}</span>
                    <span className="text-orange-400 text-xs font-bold">
                      {rs.score}/{rs.maxScore}
                    </span>
                  </div>
                  {/* Score bar */}
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                      style={{ width: `${rs.maxScore > 0 ? (Number(rs.score) / Number(rs.maxScore)) * 100 : 0}%` }}
                    />
                  </div>
                  {rs.feedback && (
                    <p className="text-white/40 text-xs mt-2 leading-relaxed">{rs.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
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
  const scorePercent = attempt?.scorePercentage != null ? Math.round(Number(attempt.scorePercentage)) : null;

  // Subjective responses with AI feedback (ESSAY or SPEAKING_RESPONSE)
  const subjectiveResponses = (attempt?.responses ?? []).filter(
    (r) =>
      r.questionType === QuestionType.ESSAY ||
      r.questionType === QuestionType.SPEAKING_RESPONSE,
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 pb-6 pt-24 sm:pt-28 md:pt-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.12),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,140,0,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />

      {/* Main card */}
      <div className="relative max-w-2xl w-full animate-[fadeInUp_0.7s_ease-out]">
        <div className="absolute -inset-6 bg-gradient-to-br from-green-500/15 via-orange-500/10 to-amber-500/10 rounded-[56px] blur-3xl opacity-70" />

        <div className="relative bg-white/5 backdrop-blur-2xl rounded-[24px] sm:rounded-[36px] md:rounded-[48px] p-6 sm:p-10 md:p-16 border border-white/10 shadow-[0_50px_120px_rgba(0,0,0,0.9)] text-center">
          {/* Success icon */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-5 sm:mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center">
              <svg
                className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-green-400"
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
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-3 sm:mb-4">
            Exam Complete
          </h1>

          {/* Status */}
          {attempt?.status === 'SUBMITTED' || attempt?.status === 'SCORING' ? (
            <p className="text-white/50 text-sm sm:text-base md:text-lg mb-6 sm:mb-10">
              Your responses have been submitted and will be evaluated shortly.
            </p>
          ) : attempt?.status === 'SCORED' && hasScore ? (
            <p className="text-white/50 text-sm sm:text-base md:text-lg mb-6 sm:mb-10">
              Your performance has been evaluated.
            </p>
          ) : (
            <p className="text-white/50 text-sm sm:text-base md:text-lg mb-6 sm:mb-10">
              Your responses have been submitted successfully.
            </p>
          )}

          {/* ── SCORED content ── */}
          {hasScore && (
            <div className="space-y-6 mb-10">
              {/* Overall score */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-[28px] blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-[24px] p-8">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">
                    Overall Score
                  </p>
                  <p className="text-3xl sm:text-4xl md:text-6xl font-black bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                    {scorePercent !== null ? `${scorePercent}%` : attempt.totalScore}
                  </p>
                  {attempt.maxTotalScore != null && (
                    <p className="text-white/30 text-sm mt-2">
                      {attempt.totalScore} / {attempt.maxTotalScore} points
                    </p>
                  )}
                </div>
              </div>

              {/* CEFR Level */}
              {attempt.estimatedCefrLevel && (
                <div className="flex justify-center">
                  <span className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm sm:text-lg font-black uppercase">
                    Estimated: CEFR {attempt.estimatedCefrLevel}
                  </span>
                </div>
              )}

              {/* Section scores */}
              {attempt.sections && attempt.sections.length > 0 && (
                <div className="text-left space-y-3">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider text-center">
                    Section Breakdown
                  </p>
                  {attempt.sections.map((section) => (
                    <div
                      key={section.id}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-bold uppercase px-2 py-0.5 rounded-lg border ${skillColor[section.skill] ?? 'text-white/50 bg-white/5 border-white/10'}`}>
                            {skillLabel[section.skill] ?? section.skill}
                          </span>
                          <span className="text-white/80 text-sm font-semibold">{section.sectionTitle}</span>
                        </div>
                        <span className="text-xl font-black text-white shrink-0">
                          {section.sectionScore != null
                            ? `${section.sectionScore}${section.maxSectionScore != null ? `/${section.maxSectionScore}` : ''}`
                            : '—'}
                        </span>
                      </div>
                      {section.aiFeedback && (
                        <p className="text-white/50 text-xs leading-relaxed mt-2 border-t border-white/8 pt-2">
                          {section.aiFeedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* AI Summary */}
              {attempt.aiSummary && (
                <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl p-6 text-left">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">
                    AI Feedback
                  </p>
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
                    {attempt.aiSummary}
                  </p>
                </div>
              )}

              {/* Per-question subjective feedback (ESSAY / SPEAKING) */}
              {subjectiveResponses.length > 0 && (
                <div className="text-left space-y-2">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider text-center">
                    Detailed Feedback
                  </p>
                  {subjectiveResponses.map((r) => (
                    <SubjectiveResponseDetail key={r.id} response={r} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No score yet */}
          {!hasScore && (
            <div className="mb-8">
              {(attempt?.status === 'SUBMITTED' || attempt?.status === 'SCORING') ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  <p className="text-white/50 text-base">
                    Evaluating your responses… This may take up to a minute.
                  </p>
                </div>
              ) : (
                <p className="text-white/60 text-lg font-medium leading-relaxed max-w-md mx-auto">
                  Your responses are being evaluated. Results will be available in your history.
                </p>
              )}
            </div>
          )}

          {/* Audio recordings */}
          {recordings.length > 0 && onDownloadAll && (
            <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-white/80 font-semibold">Audio recordings</p>
                  <p className="text-white/40 text-xs">
                    {recordings.length} javob yozildi • Bitta MP3 fayl sifatida yuklab olish
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onDownloadAll}
                  disabled={isDownloading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  {isDownloading ? 'MP3 tayyorlanmoqda...' : 'Download as MP3'}
                </button>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={onGoToResults}
            className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white py-3.5 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg md:text-xl uppercase shadow-[0_10px_50px_rgba(255,140,0,0.6)] hover:shadow-[0_15px_60px_rgba(255,140,0,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4">
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
