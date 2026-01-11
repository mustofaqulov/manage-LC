import React, { useState, useEffect } from 'react';
import { ExamScore } from '../../types';
import LoadingSpinner from '../LoadingSpinner';

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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-xl w-full bg-white p-16 rounded-[4rem] shadow-2xl border border-zinc-100">
        <div className="text-9xl mb-10 drop-shadow-xl animate-bounce">🎯</div>
        <h1 className="text-4xl font-black mb-6 text-[#222222]">Test Finalized</h1>

        {scores.length > 0 ? (
          <div className="mb-10 space-y-6">
            <div className="bg-gradient-to-r from-[#ff7300]/10 to-blue-50 p-8 rounded-3xl">
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-3">
                Overall Score
              </p>
              <p className="text-5xl font-black text-[#ff7300]">{overallScore}</p>
              <p className="text-zinc-400 text-sm mt-2">/ 100</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {scores[0] && (
                <>
                  <div className="bg-blue-50 p-4 rounded-2xl">
                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Fluency</p>
                    <p className="text-3xl font-black text-blue-600">{scores[0].fluency}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl">
                    <p className="text-xs text-green-600 font-bold uppercase mb-1">Pronunciation</p>
                    <p className="text-3xl font-black text-green-600">{scores[0].pronunciation}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-2xl">
                    <p className="text-xs text-purple-600 font-bold uppercase mb-1">Vocabulary</p>
                    <p className="text-3xl font-black text-purple-600">{scores[0].vocabulary}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-2xl">
                    <p className="text-xs text-orange-600 font-bold uppercase mb-1">Grammar</p>
                    <p className="text-3xl font-black text-orange-600">{scores[0].grammar}</p>
                  </div>
                </>
              )}
            </div>

            {scores[0]?.feedback && (
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                <p className="text-sm text-zinc-600">{scores[0].feedback}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-zinc-500 mb-14 text-xl font-medium leading-relaxed max-w-md mx-auto">
            Thank you for participating. Your audio data has been sent for expert AI evaluation.
          </p>
        )}

        <button
          onClick={onGoToResults}
          className="w-full bg-[#222222] text-white py-6 rounded-3xl font-black text-xl hover:bg-zinc-800 transition-all shadow-xl active:scale-[0.98]">
          Go to Results
        </button>
      </div>
    </div>
  );
};

export default FinishedScreen;
