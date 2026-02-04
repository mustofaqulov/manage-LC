import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { useAuth } from '../src/hooks/useAuth';
import { useGetTests } from '../services/hooks';
import type { TestListResponse, CefrLevel } from '../src/api/types';

const LEVEL_COLORS: Record<CefrLevel, { bg: string; text: string; glow: string }> = {
  A1: { bg: 'from-green-500/20 to-emerald-500/10', text: 'text-green-400', glow: 'rgba(34,197,94,0.45)' },
  A2: { bg: 'from-teal-500/20 to-cyan-500/10', text: 'text-teal-400', glow: 'rgba(20,184,166,0.45)' },
  B1: { bg: 'from-blue-500/20 to-sky-500/10', text: 'text-blue-400', glow: 'rgba(59,130,246,0.45)' },
  B2: { bg: 'from-indigo-500/20 to-violet-500/10', text: 'text-indigo-400', glow: 'rgba(99,102,241,0.45)' },
  C1: { bg: 'from-orange-500/20 to-amber-500/10', text: 'text-orange-400', glow: 'rgba(255,140,0,0.45)' },
  C2: { bg: 'from-red-500/20 to-rose-500/10', text: 'text-red-400', glow: 'rgba(239,68,68,0.45)' },
};

const MockExam: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: testsData, isLoading, isError } = useGetTests({});

  const tests: TestListResponse[] = testsData?.items ?? [];

  const handleStartTest = (testId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/exam-flow/${testId}`);
  };

  return (
    <div className="relative min-h-screen py-20 sm:py-28 md:py-36 px-4 sm:px-6 md:px-12 overflow-hidden bg-[#050505]">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#120e08] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,140,0,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(56,189,248,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Back button */}
        <div className="flex items-center mb-8 sm:mb-10 md:mb-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-white font-semibold transition-all group px-3 sm:px-4 py-2 rounded-xl hover:bg-black/60 backdrop-blur-sm">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-white text-sm sm:text-base">{t('common.back')}</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-orange-600 via-orange-300 to-orange-300 bg-clip-text text-transparent px-4">
            {t('mockExam.title')}
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto px-4">
            {t('mockExam.description')}
          </p>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 mx-auto rounded-full mt-4 sm:mt-6" />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
            <p className="text-white/50 text-sm">{t('common.loading') || 'Yuklanmoqda...'}</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-white/60 text-lg">Testlarni yuklashda xatolik yuz berdi</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition">
              Qaytadan urinish
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && tests.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-white/60 text-lg">Hozircha testlar mavjud emas</p>
          </div>
        )}

        {/* Test Cards */}
        {!isLoading && !isError && tests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20">
            {tests.map((test) => {
              const levelStyle = LEVEL_COLORS[test.cefrLevel] || LEVEL_COLORS.B1;
              return (
                <div key={test.id} className="group relative cursor-pointer">
                  <div
                    className={`absolute inset-0 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] bg-gradient-to-br ${levelStyle.bg} opacity-40 group-hover:opacity-100 group-hover:scale-105 blur-2xl transition-all duration-700`}
                  />

                  <div
                    className={`relative rounded-[20px] sm:rounded-[24px] md:rounded-[28px] p-6 sm:p-8 md:p-10 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.8)] md:shadow-[0_20px_60px_rgba(0,0,0,0.8)] group-hover:-translate-y-2 md:group-hover:-translate-y-3 group-hover:scale-[1.02] md:group-hover:scale-[1.03] transition-all duration-500 flex flex-col items-center text-center min-h-[380px] sm:min-h-[400px] md:min-h-[370px]`}
                    style={{ '--hover-glow': levelStyle.glow } as React.CSSProperties}
                  >
                    {/* CEFR Level Badge */}
                    <div className={`px-4 py-1.5 rounded-full border border-white/10 bg-white/5 ${levelStyle.text} text-xs font-black uppercase tracking-wider mb-4`}>
                      CEFR {test.cefrLevel}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-black mt-2 text-white">
                      {test.title}
                    </h3>

                    {/* Description */}
                    {test.description && (
                      <p className="text-white/50 text-xs sm:text-sm mt-3 sm:mt-4 mb-4 line-clamp-3">
                        {test.description}
                      </p>
                    )}

                    {/* Info badges */}
                    <div className="flex items-center gap-3 mt-auto mb-6">
                      <span className="flex items-center gap-1.5 text-white/40 text-xs">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {test.sectionCount} {test.sectionCount === 1 ? 'section' : 'sections'}
                      </span>
                      {test.timeLimitMinutes && (
                        <span className="flex items-center gap-1.5 text-white/40 text-xs">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {test.timeLimitMinutes} min
                        </span>
                      )}
                    </div>

                    {/* Start button */}
                    <button
                      onClick={() => handleStartTest(test.id)}
                      className="w-full py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_8px_30px_rgba(255,140,0,0.3)] hover:shadow-[0_12px_40px_rgba(255,140,0,0.5)] hover:scale-105 transition-all duration-300">
                      {t('mockExam.startExam')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Technical Requirements */}
        <div className="relative group">
          <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] blur-xl opacity-20" />
          <div
            className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black
            text-white p-6 sm:p-8 md:p-10 rounded-[20px] sm:rounded-[24px] md:rounded-[28px]
            shadow-[0_15px_50px_rgba(0,0,0,0.3)] md:shadow-[0_20px_60px_rgba(0,0,0,0.3)]
            border border-white/5">
            <h4 className="text-lg sm:text-xl font-black mb-4 sm:mb-5 md:mb-6 flex items-center gap-2 sm:gap-3">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 text-base sm:text-lg">
                !
              </span>
              <span className="text-base sm:text-lg md:text-xl">
                {t('mockExam.technicalRequirements')}
              </span>
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 text-xs sm:text-sm">
              <li className="flex items-center gap-2 sm:gap-3 text-gray-300">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />
                <span>{t('mockExam.stableInternet')}</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-300">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />
                <span>{t('mockExam.workingMicrophone')}</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-gray-300">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />
                <span>{t('mockExam.quietEnvironment')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockExam;
