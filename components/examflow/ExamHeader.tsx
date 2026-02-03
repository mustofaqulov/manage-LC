import React, { memo } from 'react';
import { ExamPart } from '../../types';

interface ExamHeaderProps {
  currentPartIdx: number;
  currentQuestionIdx: number;
  questionsCount: number;
  currentPart?: ExamPart;
  status: 'IDLE' | 'READING' | 'PREPARING' | 'RECORDING' | 'SECTION_COMPLETE' | 'FINISHED';
  displayTime: number;
  timeProgress: number;
  getTimerColor: (p: number) => string;
  onExit: (e: React.MouseEvent) => void;
}

const ExamHeader: React.FC<ExamHeaderProps> = memo(({
  currentPartIdx,
  currentQuestionIdx,
  questionsCount,
  currentPart,
  status,
  displayTime,
  timeProgress,
  getTimerColor,
  onExit,
}) => {
  const circumference = 263.9;
  const offset = circumference * (1 - timeProgress);

  return (
    <div className="relative group">
      {/* Subtle glow underneath */}
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-orange-500/10 rounded-[32px] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

      {/* Glassmorphic header */}
      <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[28px] px-6 md:px-8 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Exit button */}
          <button
            type="button"
            onClick={onExit}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer group/exit">
            <svg
              className="w-4 h-4 text-white/60 group-hover/exit:text-red-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Section info */}
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              SEC {currentPartIdx + 1}
            </span>
            <div className="hidden sm:flex flex-col gap-0.5">
              <span className="text-white text-sm font-bold tracking-tight">
                Q{currentQuestionIdx + 1}/{questionsCount}
              </span>
              <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">
                {currentPart?.replace(/_/g, ' ').slice(0, 8)}
              </span>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Status indicator */}
          <div className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full border border-white/5">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                status === 'RECORDING'
                  ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse'
                  : status === 'PREPARING'
                    ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]'
                    : status === 'SECTION_COMPLETE'
                      ? 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                      : 'bg-white/20'
              }`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                status === 'RECORDING'
                  ? 'text-red-400'
                  : status === 'PREPARING'
                    ? 'text-orange-300'
                    : status === 'SECTION_COMPLETE'
                      ? 'text-green-400'
                      : 'text-white/40'
              }`}>
              {status === 'RECORDING'
                ? 'REC'
                : status === 'PREPARING'
                  ? 'PREP'
                  : status === 'READING'
                    ? 'LISTEN'
                    : status === 'SECTION_COMPLETE'
                      ? 'DONE'
                      : 'IDLE'}
            </span>
          </div>

          {/* Circular timer */}
          <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="38%"
                fill="transparent"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="4"
              />
              <circle
                cx="50%"
                cy="50%"
                r="38%"
                fill="transparent"
                stroke={getTimerColor(timeProgress)}
                strokeWidth="4"
                strokeDasharray={circumference}
                style={{
                  strokeDashoffset: offset,
                  transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease',
                }}
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col items-center leading-none">
              <span className="font-black text-2xl md:text-3xl tabular-nums text-white">
                {displayTime}
              </span>
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider mt-0.5">
                sec
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ExamHeader.displayName = 'ExamHeader';

export default ExamHeader;
