import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamMode, User } from '../types';

interface MockExamProps {
  user: User | null;
}

const MockExam: React.FC<MockExamProps> = ({ user }) => {
  const navigate = useNavigate();

  const handleStartExam = (mode: ExamMode) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.isSubscribed) {
      alert('Active subscription required. Price: 15,000 UZS/month.');
      return;
    }

    // Redirect to exam flow
    navigate(`/exam-flow/${mode}`);
  };

  return (
    <div className="py-20 px-6 md:px-12 bg-zinc-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black mb-4">CEFR Mock Speaking</h1>
          <p className="text-zinc-500 text-lg">
            Select an exam mode to begin. Ensure your microphone is ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Full Test */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 flex flex-col items-center text-center hover:shadow-xl hover:border-[#ff7300] transition-all group">
            <div className="w-16 h-16 rounded-full bg-[#ff7300]/10 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
              🏆
            </div>
            <h3 className="text-xl font-bold mb-3">Full Mock Test</h3>
            <p className="text-zinc-500 text-sm mb-8 flex-grow">
              Complete exam simulation: Part 1.1, 1.2, 2, and 3. Automated timing and sequence.
            </p>
            <button
              onClick={() => handleStartExam(ExamMode.FULL)}
              className="w-full bg-[#ff7300] text-white py-3 rounded-xl font-bold hover:bg-[#e66700] transition-colors">
              Start Full Test
            </button>
          </div>

          {/* Random Test */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 flex flex-col items-center text-center hover:shadow-xl hover:border-[#ff7300] transition-all group">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
              🎲
            </div>
            <h3 className="text-xl font-bold mb-3">Random Questions</h3>
            <p className="text-zinc-500 text-sm mb-8 flex-grow">
              Quick practice with random topics from Part 1.1 and 1.2. Perfect for short bursts.
            </p>
            <button
              onClick={() => handleStartExam(ExamMode.RANDOM)}
              className="w-full bg-[#222222] text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
              Take Random Test
            </button>
          </div>

          {/* Custom Test */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 flex flex-col items-center text-center hover:shadow-xl hover:border-[#ff7300] transition-all group">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
              ⚙️
            </div>
            <h3 className="text-xl font-bold mb-3">Custom Practice</h3>
            <p className="text-zinc-500 text-sm mb-8 flex-grow">
              Choose specific topics and exam parts to focus on your weak points.
            </p>
            <button
              onClick={() => navigate('/custom-exam')}
              className="w-full border-2 border-zinc-200 text-[#222222] py-3 rounded-xl font-bold hover:bg-zinc-50 transition-colors">
              Configure Custom
            </button>
          </div>
        </div>

        {/* Requirements Note */}
        <div className="mt-16 bg-[#222222] text-white p-8 rounded-3xl">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <span className="text-[#ff7300]">!</span> Technical Requirements
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-400">
            <li className="flex items-center gap-2">• Stable internet connection</li>
            <li className="flex items-center gap-2">• Working microphone with permission</li>
            <li className="flex items-center gap-2">• Active subscription (15,000 UZS)</li>
            <li className="flex items-center gap-2">• Quiet environment</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MockExam;
