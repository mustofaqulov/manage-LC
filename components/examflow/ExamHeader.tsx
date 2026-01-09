import React from 'react';
import { ExamPart } from '../../types';

interface ExamHeaderProps {
  currentPartIdx: number;
  currentQuestionIdx: number;
  questionsCount: number;
  currentPart?: ExamPart;
  status: 'IDLE' | 'READING' | 'PREPARING' | 'RECORDING' | 'FINISHED';
  displayTime: number;
  timeProgress: number;
  timerCircleRef: React.RefObject<SVGCircleElement>;
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
  timerCircleRef,
  getTimerColor,
  onExit,
}) => {
  return (
    <div className="bg-[#222222] text-white p-6 md:p-8 rounded-[2.5rem] flex items-center justify-between shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] relative">
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onExit}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/5 group z-50 pointer-events-auto cursor-pointer">
          <span className="text-lg font-black group-hover:scale-110 transition-transform">✕</span>
        </button>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="bg-[#ff7300] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest leading-none shadow-lg shadow-orange-500/20">
              SECTION {currentPartIdx + 1}
            </span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">
              CEFR SPEAKING TEST
            </h2>
          </div>
          <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
            {currentPart?.replace('_', ' ')} • QUESTION {currentQuestionIdx + 1} OF {questionsCount}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-white/5 rounded-full border border-white/5">
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'RECORDING' ? 'bg-[#ff7300] animate-pulse' : 'bg-zinc-600'
            }`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">
            {status === 'RECORDING' ? 'LIVE CAPTURE' : 'MIC READY'}
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
              ref={timerCircleRef}
              cx="48"
              cy="48"
              r="42"
              fill="transparent"
              stroke={getTimerColor(timeProgress)}
              strokeWidth="8"
              strokeDasharray="263.9"
              strokeDashoffset="0"
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
