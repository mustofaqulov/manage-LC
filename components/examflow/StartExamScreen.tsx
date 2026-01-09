import React from 'react';
import { ExamMode } from '../../types';

interface StartExamScreenProps {
  mode?: ExamMode;
  partsCount: number;
  onStart: () => void;
  onBack: () => void;
}

const StartExamScreen: React.FC<StartExamScreenProps> = ({ mode, partsCount, onStart, onBack }) => {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl text-center border border-zinc-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#ff7300]"></div>
        <h1 className="text-5xl font-black mb-8 text-[#222222] tracking-tighter uppercase">
          CEFR Official Simulation
        </h1>
        <div className="bg-[#f9fafb] p-10 rounded-[2.5rem] text-left mb-12 space-y-6 border border-zinc-200/50">
          <p className="font-bold text-[11px] text-zinc-400 uppercase tracking-[0.4em]">
            Test Parameters
          </p>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-200/40 pb-4">
              <span className="text-zinc-500 font-bold uppercase text-xs tracking-widest">
                Exam Type
              </span>
              <span className="font-black text-[#ff7300] text-lg tracking-tight">
                CEFR MULTILEVEL
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-200/40 pb-4">
              <span className="text-zinc-500 font-bold uppercase text-xs tracking-widest">
                Mode
              </span>
              <span className="font-bold text-zinc-800 text-lg uppercase">{mode} MODULE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-bold uppercase text-xs tracking-widest">
                Sections
              </span>
              <span className="font-bold text-zinc-800 text-lg">{partsCount} Parts</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button
            onClick={onStart}
            className="w-full bg-[#ff7300] text-white py-7 rounded-3xl font-black text-2xl hover:bg-[#e66700] transition-all transform shadow-[0_20px_50px_rgba(255,115,0,0.3)] active:scale-[0.97]">
            BEGIN SPEAKING TEST
          </button>
          <button
            onClick={onBack}
            className="w-full text-zinc-400 py-4 rounded-2xl font-bold text-lg hover:text-[#222222] transition-all">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartExamScreen;
