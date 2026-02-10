import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/useTranslation';

const CourseDetail: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="relative bg-[#050505] text-white overflow-hidden">
      {/* Global background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b0b0b] via-[#120c06] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_40%,rgba(255,115,0,0.28),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_70%,rgba(34,197,94,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <section className="relative min-h-[80vh] flex items-center px-6 p-10 md:px-12">
        <div className="relative mt-[150px] z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* LEFT */}
          <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
              <Link to="/" className="hover:text-orange-400 transition">
                {t('courseDetail.breadcrumbHome')}
              </Link>
              <span>/</span>
              <span className="text-white">{t('courseDetail.breadcrumbCourse')}</span>
            </nav>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-tight mb-6">
              {t('courseDetail.titleEnglish')}{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                {t('courseDetail.titleMastery')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/65 text-lg max-w-xl leading-relaxed mb-10">
              {t('courseDetail.subtitle')}
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-5">
              <a href="https://forms.gle/u3T9MVfcRbJQN2Rr6">
                <button
                  className="
                  px-10 py-4 rounded-2xl font-black
                  bg-gradient-to-r from-orange-500 to-amber-400
                  text-white
                  shadow-[0_15px_50px_rgba(255,115,0,0.45)]
                  hover:shadow-[0_25px_80px_rgba(255,115,0,0.65)]
                  hover:scale-[1.05]
                  transition-all duration-300
                ">
                  {t('courseDetail.joinCourse')}
                </button>
              </a>
              <button
                className="
                  px-10 py-4 rounded-2xl font-semibold
                  border border-white/20
                  bg-white/5 backdrop-blur-sm
                  hover:bg-white/10 hover:border-white/30
                  transition-all duration-300
                ">
                {t('courseDetail.freeConsultation')}
              </button>
            </div>
          </div>

          {/* RIGHT – STATS */}
          <div className="grid grid-cols-2 gap-6">
            {[
              {
                value: 'C1+',
                label: t('courseDetail.targetLevel'),
                glow: 'from-orange-400/40 to-amber-400/30',
              },
              {
                value: '8.0',
                label: t('courseDetail.topIELTS'),
                glow: 'from-blue-400/40 to-cyan-400/30',
              },
              {
                value: '500+',
                label: t('courseDetail.activeStudents'),
                glow: 'from-green-400/40 to-emerald-400/30',
              },
              {
                value: '98%',
                label: t('courseDetail.successRate'),
                glow: 'from-purple-400/40 to-fuchsia-400/30',
              },
            ].map((item, i) => (
              <div key={i} className="group relative">
                {/* Glow */}
                <div
                  className={`
                    absolute -inset-1 rounded-3xl blur-2xl opacity-0
                    bg-gradient-to-br ${item.glow}
                    group-hover:opacity-100 transition-all duration-500
                  `}
                />

                {/* Card */}
                <div
                  className="
                    relative rounded-3xl p-8
                    bg-white/10 backdrop-blur-xl
                    border border-white/15
                    shadow-[0_20px_60px_rgba(0,0,0,0.6)]
                    transition-all duration-500 ease-out
                    group-hover:-translate-y-2 group-hover:scale-[1.04]
                  ">
                  <div className="text-4xl font-black mb-2 text-white">{item.value}</div>
                  <div className="text-white/60 text-sm uppercase tracking-wider">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;

