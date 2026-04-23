import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { useAuth } from '../hooks/useAuth';
import { useHasExamAccess } from '../hooks/useHasExamAccess';
import { useGetTests } from '../services/hooks';
import { showToast } from '../utils/configs/toastConfig';
import { useAppSelector } from '../store/hooks';
import type { TestListResponse, CefrLevel } from '../api/types';

type ExamMode = 'full' | 'random';
type FullLevelFilter = CefrLevel | 'ALL';
type TestSortBy = 'PUBLISHED_DATE' | 'NAME';
type SortOrder = 'ASC' | 'DESC';

const LEVEL_COLORS: Record<CefrLevel, { bg: string; text: string; glow: string }> = {
  A1: { bg: 'from-green-500/20 to-emerald-500/10', text: 'text-green-400', glow: 'rgba(34,197,94,0.45)' },
  A2: { bg: 'from-teal-500/20 to-cyan-500/10', text: 'text-teal-400', glow: 'rgba(20,184,166,0.45)' },
  B1: { bg: 'from-blue-500/20 to-sky-500/10', text: 'text-blue-400', glow: 'rgba(59,130,246,0.45)' },
  B2: { bg: 'from-indigo-500/20 to-violet-500/10', text: 'text-indigo-400', glow: 'rgba(99,102,241,0.45)' },
  C1: { bg: 'from-orange-500/20 to-amber-500/10', text: 'text-orange-400', glow: 'rgba(255,140,0,0.45)' },
  C2: { bg: 'from-red-500/20 to-rose-500/10', text: 'text-red-400', glow: 'rgba(239,68,68,0.45)' },
};
const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const FULL_TESTS_PER_PAGE = 9;

const MODE_CARDS = [
  {
    mode: 'full' as ExamMode,
    titleKey: 'mockExam.fullMockTest',
    descKey: 'mockExam.fullMockDescription',
    durationKey: 'mockExam.fullMockDuration',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    gradient: 'from-orange-500 to-amber-500',
    glow: 'rgba(255,140,0,0.4)',
  },
  {
    mode: 'random' as ExamMode,
    titleKey: 'mockExam.practiceMode',
    descKey: 'mockExam.practiceDescription',
    durationKey: 'mockExam.practiceDuration',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    gradient: 'from-sky-500 to-blue-500',
    glow: 'rgba(56,189,248,0.4)',
  },
  {
    mode: 'custom' as const,
    titleKey: 'mockExam.targetLevel',
    descKey: 'mockExam.targetDescription',
    durationKey: 'mockExam.targetDuration',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-500',
    glow: 'rgba(139,92,246,0.4)',
  },
];

