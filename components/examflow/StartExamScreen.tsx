import React from 'react';
import { ExamMode } from '../../types';
import styles from './StartExamScreen.module.scss';

interface StartExamScreenProps {
  mode?: ExamMode;
  partsCount: number;
  onStart: () => void;
  onBack: () => void;
}

const StartExamScreen: React.FC<StartExamScreenProps> = ({ mode, partsCount, onStart, onBack }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Dark immersive background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,140,0,0.12),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,180,60,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />

      {/* Vignette edges */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* Floating exam card with entrance animation */}
      <div className="relative max-w-3xl w-full animate-[fadeInUp_0.7s_ease-out]">
        {/* Orange glow underneath */}
        <div className="absolute -inset-6 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-yellow-500/5 rounded-[56px] blur-3xl opacity-70" />

        {/* Glassmorphic card */}
        <div className="relative bg-white/5 backdrop-blur-2xl rounded-[48px] p-12 md:p-16 border border-white/10 shadow-[0_50px_120px_rgba(0,0,0,0.9)]">
          {/* Orange accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full" />

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black text-white mb-10 text-center tracking-tight uppercase">
            CEFR Speaking Simulation
          </h1>

          {/* Parameters section */}
          <div className="bg-black/30 backdrop-blur-sm border border-white/5 rounded-[32px] p-8 md:p-10 mb-10">
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mb-6">
              Test Configuration
            </p>

            <div className="space-y-5">
              {/* Exam Type */}
              <div className="flex justify-between items-center pb-5 border-b border-white/5">
                <span className="text-white/50 font-semibold text-sm uppercase tracking-wider">
                  Exam Type
                </span>
                <span className="font-black text-transparent bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-lg tracking-tight">
                  CEFR MULTILEVEL
                </span>
              </div>

              {/* Mode */}
              <div className="flex justify-between items-center pb-5 border-b border-white/5">
                <span className="text-white/50 font-semibold text-sm uppercase tracking-wider">
                  Mode
                </span>
                <span className="font-bold text-white text-lg uppercase">{mode} MODULE</span>
              </div>

              {/* Sections */}
              <div className="flex justify-between items-center">
                <span className="text-white/50 font-semibold text-sm uppercase tracking-wider">
                  Sections
                </span>
                <span className="font-bold text-white text-lg">{partsCount} Parts</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            {/* Primary CTA */}
            <button
              onClick={onStart}
              className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white py-6 md:py-7 rounded-2xl font-black text-xl md:text-2xl uppercase shadow-[0_10px_50px_rgba(255,140,0,0.6)] hover:shadow-[0_15px_60px_rgba(255,140,0,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 tracking-wide">
              Begin Speaking Test
            </button>

            {/* Secondary action */}
            <button
              onClick={onBack}
              className="w-full text-white/30 hover:text-white/60 py-4 font-semibold text-base transition-colors duration-200">
              Back to Dashboard
            </button>
          </div>
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

export default StartExamScreen;
