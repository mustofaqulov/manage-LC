import React from 'react';

const Leaderboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-xl text-center">
        <div className="text-6xl mb-6">🏆</div>
        <h1 className="text-3xl font-black mb-4">Coming Soon</h1>
        <p className="text-zinc-500 leading-relaxed mb-8">
          We're finalizing our global ranking system. Soon you'll be able to compare your CEFR
          performance with students across the nation.
        </p>
        <div className="w-12 h-1 bg-[#ff7300] mx-auto rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default Leaderboard;
