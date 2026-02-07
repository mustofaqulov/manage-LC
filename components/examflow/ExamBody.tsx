import React from 'react';
import { ExamStatus } from '../../types';
import type { QuestionResponse } from '../../src/api/types';

interface ExamBodyProps {
  status: ExamStatus;
  currentQuestion?: QuestionResponse;
  sectionImageUrls?: string[];
  promptImageUrl?: string | null;
  promptImage2Url?: string | null;
  waveformCanvasRef: React.RefObject<HTMLCanvasElement>;
  onNextPart: () => void;
  isSaving?: boolean;
}

const ExamBody: React.FC<ExamBodyProps> = ({
  status,
  currentQuestion,
  sectionImageUrls = [],
  promptImageUrl,
  promptImage2Url,
  waveformCanvasRef,
  onNextPart,
  isSaving = false,
}) => {
  const benefits: string[] = currentQuestion?.settings?.benefits ?? [];
  const drawbacks: string[] = currentQuestion?.settings?.drawbacks ?? [];
  const hasBenefitsDrawbacks = benefits.length > 0 || drawbacks.length > 0;

  return (
    <div className="relative group">
      <div className="absolute -inset-2 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-amber-500/5 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

      {/* Main glassmorphic container */}
      <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[36px] p-10 md:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center text-center min-h-[500px]">
        {/* READING state - Listening prompt */}
        {status === ExamStatus.READING && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="relative inline-flex items-center justify-center w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-amber-500/30 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </div>
            </div>

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
                    ? 'bg-orange-500/10 border-orange-500/30 shadow-[0_0_20px_rgba(255,140,0,0.3)]'
                    : 'bg-orange-500/10 border-orange-500/30 shadow-[0_0_15px_rgba(251,146,60,0.2)]'
                }`}>
                <div
                  className={`w-2 h-2 rounded-full ${
                    status === ExamStatus.RECORDING ? 'bg-orange-500 animate-pulse' : 'bg-orange-400'
                  }`}
                />
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    status === ExamStatus.RECORDING ? 'text-orange-400' : 'text-orange-300'
                  }`}>
                  {status === ExamStatus.RECORDING ? 'Recording' : 'Prepare'}
                </span>
              </div>
            </div>

            {/* Question prompt */}
            {currentQuestion?.prompt && (
              <p className="text-lg md:text-xl text-white/60 font-medium max-w-3xl mx-auto leading-relaxed">
                {currentQuestion.prompt}
              </p>
            )}

            {/* Section images (Part 1.2 — side by side, don't change between questions) */}
            {sectionImageUrls.length > 0 && (
              <div className={`grid gap-4 pt-4 ${sectionImageUrls.length >= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-lg mx-auto'}`}>
                {sectionImageUrls.map((url, i) => (
                  <div key={i} className="relative group/img overflow-hidden rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                    <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/20 to-amber-500/20 blur-xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                    <img
                      src={url}
                      className="relative w-full h-auto object-cover transition-transform duration-700 group-hover/img:scale-105"
                      alt={`Image ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Question-level images (Part 1.2 has 2 images side by side) */}
            {(promptImageUrl || promptImage2Url) && sectionImageUrls.length === 0 && (
              <div className={`grid gap-4 pt-4 ${promptImageUrl && promptImage2Url ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-lg mx-auto'}`}>
                {promptImageUrl && (
                  <div className="relative group/img overflow-hidden rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                    <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/20 to-amber-500/20 blur-xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                    <img
                      src={promptImageUrl}
                      className="relative w-full h-auto object-cover transition-transform duration-700 group-hover/img:scale-105"
                      alt="Image 1"
                    />
                  </div>
                )}
                {promptImage2Url && (
                  <div className="relative group/img overflow-hidden rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                    <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/20 to-amber-500/20 blur-xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                    <img
                      src={promptImage2Url}
                      className="relative w-full h-auto object-cover transition-transform duration-700 group-hover/img:scale-105"
                      alt="Image 2"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Benefits / Drawbacks cards (Part 3) */}
            {hasBenefitsDrawbacks && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 w-full max-w-3xl mx-auto text-left">
                {/* Benefits */}
                {benefits.length > 0 && (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider">Benefits</h4>
                    </div>
                    <ul className="space-y-2">
                      {benefits.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400/60 mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Drawbacks */}
                {drawbacks.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">Drawbacks</h4>
                    </div>
                    <ul className="space-y-2">
                      {drawbacks.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Recording indicator */}
            {status === ExamStatus.RECORDING && (
              <div className="flex flex-col items-center gap-4 pt-6">
                {/* Mic icon with pulsing rings */}
                <div className="relative flex items-center justify-center w-16 h-16">
                  <span className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping" />
                  <span className="absolute inset-1 rounded-full bg-orange-500/10 animate-[ping_1.5s_ease-in-out_infinite_0.3s]" />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(255,140,0,0.4)]">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                  </div>
                </div>
                {/* Mini equalizer bars */}
                <div className="flex items-end gap-[3px] h-5">
                  {[0, 0.15, 0.3, 0.15, 0.25, 0.1, 0.2].map((delay, i) => (
                    <span
                      key={i}
                      className="w-[3px] rounded-full bg-gradient-to-t from-orange-500 to-amber-400 opacity-80"
                      style={{
                        animation: `eqBar 0.8s ease-in-out ${delay}s infinite alternate`,
                        height: '6px',
                      }}
                    />
                  ))}
                </div>
                <span className="text-orange-400/70 font-semibold uppercase tracking-widest text-[10px]">
                  Recording
                </span>
              </div>
            )}
          </div>
        )}

        {/* IDLE state - Loading next question */}
        {status === ExamStatus.IDLE && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="relative inline-flex items-center justify-center w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-amber-500/30 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center">
                {isSaving ? (
                  <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                ) : (
                  <div className="w-8 h-8 border-3 border-orange-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-black text-white">
                {isSaving ? 'Saving your response...' : 'Preparing next question...'}
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

            <div className="space-y-3">
              <h3 className="text-4xl md:text-5xl font-black text-white">Section Complete</h3>
              <p className="text-white/50 text-lg font-medium">
                Ready to continue to the next part?
              </p>
            </div>

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
