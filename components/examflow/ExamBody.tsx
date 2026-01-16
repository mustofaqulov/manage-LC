import React from 'react';
import { ExamPart, Question, ExamStatus } from '../../types';

interface ExamBodyProps {
  status: ExamStatus;
  currentQuestion?: Question;
  currentPart?: ExamPart;
  waveformCanvasRef: React.RefObject<HTMLCanvasElement>;
  onNextPart: () => void;
  displayTime?: number;
  timeProgress?: number;
}

const ExamBody: React.FC<ExamBodyProps> = ({
  status,
  currentQuestion,
  currentPart,
  waveformCanvasRef,
  onNextPart,
  displayTime = 0,
  timeProgress = 1,
}) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-2 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-amber-500/5 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

      {/* Main glassmorphic container */}
      <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[36px] p-10 md:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center text-center min-h-[500px]">
        {/* READING state - Listening prompt */}
        {status === ExamStatus.READING && (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Icon with pulsing glow */}
            <div className="relative inline-flex items-center justify-center w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-amber-500/30 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </div>
            </div>

            {/* Text */}
            <div className="space-y-3">
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Listen to the prompt
              </h3>
              <p className="text-white/50 text-base font-medium">Test continues automatically</p>
            </div>
          </div>
        )}

        {/* PREPARING or RECORDING state - Show question */}
        {(status === ExamStatus.PREPARING || status === ExamStatus.RECORDING) && (
          <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Secondary status pill */}
            <div className="flex justify-center mb-6">
              <div
                className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border backdrop-blur-sm transition-all duration-300 ${
                  status === ExamStatus.RECORDING
                    ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    : 'bg-orange-500/10 border-orange-500/30 shadow-[0_0_15px_rgba(251,146,60,0.2)]'
                }`}>
                <div
                  className={`w-2 h-2 rounded-full ${
                    status === ExamStatus.RECORDING ? 'bg-red-500 animate-pulse' : 'bg-orange-400'
                  }`}
                />
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    status === ExamStatus.RECORDING ? 'text-red-400' : 'text-orange-300'
                  }`}>
                  {status === ExamStatus.RECORDING ? 'Recording' : 'Prepare'}
                </span>
              </div>
            </div>


            {/* Question text */}
            {currentQuestion?.text && (
              <p className="text-lg md:text-xl text-white/60 font-medium max-w-3xl mx-auto leading-relaxed">
                {currentQuestion?.text}
              </p>
            )}

            {/* Images for PART_1_2 */}
            {currentPart === ExamPart.PART_1_2 && currentQuestion?.images && (
              <div className="grid grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto pt-6">
                {currentQuestion.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative group/img overflow-hidden rounded-2xl border border-white/10 aspect-[4/3] shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                    <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/20 to-amber-500/20 blur-xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                    <img
                      src={img}
                      className="relative w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                      alt="Prompt"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Recording waveform */}
            {status === ExamStatus.RECORDING && (
              <div className="space-y-5 pt-8">
                <div className="relative w-full max-w-2xl mx-auto h-20">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent blur-xl" />
                  <canvas
                    ref={waveformCanvasRef}
                    width={800}
                    height={160}
                    className="relative w-full h-full"
                  />
                </div>
                <div className="flex items-center justify-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                  <span className="text-red-400 font-bold uppercase tracking-widest text-xs">
                    Recording
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* IDLE state - Loading next question */}
        {status === ExamStatus.IDLE && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Loading indicator */}
            <div className="relative inline-flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-amber-500/30 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-orange-400 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-black text-white">
                Preparing next question...
              </h3>
              <p className="text-white/40 text-sm font-medium">
                The exam will continue automatically
              </p>
            </div>
          </div>
        )}

        {/* SECTION_COMPLETE state - Show Continue button */}
        {status === ExamStatus.SECTION_COMPLETE && (
          <div className="space-y-10 animate-in zoom-in duration-700">
            {/* Icon */}
            <div className="relative inline-flex items-center justify-center w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-emerald-500/30 blur-2xl rounded-full" />
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-400"
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

            {/* Text */}
            <div className="space-y-3">
              <h3 className="text-4xl md:text-5xl font-black text-white">Section Complete</h3>
              <p className="text-white/50 text-lg font-medium">
                Ready to continue to the next part?
              </p>
            </div>

            {/* Continue button */}
            <button
              onClick={onNextPart}
              className="group/btn inline-flex items-center gap-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white px-12 py-5 rounded-2xl font-black text-xl uppercase shadow-[0_10px_40px_rgba(255,140,0,0.4)] hover:shadow-[0_15px_50px_rgba(255,140,0,0.6)] hover:scale-105 active:scale-95 transition-all duration-300">
              <span>Continue</span>
              <svg
                className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamBody;
