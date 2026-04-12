import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#050505]">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20">
        {/* Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 dark:from-[#050505] dark:via-[#0a0805] to-white dark:to-black" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.07)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,255,255,0.9),transparent_70%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(5,5,5,0.8),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,115,0,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,115,0,0.18),transparent)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-orange-500/[0.04] dark:bg-orange-500/[0.07] blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — Text */}
            <div className="flex flex-col items-start">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-orange-300 text-xs font-semibold tracking-wider uppercase">
                  AI-powered · CEFR Speaking
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.08] mb-5">
                CEFR Speaking<br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300 bg-clip-text text-transparent">
                  Imtihoniga Tayyor
                </span>
                <br />Bo'ling
              </h1>

              {/* Sub */}
              <p className="text-gray-600 dark:text-white/55 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                Real imtihon sharoitida mashq qiling, sun'iy intellekt yordamida
                batafsil baho oling va darajangizni tezda oshiring.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-10">
                {['AI baho', 'Real format', 'A2 → C1', 'PDF hisobot'].map((f) => (
                  <span
                    key={f}
                    className="px-3 py-1 rounded-full bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white/65 text-xs font-medium">
                    ✓ {f}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  to="/mock-exam"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold text-sm shadow-[0_8px_32px_rgba(255,115,0,0.35)] hover:shadow-[0_10px_40px_rgba(255,115,0,0.5)] transition-all duration-300 hover:-translate-y-0.5">
                  Imtihonni boshlash
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/mock-exam"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gray-200 dark:bg-white/5 border border-gray-300 dark:border-white/10 hover:bg-gray-300 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/20 text-gray-800 dark:text-white/80 font-semibold text-sm transition-all duration-300">
                  Demo test ishlash
                </Link>
              </div>
            </div>

            {/* Right — Score card mockup */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-[500px]">
                {/* Glow */}
                <div className="absolute inset-0 bg-orange-500/15 dark:bg-orange-500/15 blur-3xl rounded-3xl" />

                {/* Card */}
                <div className="relative rounded-3xl bg-white dark:bg-white/[0.04] border border-gray-300 dark:border-white/10 backdrop-blur-xl p-7 shadow-[0_32px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-gray-500 dark:text-white/40 text-xs font-medium uppercase tracking-wider">Sizning natijangiz</p>
                      <p className="text-gray-900 dark:text-white text-sm font-bold mt-0.5">CEFR Speaking</p>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-gray-900 dark:text-white leading-none">68%</span>
                    </div>
                  </div>

                  {/* Current level highlight */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-5">
                    <span className="text-3xl font-black text-orange-400 leading-none">C1</span>
                    <div>
                      <p className="text-gray-900 dark:text-white text-sm font-bold">Advanced</p>
                      <p className="text-gray-500 dark:text-white/40 text-xs">65–75% · Sizning darajangiz</p>
                    </div>
                  </div>

                  {/* CEFR level bars */}
                  <div className="space-y-2.5">
                    {[
                      { level: 'A2', label: 'Elementary',         range: '0–37%',  pct: 37,  color: 'bg-blue-400',   active: false },
                      { level: 'B1', label: 'Intermediate',       range: '38–50%', pct: 50,  color: 'bg-cyan-400',   active: false },
                      { level: 'B2', label: 'Upper Intermediate', range: '51–64%', pct: 64,  color: 'bg-green-400',  active: false },
                      { level: 'C1', label: 'Advanced',           range: '65–75%', pct: 100, color: 'bg-orange-400', active: true  },
                    ].map(({ level, label, range, pct, color, active }) => (
                      <div key={level} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${active ? 'bg-orange-500/8 border border-orange-500/15' : ''}`}>
                        <span className={`w-9 text-xs font-black ${active ? 'text-orange-400' : 'text-gray-500 dark:text-white/30'}`}>{level}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] font-medium ${active ? 'text-gray-700 dark:text-white/60' : 'text-gray-400 dark:text-white/25'}`}>{label}</span>
                            <span className={`text-[10px] font-bold ${active ? 'text-orange-400' : 'text-gray-400 dark:text-white/25'}`}>{range}</span>
                          </div>
                          <div className="h-1 rounded-full bg-gray-200 dark:bg-white/8 overflow-hidden">
                            <div className={`h-full rounded-full ${active ? color : 'bg-gray-300 dark:bg-white/10'}`} style={{ width: `${pct}%`, opacity: active ? 1 : 0.4 }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI feedback */}
                  <div className="mt-4 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5">
                    <p className="text-gray-500 dark:text-white/35 text-[11px] leading-relaxed">
                      "Pauzalarni kamaytiring va bog'lovchi so'zlarni ko'proq ishlating."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: '40+', label: "Imtihon savollari" },

              { value: 'AI', label: "Avtomatik baho" },
              { value: 'A2–C1', label: "CEFR darajalari" },
              { value: '3 qism', label: "Speaking format" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="px-5 py-4 rounded-2xl bg-gray-200 dark:bg-white/[0.03] border border-gray-300 dark:border-white/[0.07] text-center">
                <p className="text-gray-900 dark:text-white text-2xl font-black mb-1">{value}</p>
                <p className="text-gray-600 dark:text-white/40 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-[#050505] via-gray-50 dark:via-[#080806] to-white dark:to-[#050505]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02) dark:rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02) dark:rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">Qanday ishlaydi</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
              3 qadamda imtihon topshiring
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-[38px] left-[22%] right-[22%] h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

            {[
              {
                step: '01',
                icon: (
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                ),
                title: 'Testni tanlang',
                desc: 'IELTS formati yoki darajangizga mos testni tanlang',
              },
              {
                step: '02',
                icon: (
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ),
                title: 'Gapiring',
                desc: 'Savollarni tinglang, tayyorlaning va javobingizni yozib oling',
              },
              {
                step: '03',
                icon: (
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'AI baho oling',
                desc: "Fluency, Vocabulary, Grammar va Pronunciation bo'yicha batafsil tahlil",
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-gray-300 dark:border-white/[0.07]">
                {/* Step circle */}
                <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
                  {icon}
                </div>
                <span className="text-orange-500/50 text-xs font-black tracking-widest uppercase mb-2">{step}</span>
                <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-white/45 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-14 flex justify-center">
            <Link
              to="/mock-exam"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold shadow-[0_8px_32px_rgba(255,115,0,0.3)] hover:shadow-[0_12px_40px_rgba(255,115,0,0.45)] transition-all duration-300 hover:-translate-y-0.5">
              Hoziroq boshlash
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
