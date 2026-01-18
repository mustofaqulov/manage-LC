import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { ExamMode, User } from '../types';

interface MockExamProps {
  user: User | null;
}

const MockExam: React.FC<MockExamProps> = ({ user }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleStartExam = (mode: ExamMode) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.isSubscribed) {
      alert(t('mockExam.subscriptionRequired'));
      return;
    }

    navigate(`/exam-flow/${mode}`);
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
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

        {/* Test Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20">
          {/* Full Mock Test Card - Orange/Amber gradient */}
          <div className="group relative cursor-pointer">
            {/* Animated gradient background */}
            <div
              className="
    absolute inset-0 rounded-[24px] sm:rounded-[28px] md:rounded-[32px]
    bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-yellow-400/10
    opacity-40
    group-hover:opacity-100
    group-hover:scale-105
    blur-2xl
    transition-all duration-700
  "
            />

            <div
              className="
    relative rounded-[20px] sm:rounded-[24px] md:rounded-[28px]
    p-6 sm:p-8 md:p-10
    bg-white/5 backdrop-blur-xl
    border border-white/10
    shadow-[0_15px_50px_rgba(0,0,0,0.8)] md:shadow-[0_20px_60px_rgba(0,0,0,0.8)]
    group-hover:-translate-y-2 md:group-hover:-translate-y-3 group-hover:scale-[1.02] md:group-hover:scale-[1.03]
    group-hover:shadow-[0_30px_100px_rgba(255,140,0,0.45)] md:group-hover:shadow-[0_40px_120px_rgba(255,140,0,0.45)]
    transition-all duration-500
    flex flex-col items-center text-center
  ">
              <div
                className="
      w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20
      rounded-xl sm:rounded-2xl
      bg-gradient-to-br from-orange-500 to-yellow-400
      flex items-center justify-center text-2xl sm:text-3xl
      shadow-xl
      group-hover:rotate-6 group-hover:scale-110
      transition-all duration-500
    ">
                🏆
              </div>

              <h3 className="text-xl sm:text-2xl font-black mt-4 sm:mt-5 md:mt-6 text-white">
                {t('mockExam.fullMockTest')}
              </h3>
              <p className="text-white/60 text-xs sm:text-sm mt-3 sm:mt-4 mb-6 sm:mb-8 md:mb-10">
                {t('mockExam.fullMockDescription')}
              </p>

              <button
                onClick={() => handleStartExam(ExamMode.FULL)}
                className="
      w-full py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl
      font-bold text-sm sm:text-base text-white
      bg-gradient-to-r from-orange-500 to-yellow-400
      hover:scale-105 transition
    ">
                {t('mockExam.startExam')}
              </button>
            </div>
          </div>

          <div className="group relative cursor-pointer">
            <div
              className="
    absolute inset-0 rounded-[24px] sm:rounded-[28px] md:rounded-[32px]
    bg-gradient-to-br from-blue-500/25 via-cyan-500/15 to-sky-500/10
    opacity-40 group-hover:opacity-100 blur-2xl
    transition-all duration-700
  "
            />

            <div
              className="
    relative rounded-[20px] sm:rounded-[24px] md:rounded-[28px]
    p-6 sm:p-8 md:p-10 lg:p-[50px]
    bg-white/5 backdrop-blur-xl
    border border-white/10
    group-hover:-translate-y-2 md:group-hover:-translate-y-3 group-hover:scale-[1.02] md:group-hover:scale-[1.03]
    group-hover:shadow-[0_30px_100px_rgba(56,189,248,0.45)] md:group-hover:shadow-[0_40px_120px_rgba(56,189,248,0.45)]
    transition-all duration-500 flex flex-col items-center text-center
  ">
              <div
                className="
      w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20
      rounded-xl sm:rounded-2xl
      bg-gradient-to-br from-blue-500 to-cyan-500
      flex items-center justify-center text-2xl sm:text-3xl
      group-hover:rotate-6 group-hover:scale-110
      transition-all duration-500
    ">
                🎲
              </div>

              <h3 className="text-xl sm:text-2xl font-black mt-4 sm:mt-5 md:mt-6 text-white">
                {t('mockExam.practiceMode')}
              </h3>
              <p className="text-white/60 text-xs sm:text-sm mt-3 sm:mt-4 mb-6 sm:mb-8 md:mb-10">
                {t('mockExam.practiceDescription')}
              </p>

              <button
                onClick={() => handleStartExam(ExamMode.RANDOM)}
                className="
    w-full px-4 sm:px-6 py-3 sm:py-3.5 md:py-4
    rounded-xl sm:rounded-2xl
    font-bold text-sm sm:text-base text-white
    bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500
    shadow-[0_8px_30px_rgba(56,189,248,0.45)]
    hover:shadow-[0_12px_40px_rgba(56,189,248,0.7)]
    hover:scale-[1.05]
    transition-all duration-300
  ">
                {t('mockExam.startExam')}
              </button>
            </div>
          </div>

          {/* Custom Practice Card - Purple/Fuchsia gradient */}
          <div className="group relative cursor-pointer">
            <div
              className="
    absolute inset-0 rounded-[24px] sm:rounded-[28px] md:rounded-[32px]
    bg-gradient-to-br from-purple-500/30 via-fuchsia-500/20 to-pink-500/15
    opacity-40 group-hover:opacity-100 blur-2xl
    transition-all duration-700
  "
            />

            <div
              className="
    relative rounded-[20px] sm:rounded-[24px] md:rounded-[28px]
    p-6 sm:p-8 md:p-10 lg:p-[50px]
    bg-white/5 backdrop-blur-xl
    border border-white/10
    group-hover:-translate-y-2 md:group-hover:-translate-y-3 group-hover:scale-[1.02] md:group-hover:scale-[1.03]
    group-hover:shadow-[0_30px_100px_rgba(168,85,247,0.45)] md:group-hover:shadow-[0_40px_120px_rgba(168,85,247,0.45)]
    transition-all duration-500 flex flex-col items-center justify-center
    text-center
  ">
              <div
                className="
      w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20
      rounded-xl sm:rounded-2xl
      bg-gradient-to-br from-purple-500 to-fuchsia-500
      flex items-center justify-center text-2xl sm:text-3xl
      group-hover:rotate-6 group-hover:scale-110
      transition-all duration-500
    ">
                ⚙️
              </div>

              <h3 className="text-xl sm:text-2xl font-black mt-4 sm:mt-5 md:mt-6 text-white">
                {t('mockExam.targetLevel')}
              </h3>
              <p className="text-white/60 text-xs sm:text-sm mt-3 sm:mt-4 mb-6 sm:mb-8 md:mb-10">
                {t('mockExam.targetDescription')}
              </p>

              <button
                onClick={() => navigate('/custom-exam')}
                className="
    w-full px-4 sm:px-6 py-3 sm:py-3.5 md:py-4
    rounded-xl sm:rounded-2xl
    font-bold text-sm sm:text-base text-white
    bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500
    shadow-[0_8px_30px_rgba(168,85,247,0.45)]
    hover:shadow-[0_12px_40px_rgba(236,72,153,0.6)]
    hover:scale-[1.05]
    transition-all duration-300
  ">
                {t('mockExam.startExam')}
              </button>
            </div>
          </div>
        </div>

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
