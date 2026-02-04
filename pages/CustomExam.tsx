import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { useAuth } from '../src/hooks/useAuth';
import { useGetTests, useGetTest } from '../services/hooks';
import type { TestListResponse, CefrLevel, SectionResponse } from '../src/api/types';

const LEVEL_COLORS: Record<CefrLevel, { bg: string; text: string }> = {
  A1: { bg: 'from-green-500/20 to-emerald-500/10', text: 'text-green-400' },
  A2: { bg: 'from-teal-500/20 to-cyan-500/10', text: 'text-teal-400' },
  B1: { bg: 'from-blue-500/20 to-sky-500/10', text: 'text-blue-400' },
  B2: { bg: 'from-indigo-500/20 to-violet-500/10', text: 'text-indigo-400' },
  C1: { bg: 'from-orange-500/20 to-amber-500/10', text: 'text-orange-400' },
  C2: { bg: 'from-red-500/20 to-rose-500/10', text: 'text-red-400' },
};

const CustomExam: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());

  const { data: testsData, isLoading: isLoadingTests } = useGetTests({});
  const { data: testDetail, isLoading: isLoadingTest } = useGetTest(selectedTestId, {
    enabled: !!selectedTestId,
  });

  const tests: TestListResponse[] = testsData?.items ?? [];
  const sections: SectionResponse[] = testDetail?.sections ?? [];

  const handleSelectTest = (testId: string) => {
    setSelectedTestId(testId);
    setSelectedSections(new Set());
  };

  const handleToggleSection = (sectionId: string) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedSections.size === sections.length) {
      setSelectedSections(new Set());
    } else {
      setSelectedSections(new Set(sections.map((s) => s.id)));
    }
  };

  const handleStart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedTestId || selectedSections.size === 0) return;
    navigate(`/exam-flow/${selectedTestId}`, {
      state: {
        selectedSectionIds: Array.from(selectedSections),
        mode: 'custom',
      },
    });
  };

  const handleBack = () => {
    if (selectedTestId) {
      setSelectedTestId(null);
      setSelectedSections(new Set());
    } else {
      navigate('/mock-exam');
    }
  };

  return (
    <div className="relative min-h-screen py-20 sm:py-28 md:py-36 px-4 sm:px-6 md:px-12 overflow-hidden bg-[#050505]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#120e08] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,140,0,0.20),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(56,189,248,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-white/60 hover:text-white font-semibold transition-all group px-4 py-2 rounded-xl hover:bg-white/5 mb-8">
          <svg
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">{t('common.back')}</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            Custom Exam
          </h1>
          <p className="text-white/50 text-base sm:text-lg">
            {selectedTestId
              ? 'Qaysi bo\'limlarni topshirmoqchisiz?'
              : 'Testni tanlang'}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto rounded-full mt-4" />
        </div>

        {/* Step 1: Select Test */}
        {!selectedTestId && (
          <>
            {isLoadingTests && (
              <div className="flex flex-col items-center py-20">
                <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
                <p className="text-white/50 text-sm">Yuklanmoqda...</p>
              </div>
            )}

            {!isLoadingTests && tests.length === 0 && (
              <div className="text-center py-20">
                <p className="text-white/50 text-lg">Testlar topilmadi</p>
              </div>
            )}

            {!isLoadingTests && tests.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {tests.map((test) => {
                  const levelStyle = LEVEL_COLORS[test.cefrLevel] || LEVEL_COLORS.B1;
                  return (
                    <button
                      key={test.id}
                      onClick={() => handleSelectTest(test.id)}
                      className="group relative text-left">
                      <div className={`absolute inset-0 rounded-[24px] bg-gradient-to-br ${levelStyle.bg} opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500`} />
                      <div className="relative rounded-[20px] p-6 sm:p-8 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 group-hover:-translate-y-1 transition-all duration-300">
                        <div className={`inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 ${levelStyle.text} text-xs font-bold uppercase tracking-wider mb-3`}>
                          CEFR {test.cefrLevel}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{test.title}</h3>
                        {test.description && (
                          <p className="text-white/40 text-sm line-clamp-2">{test.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-4 text-white/30 text-xs">
                          <span>{test.sectionCount} bo'lim</span>
                          {test.timeLimitMinutes && <span>{test.timeLimitMinutes} min</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Step 2: Select Sections */}
        {selectedTestId && (
          <>
            {isLoadingTest && (
              <div className="flex flex-col items-center py-20">
                <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
                <p className="text-white/50 text-sm">Bo'limlar yuklanmoqda...</p>
              </div>
            )}

            {!isLoadingTest && sections.length === 0 && (
              <div className="text-center py-20">
                <p className="text-white/50 text-lg">Bu testda bo'limlar topilmadi</p>
              </div>
            )}

            {!isLoadingTest && sections.length > 0 && (
              <div className="space-y-6">
                {/* Test info */}
                {testDetail && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold">{testDetail.title}</h3>
                      <p className="text-white/40 text-sm mt-1">{sections.length} ta bo'lim</p>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
                      {testDetail.cefrLevel}
                    </span>
                  </div>
                )}

                {/* Select all */}
                <button
                  onClick={handleToggleAll}
                  className="flex items-center gap-3 text-white/60 hover:text-white transition px-1">
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      selectedSections.size === sections.length
                        ? 'bg-orange-500 border-orange-500'
                        : 'border-white/30 hover:border-white/50'
                    }`}>
                    {selectedSections.size === sections.length && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">Hammasini tanlash</span>
                </button>

                {/* Section cards */}
                <div className="space-y-3">
                  {sections.map((section) => {
                    const isSelected = selectedSections.has(section.id);
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleToggleSection(section.id)}
                        className={`w-full text-left rounded-2xl p-5 border transition-all duration-300 ${
                          isSelected
                            ? 'bg-orange-500/10 border-orange-500/30 shadow-[0_0_20px_rgba(255,140,0,0.1)]'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                        }`}>
                        <div className="flex items-center gap-4">
                          {/* Checkbox */}
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected
                                ? 'bg-orange-500 border-orange-500'
                                : 'border-white/30'
                            }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          {/* Section info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm truncate">
                              {section.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-white/40 text-xs capitalize">{section.skill.toLowerCase()}</span>
                              <span className="text-white/30 text-xs">{section.questionCount} savol</span>
                              {section.timeLimitMinutes && (
                                <span className="text-white/30 text-xs">{section.timeLimitMinutes} min</span>
                              )}
                            </div>
                          </div>

                          {/* Skill badge */}
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                            section.skill === 'SPEAKING'
                              ? 'bg-orange-500/10 text-orange-400'
                              : section.skill === 'LISTENING'
                                ? 'bg-blue-500/10 text-blue-400'
                                : section.skill === 'READING'
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-purple-500/10 text-purple-400'
                          }`}>
                            {section.skill}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Start button */}
                <div className="pt-4">
                  <button
                    onClick={handleStart}
                    disabled={selectedSections.size === 0}
                    className={`w-full py-4 rounded-2xl font-bold text-base uppercase tracking-wider transition-all duration-300 ${
                      selectedSections.size > 0
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_8px_30px_rgba(255,140,0,0.3)] hover:shadow-[0_12px_40px_rgba(255,140,0,0.5)] hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}>
                    {selectedSections.size > 0
                      ? `Boshlash (${selectedSections.size} bo'lim)`
                      : 'Kamida 1 bo\'lim tanlang'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomExam;
