import React from 'react';
import { useTranslation } from '../i18n/useTranslation';
import Main2 from '../assets/images/main2.jpg';

const About: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="relative min-h-screen py-28 px-6 md:px-12 overflow-hidden bg-[#050505]">
      {/* Dark premium background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#120e08] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,115,0,0.2),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 max-w-6xl mx-auto text-white">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            {t('about.title')}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"></span>
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-amber-400 mx-auto rounded-full" />
        </div>

        {/* Main Content Card */}
        <div className="relative mb-20">
          <div className="absolute -inset-2 bg-gradient-to-br from-orange-500/20 to-amber-400/20 blur-2xl rounded-3xl opacity-60" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 md:p-14 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
            {/* Image */}
            <div className="relative mb-12 group">
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-400/40 to-yellow-400/40 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition" />
              <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={Main2}
                  alt="Manage LC"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Mission */}
            <div className="mb-10">
              <h3 className="text-3xl font-black mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  🎯
                </span>
                {t('about.mission')}
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">{t('about.missionDesc')}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '10+', label: 'Expert Teachers' },
            { value: '300+', label: 'Exams Taken' },
            { value: '10+', label: 'Campuses' },
            { value: '92%', label: 'Pass Rate' },
          ].map((stat, i) => (
            <div key={i} className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/30 to-amber-400/30 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition" />
              <div
                className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center
                hover:-translate-y-2 transition shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                <p className="text-5xl font-black bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </p>
                <p className="text-white/60 text-sm font-semibold">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
