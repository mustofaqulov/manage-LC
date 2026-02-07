import React from 'react';
import type { CefrLevel } from '../../src/api/types';

interface StartExamScreenProps {
  testTitle: string;
  cefrLevel: CefrLevel;
  sectionCount: number;
  instructions?: string | null;
  onStart: () => void;
  onBack: () => void;
}

const StartExamScreen: React.FC<StartExamScreenProps> = ({
  testTitle,
  cefrLevel,
  sectionCount,
  instructions,
  onStart,
  onBack,
}) => {
  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-white mb-2">{testTitle}</h1>
            <span className="inline-block px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
              CEFR {cefrLevel}
            </span>
          </div>

          {/* Config */}
          <div className="bg-black/20 rounded-xl p-4 mb-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/40">Exam Type</span>
              <span className="font-semibold text-orange-400">CEFR Speaking</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/40">Level</span>
              <span className="font-semibold text-white">{cefrLevel}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/40">Sections</span>
              <span className="font-semibold text-white">{sectionCount} Parts</span>
            </div>
          </div>

          {/* Instructions */}
          {instructions && (
            <div className="bg-white/5 rounded-xl p-4 mb-5">
              <p className="text-white/40 text-xs font-medium mb-1">Instructions</p>
              <p className="text-white/60 text-sm leading-relaxed">{instructions}</p>
            </div>
          )}

          {/* Buttons */}
          <button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-[0_8px_30px_rgba(255,140,0,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Begin Test
          </button>
          <button
            onClick={onBack}
            className="w-full text-white/30 hover:text-white/50 py-3 text-sm font-medium transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartExamScreen;
