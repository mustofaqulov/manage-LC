import React from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { ExamMode } from '../types';

const History: React.FC = () => {
  const { t } = useTranslation();
  const mockHistory = [
    { id: '1', date: '2023-11-20', mode: ExamMode.FULL, score: 8.5, recordings: 10 },
    { id: '2', date: '2023-11-15', mode: ExamMode.RANDOM, score: 7.0, recordings: 3 },
    { id: '3', date: '2023-11-10', mode: ExamMode.FULL, score: 6.5, recordings: 10 },
  ];

  return (
    <div className="relative min-h-screen py-36 px-6 md:px-12 overflow-hidden bg-[#050505]">
      {/* Dark premium background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#120e08] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,115,0,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 max-w-6xl mx-auto text-white">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            {t('history.title')} <span className="text-orange-400"></span>
          </h1>
          <p className="text-white/60 text-lg">{t('history.subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {/* Total Exams */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-white/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition" />
            <div
              className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8
              hover:-translate-y-2 transition">
              <p className="text-white/50 text-xs font-bold uppercase mb-2">
                {t('history.totalExams')}
              </p>
              <p className="text-5xl font-black">12</p>
            </div>
          </div>

          {/* Avg Score */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/40 to-amber-400/40 rounded-3xl blur-xl" />
            <div
              className="relative bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-8
              shadow-[0_20px_70px_rgba(255,115,0,0.45)]
              hover:-translate-y-2 transition">
              <p className="text-orange-100 text-xs font-bold uppercase mb-2">
                {t('history.avgScore')}
              </p>
              <p className="text-5xl font-black text-white">7.2</p>
            </div>
          </div>

          {/* Best Score */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-green-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition" />
            <div
              className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8
              hover:-translate-y-2 transition">
              <p className="text-white/50 text-xs font-bold uppercase mb-2">
                {t('history.bestScore')}
              </p>
              <p className="text-5xl font-black text-green-400">8.5</p>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-amber-400/20 blur-xl rounded-3xl opacity-40" />
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  {[
                    t('history.date'),
                    t('history.mode'),
                    t('history.recordings'),
                    t('history.score'),
                    'Action',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-8 py-5 text-xs font-black uppercase tracking-wider text-white/60">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {mockHistory.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-8 py-6 font-semibold">{item.date}</td>

                    <td className="px-8 py-6">
                      <span
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase ${
                          item.mode === ExamMode.FULL
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        }`}>
                        {item.mode}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-white/60">
                      {item.recordings} {t('history.recordings')}
                    </td>

                    <td className="px-8 py-6 text-2xl font-black">{item.score}</td>

                    <td className="px-8 py-6">
                      <button
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500
                        font-bold shadow-lg hover:scale-105 transition">
                        Review →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
