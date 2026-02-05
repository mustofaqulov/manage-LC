import React, { memo } from 'react';

interface ExamHeaderProps {
  sectionTitle: string;
  currentSectionIdx: number;
  totalSections: number;
  currentQuestionIdx: number;
  questionsCount: number;
  status: 'IDLE' | 'READING' | 'PREPARING' | 'RECORDING' | 'SECTION_COMPLETE' | 'FINISHED';
  displayTime: number;
  timeProgress: number;
  getTimerColor: (p: number) => string;
  isCustomMode?: boolean;
  onFinish?: () => void;
  onExit: (e: React.MouseEvent) => void;
}

const formatTime = (seconds: number): string => {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  return String(seconds);
};

const ExamHeader: React.FC<ExamHeaderProps> = memo(({
  sectionTitle,
  currentSectionIdx,
  totalSections,
  currentQuestionIdx,
  questionsCount,
  status,
  displayTime,
  timeProgress,
  getTimerColor,
  isCustomMode = false,
  onFinish,
  onExit,
}) => {
  const circumference = 263.9;
  const offset = circumference * (1 - timeProgress);
  const isActive = status === 'PREPARING' || status === 'RECORDING';

  const statusLabel =
    status === 'RECORDING' ? 'REC'
    : status === 'PREPARING' ? 'PREP'
    : status === 'READING' ? 'LISTEN'
    : status === 'SECTION_COMPLETE' ? 'DONE'
    : 'IDLE';

  const statusDotClass =
    status === 'RECORDING'
      ? 'bg-orange-500 shadow-[0_0_8px_rgba(255,140,0,0.7)] animate-pulse'
      : status === 'PREPARING'
        ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]'
        : status === 'SECTION_COMPLETE'
          ? 'bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.5)]'
          : 'bg-white/20';

  const statusTextClass =
    status === 'RECORDING' ? 'text-orange-400'
    : status === 'PREPARING' ? 'text-amber-300'
    : status === 'SECTION_COMPLETE' ? 'text-green-400'
    : 'text-white/40';

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-orange-500/10 rounded-[32px] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

      <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[28px] px-5 md:px-8 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex items-center justify-between">
        {/* Left — nav */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Exit */}
          <button
            type="button"
            onClick={onExit}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer group/exit">
            <svg className="w-4 h-4 text-white/60 group-hover/exit:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Finish (custom) */}
          {isCustomMode && onFinish && (
            <button
              type="button"
              onClick={onFinish}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-[0_4px_20px_rgba(255,140,0,0.4)] hover:scale-105 active:scale-95 transition-all">
              Tugatish
            </button>
          )}

          {/* Section & question info */}
          <div className="flex items-center gap-2.5">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
              {currentSectionIdx + 1}/{totalSections}
            </span>
            <div className="hidden sm:flex flex-col gap-0.5">
              <span className="text-white text-sm font-bold tracking-tight">
                Q{currentQuestionIdx + 1}/{questionsCount}
              </span>
              <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider truncate max-w-[120px]">
                {sectionTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Right — status + timer */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Status pill */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-black/30 backdrop-blur-sm rounded-full border border-white/5">
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${statusDotClass}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${statusTextClass}`}>
              {statusLabel}
            </span>
          </div>

          {/* Timer */}
          <div className="relative w-[60px] h-[60px] md:w-[72px] md:h-[72px] flex items-center justify-center">
            {/* Glow behind timer when active */}
            {isActive && (
              <div
                className="absolute inset-0 rounded-full blur-lg opacity-30 transition-opacity duration-500"
                style={{ background: getTimerColor(timeProgress) }}
              />
            )}

            {/* Background ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                fill="transparent"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="3.5"
              />
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                fill="transparent"
                stroke={getTimerColor(timeProgress)}
                strokeWidth="3.5"
                strokeDasharray={circumference}
                style={{
                  strokeDashoffset: offset,
                  transition: 'stroke-dashoffset 0.15s linear, stroke 0.3s ease',
                }}
                strokeLinecap="round"
              />
            </svg>

            {/* Time text */}
            <div className="relative flex flex-col items-center leading-none select-none">
              <span
                className="font-black tabular-nums text-white"
                style={{ fontSize: displayTime >= 60 ? '1.1rem' : '1.5rem' }}
              >
                {formatTime(displayTime)}
              </span>
              {displayTime < 60 && (
                <span className="text-[7px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                  sec
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ExamHeader.displayName = 'ExamHeader';

export default ExamHeader;