const MockExam: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { hasAccess } = useHasExamAccess();
  const { freeAttemptAvailable } = useAppSelector((state) => state.auth);
  const showFreeAttemptBanner = isAuthenticated && freeAttemptAvailable === true;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<ExamMode | null>(null);
  const [selectedRandomLevel, setSelectedRandomLevel] = useState<CefrLevel>('B1');
  const [selectedFullLevel, setSelectedFullLevel] = useState<FullLevelFilter>('ALL');
  const [sortBy, setSortBy] = useState<TestSortBy>('PUBLISHED_DATE');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const toastShownRef = useRef(false); // Toast faqat bir marta chiqishi uchun

  const {
    data: fullTestsData,
    isLoading: isFullLoading,
    isError: isFullError,
  } = useGetTests(
    {
      level: selectedFullLevel === 'ALL' ? undefined : selectedFullLevel,
      page: currentPage - 1,
      size: FULL_TESTS_PER_PAGE,
      sortBy,
      sortOrder,
    },
    { enabled: selectedMode === 'full' },
  );
  const fullTests: TestListResponse[] = fullTestsData?.items ?? [];
  const totalFullItems = fullTestsData?.totalCount ?? fullTestsData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFullItems / FULL_TESTS_PER_PAGE));

  const {
    data: randomTestsData,
    isLoading: isRandomLoading,
  } = useGetTests(
    {
      page: 0,
      size: 200,
      sortBy: 'PUBLISHED_DATE',
      sortOrder: 'DESC',
    },
    { enabled: selectedMode === 'random' },
  );
  const randomTests: TestListResponse[] = randomTestsData?.items ?? [];
  const availableRandomLevels = useMemo(
    () => CEFR_LEVELS.filter((level) => randomTests.some((test) => test.cefrLevel === level)),
    [randomTests],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (randomTests.length === 0) return;
    const hasCurrentLevel = randomTests.some((test) => test.cefrLevel === selectedRandomLevel);
    if (hasCurrentLevel) return;

    const firstAvailableLevel = CEFR_LEVELS.find((level) =>
      randomTests.some((test) => test.cefrLevel === level),
    );
    if (firstAvailableLevel) {
      setSelectedRandomLevel(firstAvailableLevel);
    }
  }, [randomTests, selectedRandomLevel]);

  // Obuna yo'q bo'lsa /subscribe ga yo'naltirish (freeAttempt bo'lmasa)
  const handleModeSelect = (mode: ExamMode | 'custom') => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!hasAccess && mode !== 'full') {
      navigate('/subscribe');
      return;
    }

    if (mode === 'custom') {
      navigate('/custom-exam');
      return;
    }
    setSelectedMode(mode);
    setCurrentPage(1);
  };

  const handleStartTest = (testId: string, isFree = false) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!hasAccess && !isFree) {
      showToast.warning('Testni boshlash uchun premium obuna kerak');
      navigate('/subscribe');
      return;
    }
    navigate(`/exam-flow/${testId}`, {
      state: { mode: selectedMode, isFree },
    });
  };

  const handleStartRandom = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const filteredTestIds = randomTests
      .filter((test) => test.cefrLevel === selectedRandomLevel)
      .map((test) => test.id);

    if (filteredTestIds.length === 0) {
      showToast.warning(`CEFR ${selectedRandomLevel} daraja uchun test topilmadi`);
      return;
    }

    navigate('/exam-flow/random', {
      state: {
        mode: 'random',
        randomConfig: {
          cefrLevel: selectedRandomLevel,
          skills: ['SPEAKING'],
        },
      },
    });
  };

  const handleBack = () => {
    if (selectedMode) {
      setSelectedMode(null);
      setCurrentPage(1);
    } else {
      navigate('/');
    }
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
            onClick={handleBack}
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

        {/* Free Attempt Banner */}
        {showFreeAttemptBanner && !selectedMode && (
          <div className="mb-8 sm:mb-10">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500" />
              <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.12)_50%,transparent_60%)] bg-[length:200%_100%] animate-[shimmer_2.5s_infinite]" />
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-8 py-5 sm:py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg sm:text-xl">Bepul imtihon sizni kutmoqda!</h3>
                    <p className="text-white/80 text-sm mt-0.5">Birinchi imtihoningizni bepul topshiring va darajangizni bilib oling</p>
                  </div>
                </div>
                <span className="px-5 py-2.5 bg-white text-orange-600 font-black text-sm rounded-full shadow-lg flex-shrink-0">
                  1 ta FREE test
                </span>
              </div>
            </div>
            <style>{`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-orange-600 via-orange-300 to-orange-300 bg-clip-text text-transparent px-4">
            {t('mockExam.title')}
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto px-4">
            {selectedMode
              ? (selectedMode === 'full' ? t('mockExam.fullMockDescription') : t('mockExam.practiceDescription'))
              : t('mockExam.description')
            }
          </p>
          <div className="w-20 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 mx-auto rounded-full mt-4 sm:mt-6" />
        </div>

        {/* Mode Selection Cards */}
        {!selectedMode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20">
            {MODE_CARDS.map((card) => (
              <button
                key={card.mode}
                onClick={() => handleModeSelect(card.mode)}
                disabled={!hasAccess}
                className={`group relative text-left ${!hasAccess ? 'cursor-not-allowed opacity-50' : ''}`}>
                <div
                  className={`absolute inset-0 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] opacity-0 blur-2xl transition-all duration-700 ${hasAccess ? 'group-hover:opacity-100' : ''}`}
                  style={{ background: `radial-gradient(circle, ${card.glow}, transparent 70%)` }}
                />
                <div className={`relative rounded-[20px] sm:rounded-[24px] md:rounded-[28px] p-6 sm:p-8 md:p-10 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.8)] transition-all duration-500 flex flex-col items-center text-center min-h-[280px] sm:min-h-[300px] ${hasAccess ? 'group-hover:-translate-y-2 md:group-hover:-translate-y-3 group-hover:scale-[1.02] md:group-hover:scale-[1.03]' : ''}`}>

                  {/* Premium Badge - faqat access yo'q bo'lsa */}
                  {!hasAccess && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 backdrop-blur-sm">
                      <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Premium
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-5 shadow-lg transition-transform duration-500 ${hasAccess ? 'group-hover:scale-110' : ''}`}>
                    {!hasAccess ? (
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      card.icon
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
                    {t(card.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-white/50 text-xs sm:text-sm mb-4 flex-1">
                    {t(card.descKey)}
                  </p>

                  {/* Duration badge */}
                  <span className="flex items-center gap-1.5 text-white/40 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t(card.durationKey)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Random mode: user selects CEFR level, not a specific test */}
        {selectedMode === 'random' && (
          <div className="mb-12 sm:mb-16 md:mb-20">
            <div className="max-w-3xl mx-auto rounded-[20px] sm:rounded-[24px] md:rounded-[28px] p-6 sm:p-8 md:p-10 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.8)]">
              <h3 className="text-white text-xl sm:text-2xl font-black text-center mb-3">
                CEFR darajani tanlang
              </h3>
              <p className="text-white/50 text-sm sm:text-base text-center mb-6 sm:mb-8">
                Test backend tomonidan random tanlanadi, siz faqat darajani belgilaysiz.
              </p>

              {isRandomLoading && (
                <p className="text-white/40 text-xs sm:text-sm text-center mb-5">Darajalar yuklanmoqda...</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                {CEFR_LEVELS.map((level) => {
                  const levelStyle = LEVEL_COLORS[level];
                  const selected = selectedRandomLevel === level;
                  const isAvailable = availableRandomLevels.length === 0 || availableRandomLevels.includes(level);
                  return (
                    <button
                      key={level}
                      disabled={!isAvailable}
                      onClick={() => setSelectedRandomLevel(level)}
                      className={`rounded-2xl border px-4 py-4 sm:py-5 transition-all ${
                        selected
                          ? 'border-orange-400/70 bg-orange-500/15 shadow-[0_10px_35px_rgba(255,140,0,0.25)]'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                      } ${!isAvailable ? 'opacity-35 cursor-not-allowed' : ''}`}>
                      <div className={`text-xs font-bold uppercase tracking-wider ${levelStyle.text}`}>CEFR</div>
                      <div className="text-white text-2xl sm:text-3xl font-black mt-1">{level}</div>
                    </button>
                  );
                })}
              </div>

              {!isRandomLoading && availableRandomLevels.length === 0 && (
                <p className="text-amber-300/80 text-sm text-center mb-6">
                  Random uchun hozircha test topilmadi
                </p>
              )}

              <button
                onClick={handleStartRandom}
                disabled={!hasAccess || isRandomLoading || availableRandomLevels.length === 0}
                className={`w-full py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base text-white transition-all duration-300 ${
                  hasAccess && !isRandomLoading && availableRandomLevels.length > 0
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 shadow-[0_8px_30px_rgba(56,189,248,0.35)] hover:shadow-[0_12px_40px_rgba(56,189,248,0.5)] hover:scale-[1.01]'
                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                }`}>
                Random imtihonni boshlash
              </button>
            </div>
          </div>
        )}

        {/* Full mode: user selects a concrete test */}
        {selectedMode === 'full' && (
          <>
            <div className="mb-6 sm:mb-8 md:mb-10 space-y-4">
              <div className="rounded-2xl p-4 sm:p-5 bg-white/[0.04] border border-white/10 backdrop-blur-xl">
                <p className="text-white/55 text-xs uppercase tracking-wider mb-3">Filter Level</p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFullLevel('ALL');
                      setCurrentPage(1);
                    }}
                    className={`h-10 rounded-xl text-xs sm:text-sm font-semibold transition ${
                      selectedFullLevel === 'ALL'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_8px_20px_rgba(255,140,0,0.35)]'
                        : 'bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08]'
                    }`}>
                    ALL
                  </button>
                  {CEFR_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        setSelectedFullLevel(level);
                        setCurrentPage(1);
                      }}
                      className={`h-10 rounded-xl text-xs sm:text-sm font-semibold transition ${
                        selectedFullLevel === level
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_8px_20px_rgba(255,140,0,0.35)]'
                          : 'bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08]'
                      }`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-2xl p-4 sm:p-5 bg-white/[0.04] border border-white/10 backdrop-blur-xl">
                  <p className="text-white/55 text-xs uppercase tracking-wider mb-3">Sort By</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy('PUBLISHED_DATE');
                        setCurrentPage(1);
                      }}
                      className={`h-10 rounded-xl text-xs sm:text-sm font-semibold transition ${
                        sortBy === 'PUBLISHED_DATE'
                          ? 'bg-sky-500/90 text-white shadow-[0_8px_20px_rgba(56,189,248,0.35)]'
                          : 'bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08]'
                      }`}>
                      Published
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy('NAME');
                        setCurrentPage(1);
                      }}
                      className={`h-10 rounded-xl text-xs sm:text-sm font-semibold transition ${
                        sortBy === 'NAME'
                          ? 'bg-sky-500/90 text-white shadow-[0_8px_20px_rgba(56,189,248,0.35)]'
                          : 'bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08]'
                      }`}>
                      Name
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl p-4 sm:p-5 bg-white/[0.04] border border-white/10 backdrop-blur-xl">
                  <p className="text-white/55 text-xs uppercase tracking-wider mb-3">Sort Order</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSortOrder('DESC');
                        setCurrentPage(1);
                      }}
                      className={`h-10 rounded-xl text-xs sm:text-sm font-semibold transition ${
                        sortOrder === 'DESC'
                          ? 'bg-emerald-500/90 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)]'
                          : 'bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08]'
                      }`}>
                      Newest
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSortOrder('ASC');
                        setCurrentPage(1);
                      }}
                      className={`h-10 rounded-xl text-xs sm:text-sm font-semibold transition ${
                        sortOrder === 'ASC'
                          ? 'bg-emerald-500/90 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)]'
                          : 'bg-white/[0.04] border border-white/10 text-white/70 hover:bg-white/[0.08]'
                      }`}>
                      Oldest
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isFullLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
                <p className="text-white/50 text-sm">{t('common.loading')}</p>
              </div>
            )}

            {/* Error State */}
            {isFullError && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-white/60 text-lg">{t('errors.loadFailed')}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition">
                  {t('common.refresh')}
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isFullLoading && !isFullError && fullTests.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-white/60 text-lg">{t('errors.loadFailed')}</p>
              </div>
            )}

            {/* Test Cards */}
            {!isFullLoading && !isFullError && fullTests.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20">
                {fullTests.map((test) => {
                  const levelStyle = LEVEL_COLORS[test.cefrLevel] || LEVEL_COLORS.B1;
                  const isFree = test.settings?.freeForAll === true;
                  const canStart = hasAccess || isFree;
                  const isLocked = !canStart;
                  return (
                    <div
                      key={test.id}
                      className="group relative cursor-pointer"
                      onClick={() => handleStartTest(test.id, isFree)}
                    >
                      {/* Glow effect */}
                      {isFree ? (
                        <div className="absolute inset-0 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] bg-gradient-to-br from-emerald-500 to-green-400 opacity-30 group-hover:opacity-60 blur-2xl transition-all duration-700" />
                      ) : isLocked ? (
                        <div className="absolute inset-0 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] bg-gradient-to-br from-gray-600 to-gray-700 opacity-20 blur-2xl transition-all duration-700" />
                      ) : (
                        <div
                          className={`absolute inset-0 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] bg-gradient-to-br ${levelStyle.bg} opacity-40 group-hover:opacity-100 group-hover:scale-105 blur-2xl transition-all duration-700`}
                        />
                      )}

                      <div
                        className={`relative rounded-[20px] sm:rounded-[24px] md:rounded-[28px] p-5 sm:p-7 md:p-10 backdrop-blur-xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] md:shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-500 flex flex-col items-center text-center min-h-[260px] sm:min-h-[320px] md:min-h-[370px]
                          ${isFree
                            ? 'bg-white/5 border-2 border-emerald-400/50 group-hover:-translate-y-2 md:group-hover:-translate-y-3 group-hover:scale-[1.02] md:group-hover:scale-[1.03]'
                            : isLocked
                              ? 'bg-white/[0.03] border border-white/5 group-hover:border-orange-500/30 group-hover:bg-white/[0.05]'
                              : 'bg-white/5 border border-white/10 group-hover:-translate-y-2 md:group-hover:-translate-y-3 group-hover:scale-[1.02] md:group-hover:scale-[1.03]'
                          }`}
                        style={{ '--hover-glow': levelStyle.glow } as React.CSSProperties}
                      >
                        {/* Lock overlay for locked tests */}
                        {isLocked && (
                          <div className="absolute inset-0 rounded-[20px] sm:rounded-[24px] md:rounded-[28px] flex items-center justify-center z-10 bg-black/10 group-hover:bg-black/5 transition-all duration-300">
                            <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                              <span className="text-orange-400 text-xs font-bold">Obuna kerak</span>
                            </div>
                          </div>
                        )}

                        {/* FREE banner */}
                        {isFree && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full shadow-[0_4px_20px_rgba(52,211,153,0.5)] z-10">
                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                              <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                            </svg>
                            <span className="text-white text-xs font-black uppercase tracking-wider">Bepul • Cheksiz</span>
                          </div>
                        )}

                        {/* Lock badge for locked tests */}
                        {isLocked && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-gray-700 to-gray-600 border border-white/10 rounded-full z-10">
                            <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-orange-400 text-xs font-bold uppercase tracking-wide">Premium</span>
                          </div>
                        )}

                        {/* CEFR Level Badge */}
                        <div className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-4 ${isFree || !isLocked ? 'mt-2' : 'mt-2'}
                          ${isLocked ? 'border-white/5 bg-white/[0.03] text-white/30' : `border-white/10 bg-white/5 ${levelStyle.text}`}`}>
                          CEFR {test.cefrLevel}
                        </div>

                        {/* Title */}
                        <h3 className={`text-xl sm:text-2xl font-black mt-2 ${isLocked ? 'text-white/40' : 'text-white'}`}>
                          {test.title}
                        </h3>

                        {/* Description */}
                        {test.description && (
                          <p className={`text-xs sm:text-sm mt-3 sm:mt-4 mb-4 line-clamp-3 ${isLocked ? 'text-white/20' : 'text-white/50'}`}>
                            {test.description}
                          </p>
                        )}

                        {/* Info badges */}
                        <div className={`flex items-center gap-3 mt-4 sm:mt-auto mb-5 sm:mb-6 ${isLocked ? 'opacity-30' : ''}`}>
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

                        {/* Start / Lock button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartTest(test.id, isFree); }}
                          className={`w-full py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base text-white transition-all duration-300
                            ${isFree
                              ? 'bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_8px_30px_rgba(52,211,153,0.3)] hover:shadow-[0_12px_40px_rgba(52,211,153,0.5)] hover:scale-105 cursor-pointer'
                              : isLocked
                                ? 'bg-white/5 border border-white/10 text-white/40 hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-400 cursor-pointer flex items-center justify-center gap-2'
                                : 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_8px_30px_rgba(255,140,0,0.3)] hover:shadow-[0_12px_40px_rgba(255,140,0,0.5)] hover:scale-105 cursor-pointer'
                            }`}>
                          {isFree ? (
                            'Bepul boshlash'
                          ) : isLocked ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Obuna olish
                            </>
                          ) : (
                            t('mockExam.startExam')
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isFullLoading && !isFullError && totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mb-12 sm:mb-16 md:mb-20">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    currentPage === 1
                      ? 'bg-white/5 text-white/30 cursor-not-allowed'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}>
                  Oldingi
                </button>
                <span className="text-white/60 text-sm font-medium min-w-[110px] text-center">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    currentPage === totalPages
                      ? 'bg-white/5 text-white/30 cursor-not-allowed'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}>
                  Keyingi
                </button>
              </div>
            )}
          </>
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

