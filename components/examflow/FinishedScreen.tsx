import React from 'react';

interface FinishedScreenProps {
  onGoToResults: () => void;
}

const FinishedScreen: React.FC<FinishedScreenProps> = ({ onGoToResults }) => {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-xl w-full bg-white p-16 rounded-[4rem] shadow-2xl border border-zinc-100">
        <div className="text-9xl mb-10 drop-shadow-xl animate-bounce">🎯</div>
        <h1 className="text-4xl font-black mb-6 text-[#222222]">Test Finalized</h1>
        <p className="text-zinc-500 mb-14 text-xl font-medium leading-relaxed max-w-md mx-auto">
          Thank you for participating. Your audio data has been sent for expert AI evaluation.
        </p>
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
