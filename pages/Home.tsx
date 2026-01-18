import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';
import StudentImg from '../assets/images/manages-stdnts.jpg';
import StudentsImg from '../assets/images/1k.jpg';
import Bg from '../assets/images/background-1.jpg';
import Course from '../assets/images/main.jpg';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const courses = [
    {
      level: 'CEFR A2',
      title: t('home.elementaryLevel'),
      description: t('home.elementaryDesc'),
      overlayGradient: 'from-cyan-400/25 via-blue-500/20 to-indigo-600/20',
      accentGlow: 'rgba(56,189,248,0.45)', // cyan
      bg: Course,
    },
    {
      level: 'CEFR B1',
      title: t('home.intermediateLevel'),
      description: t('home.intermediateDesc'),
      overlayGradient: 'from-emerald-400/25 via-green-500/20 to-teal-600/20',
      accentGlow: 'rgba(34,197,94,0.45)', // green
      bg: Course,
    },
    {
      level: 'CEFR B2',
      title: t('home.upperIntermediateLevel'),
      description: t('home.upperIntermediateDesc'),
      overlayGradient: 'from-orange-400/30 via-amber-500/25 to-yellow-400/20',
      accentGlow: 'rgba(251,146,60,0.5)', // orange
      bg: Course,
    },
    {
      level: 'CEFR C1',
      title: t('home.advancedLevel'),
      description: t('home.advancedDesc'),
      overlayGradient: 'from-purple-500/30 via-fuchsia-500/25 to-pink-500/20',
      accentGlow: 'rgba(168,85,247,0.55)', // violet
      bg: Course,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % courses.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [courses.length]);

  return (
    <div className="bg-transparent">
      <section className="relative w-full py-16 sm:py-24 md:py-28 overflow-hidden -mt-14 md:-mt-28">
        <div className="absolute inset-0 z-0">
          {courses.map((course, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${Bg})` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#050505]/90 via-[#0e0e0e]/90 to-black/90" />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${course.overlayGradient}`}
                  style={{ opacity: 0.55 }}
                />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,115,0,0.35),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,215,0,0.25),transparent_60%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-20 h-full flex flex-col">
          <div className="flex justify-center px-3 sm:px-4 md:px-6">
            <div
              className="relative mt-3 sm:mt-5 w-full h-[70vh] sm:h-[80vh] md:h-[90vh] md:min-h-[800px]
                        bg-white/10 backdrop-blur-2xl border border-white/20
                        rounded-[24px] sm:rounded-[32px] md:rounded-[40px]
                        p-6 sm:p-10 md:p-16
                        shadow-[0_20px_80px_rgba(0,0,0,0.95)] md:shadow-[0_40px_140px_rgba(0,0,0,0.95)]">
              <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-br from-orange-500/30 to-yellow-400/20 blur-2xl sm:blur-3xl rounded-2xl sm:rounded-3xl" />
              <div className="relative h-full flex items-end justify-center pb-4 sm:pb-8 md:pb-0 md:items-end">
                <div className="w-full text-center space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Link
                      to="/courses/english"
                      className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4
                               bg-gradient-to-r from-orange-500 to-yellow-400
                               rounded-xl sm:rounded-2xl
                               font-bold text-sm sm:text-base text-white
                               shadow-xl hover:scale-105 transition-transform">
                      {t('home.exploreCourses')}
                    </Link>

                    <Link
                      to="/mock-exam"
                      className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4
                               bg-black/60 border border-white/20
                               rounded-xl sm:rounded-2xl
                               text-sm sm:text-base text-white
                               hover:bg-black/80 transition-colors">
                      {t('mockExam.startExam')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-grow" />
        </div>

        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-30">
          {courses.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 sm:h-2 transition-all ${
                i === currentSlide
                  ? 'w-8 sm:w-10 bg-orange-500 shadow-[0_0_15px_orange]'
                  : 'w-1.5 sm:w-2 bg-white/40'
              } rounded-full`}
            />
          ))}
        </div>
      </section>

      <section className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[#050505] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b0b0b] via-[#120c06] to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(255,115,0,0.25),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_65%,rgba(124,58,237,0.22),transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:90px_90px]" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-24">
            <h2
              className="
        text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-4 sm:mb-6
        text-white
        drop-shadow-[0_12px_45px_rgba(255,115,0,0.35)]
        px-4
      ">
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                {t('home.heroCta')}
              </span>
            </h2>

            <div className="w-20 sm:w-24 md:w-28 h-1 sm:h-1.5 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-14">
            <div
              onClick={() => navigate('/courses/english')}
              className="
          group relative cursor-pointer
          rounded-[24px] sm:rounded-[32px] md:rounded-[42px]
          p-6 sm:p-8 md:p-12
          bg-white/5 backdrop-blur-xl
          border border-white/15
          shadow-[0_15px_60px_rgba(0,0,0,0.9)] md:shadow-[0_25px_90px_rgba(0,0,0,0.9)]
          transition-all duration-500
          hover:-translate-y-2 hover:scale-[1.02] md:hover:scale-[1.05]
          hover:shadow-[0_30px_100px_rgba(255,140,0,0.45)] md:hover:shadow-[0_45px_140px_rgba(255,140,0,0.45)]
        ">
              <div
                className="
          absolute -inset-3 sm:-inset-4 rounded-[28px] sm:rounded-[36px] md:rounded-[46px]
          bg-gradient-to-br from-orange-400/45 via-amber-300/35 to-pink-400/30
          blur-2xl md:blur-3xl opacity-0
          group-hover:opacity-100
          transition duration-500
        "
              />

              <div className="relative z-10">
                <div
                  className="
            w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20
            rounded-xl sm:rounded-2xl
            mb-5 sm:mb-6 md:mb-8
            bg-gradient-to-br from-orange-500 to-yellow-400
            flex items-center justify-center
            shadow-[0_12px_35px_rgba(255,140,0,0.6)] md:shadow-[0_18px_50px_rgba(255,140,0,0.6)]
            transition-transform duration-500
            group-hover:scale-110
          ">
                  <span className="text-white text-2xl sm:text-3xl md:text-4xl font-black">EN</span>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-3 sm:mb-4">
                  {t('homeExtended.titleEnglish')}
                </h3>

                <p className="text-white/65 text-sm sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-6 md:mb-8 max-w-md">
                  {t('homeExtended.descriptionEnglish')}
                </p>

                <div
                  className="
            flex items-center gap-2 sm:gap-3
            text-orange-400 font-bold text-base sm:text-lg
            transition-all duration-300
            group-hover:gap-4 sm:group-hover:gap-6
          ">
                  {t('homeExtended.learnMore')} <span>→</span>
                </div>
              </div>
            </div>

            <div
              className="
          relative
          rounded-[24px] sm:rounded-[32px] md:rounded-[42px]
          p-6 sm:p-8 md:p-12
          bg-white/4 backdrop-blur-xl
          border border-white/10
          opacity-60
          shadow-[0_15px_50px_rgba(0,0,0,0.8)] md:shadow-[0_20px_70px_rgba(0,0,0,0.8)]
        ">
              <div
                className="
          w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20
          rounded-xl sm:rounded-2xl
          mb-5 sm:mb-6 md:mb-8
          bg-gradient-to-br from-zinc-700 to-zinc-800
          flex items-center justify-center
        ">
                <span className="text-zinc-300 text-2xl sm:text-3xl md:text-4xl font-black">
                  MA
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-zinc-300 mb-3 sm:mb-4">
                {t('homeExtended.mathematics')}
              </h3>

              <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-6 md:mb-8 max-w-md">
                {t('homeExtended.descriptionMath')}
              </p>

              <div className="text-zinc-400 text-sm sm:text-base font-bold">
                {t('homeExtended.comingSoon')}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
