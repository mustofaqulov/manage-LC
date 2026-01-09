import React from 'react';
import { ExamPart, Question } from '../../types';

interface ExamBodyProps {
  status: 'IDLE' | 'READING' | 'PREPARING' | 'RECORDING' | 'FINISHED';
  currentQuestion?: Question;
  currentPart?: ExamPart;
  waveformCanvasRef: React.RefObject<HTMLCanvasElement>;
  onNextPart: () => void;
}

const ExamBody: React.FC<ExamBodyProps> = ({
  status,
  currentQuestion,
  currentPart,
  waveformCanvasRef,
  onNextPart,
}) => {
  return (
    <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center text-center relative min-h-[580px] border border-white">
      <div className="absolute top-12 left-0 right-0 flex justify-center">
        <span
          className={`inline-block text-[11px] font-black uppercase tracking-[0.3em] px-8 py-3 rounded-full ${
            status === 'RECORDING'
              ? 'text-red-500 bg-red-50'
              : status === 'PREPARING'
              ? 'text-blue-500 bg-[#eef2ff]'
              : status === 'READING'
              ? 'text-zinc-400 bg-zinc-50'
              : 'text-zinc-300 bg-zinc-50'
          }`}>
          {status === 'READING'
            ? 'AI INSTRUCTOR SPEAKING'
            : status === 'PREPARING'
            ? 'PREPARATION TIME'
            : status === 'RECORDING'
            ? 'RECORDING NOW'
            : 'PLEASE WAIT'}
        </span>
      </div>

      {status === 'READING' && (
        <div className="space-y-10 animate-in fade-in duration-700">
          <div className="relative inline-flex items-center justify-center w-32 h-32 bg-[#ff7300]/5 rounded-[2.5rem]">
            <div className="absolute inset-0 bg-[#ff7300]/10 blur-3xl rounded-full animate-pulse"></div>
            <span className="text-7xl">🗣️</span>
          </div>
          <div className="space-y-4">
            <h3 className="text-5xl md:text-6xl font-black text-[#222222] tracking-tighter leading-tight">
              Listen to the prompt.
            </h3>
            <p className="text-zinc-400 text-xl font-medium">
              The test will continue after the audio guide.
            </p>
          </div>
        </div>
      )}

      {(status === 'PREPARING' || status === 'RECORDING') && (
        <div className="w-full space-y-12 animate-in fade-in zoom-in duration-700">
          <div className="space-y-6">
            <h3 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-[#222222] tracking-tighter leading-none">
              {currentQuestion?.topic}
            </h3>
            {currentQuestion?.text && (
              <p className="text-2xl md:text-4xl text-zinc-500 font-semibold max-w-4xl mx-auto tracking-tight">
                {currentQuestion?.text}
              </p>
            )}
          </div>

          <div className="max-w-4xl mx-auto w-full pt-6">
            {currentPart === ExamPart.PART_1_2 && currentQuestion?.images ? (
              <div className="grid grid-cols-2 gap-8 md:gap-12">
                {currentQuestion.images.map((img, i) => (
                  <div
                    key={i}
                    className="rounded-[3rem] border-8 border-zinc-50 shadow-2xl overflow-hidden aspect-[4/3] transform hover:scale-[1.02] transition-transform duration-700">
                    <img src={img} className="w-full h-full object-cover" alt="Prompt Graphic" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#f9fafb] p-10 md:p-14 rounded-[3.5rem] border border-zinc-100/50 flex flex-col items-center gap-10">
                <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.5em]">
                  SUGGESTED POINTS TO COVER
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                  {(
                    currentQuestion?.benefits || [
                      'Past experience',
                      'Personal preference',
                      'Future impact',
                    ]
                  ).map((point, i) => (
                    <div
                      key={i}
                      className="px-10 py-5 bg-white rounded-2xl border border-zinc-200 text-zinc-700 font-black text-xl shadow-sm hover:shadow-md transition-shadow">
                      • {point}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {status === 'RECORDING' && (
            <div className="space-y-6 mt-12 w-full flex flex-col items-center">
              <div className="w-full max-w-2xl h-24 relative">
                <canvas
                  ref={waveformCanvasRef}
                  width={800}
                  height={200}
                  className="w-full h-full"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#ff7300] animate-ping"></span>
                <p className="text-[#ff7300] font-black uppercase tracking-[0.6em] text-[11px]">
                  RECORDING AUDIO
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {status === 'IDLE' && (
        <div className="space-y-12 animate-in zoom-in duration-700">
          <div className="text-[10rem] opacity-5 font-black">NEXT</div>
          <div className="space-y-4">
            <h3 className="text-6xl font-black text-[#222222]">Section Completed</h3>
            <p className="text-zinc-400 text-2xl font-medium">Ready for the next part?</p>
          </div>
          <button
            onClick={onNextPart}
            className="bg-[#222222] text-white px-20 py-8 rounded-[2rem] font-black text-2xl hover:bg-[#ff7300] transition-all shadow-2xl active:scale-[0.97] flex items-center gap-10 mx-auto group">
            <span>CONTINUE EXAM</span>
            <span className="text-3xl group-hover:translate-x-4 transition-transform">→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExamBody;
