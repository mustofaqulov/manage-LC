import React from 'react';
import { ExamPart } from '../../types';

interface ExamHeaderProps {
  currentPartIdx: number;
  currentQuestionIdx: number;
  questionsCount: number;
  currentPart?: ExamPart;
  status: 'IDLE' | 'READING' | 'PREPARING' | 'RECORDING' | 'FINISHED';
  displayTime: number;
  timeProgress: number; // 1 dan 0 gacha kamayib boradi
  getTimerColor: (p: number) => string;
  onExit: (e: React.MouseEvent) => void;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({
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
    <div className="bg-[#222222] text-white p-6 md:p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl relative">
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onExit}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer z-50">
          <span className="text-lg font-black">✕</span>
        </button>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="bg-[#ff7300] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
              SECTION {currentPartIdx + 1}
            </span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">
              CEFR SPEAKING
            </h2>
          </div>
          <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
            {currentPart?.replace(/_/g, ' ')} • QUESTION {currentQuestionIdx + 1} OF{' '}
            {questionsCount}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-white/5 rounded-full border border-white/5">
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'RECORDING' ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'
            }`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {status === 'RECORDING' ? 'RECORDING' : 'READY'}
          </span>
        </div>

        <div className="relative w-24 h-24 flex items-center justify-center bg-black/20 rounded-full">
          <svg className="absolute inset-0 w-full h-full -rotate-90 scale-90">
            <circle
              cx="48"
              cy="48"
              r="42"
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            <circle
              cx="48"
              cy="48"
              r="42"
              fill="transparent"
              stroke={getTimerColor(timeProgress)}
              strokeWidth="8"
              strokeDasharray={circumference}
              style={{
                strokeDashoffset: offset,
                transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease',
              }}
              strokeLinecap="round"
            />
          </svg>
          <div className="flex flex-col items-center leading-none">
            <span className="font-black text-4xl tabular-nums">{displayTime}</span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
              SEC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamHeader;
