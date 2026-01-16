import React, { useState, useEffect } from 'react';
import { ExamScore } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import styles from './FinishedScreen.module.scss';

interface FinishedScreenProps {
  onGoToResults: () => void;
  scores?: ExamScore[];
  isLoading?: boolean;
}

const FinishedScreen: React.FC<FinishedScreenProps> = ({
  onGoToResults,
  scores = [],
  isLoading = false,
}) => {
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    if (scores.length > 0) {
      const avg = scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length;
      setOverallScore(Math.round(avg));
    }
  }, [scores]);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Evaluating your performance..." />;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
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
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Exam Complete</h1>
          <p className="text-white/50 text-lg mb-10">Your performance has been evaluated</p>

          {scores.length > 0 ? (
            <div className="space-y-8">
              {/* Overall score */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-[28px] blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-[24px] p-8">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">
                    Overall Score
                  </p>
                  <p className="text-6xl font-black bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                    {overallScore}
                  </p>
                  <p className="text-white/30 text-sm mt-2">/ 100</p>
                </div>
              </div>

              {/* Individual metrics */}
              {scores[0] && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                    <p className="text-blue-400 text-xs font-bold uppercase mb-2">Fluency</p>
                    <p className="text-4xl font-black text-white">{scores[0].fluency}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                    <p className="text-green-400 text-xs font-bold uppercase mb-2">Pronunciation</p>
                    <p className="text-4xl font-black text-white">{scores[0].pronunciation}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                    <p className="text-purple-400 text-xs font-bold uppercase mb-2">Vocabulary</p>
                    <p className="text-4xl font-black text-white">{scores[0].vocabulary}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                    <p className="text-orange-400 text-xs font-bold uppercase mb-2">Grammar</p>
                    <p className="text-4xl font-black text-white">{scores[0].grammar}</p>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {scores[0]?.feedback && (
                <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
                  <p className="text-white/60 text-sm leading-relaxed">{scores[0].feedback}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-white/60 text-lg font-medium leading-relaxed max-w-md mx-auto mb-8">
              Your responses are being evaluated. Results will be available shortly.
            </p>
          )}

          {/* Button */}
          <button
            onClick={onGoToResults}
            className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white py-6 rounded-2xl font-black text-xl uppercase shadow-[0_10px_50px_rgba(255,140,0,0.6)] hover:shadow-[0_15px_60px_rgba(255,140,0,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-10">
            View Results
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
