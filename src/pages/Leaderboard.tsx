import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { apiClient } from '../services/api';

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  bestScore: number | null;
  attemptCount: number;
  cefrLevel: string | null;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  size: number;
  type: string;
  period: string;
}

const CEFR_COLORS: Record<string, string> = {
  A1: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  A2: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  B1: 'bg-green-500/20 text-green-400 border-green-500/30',
  B2: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  C1: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  C2: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const PAGE_SIZE = 20;

const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'score' | 'attempts'>('score');
  const [period, setPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [page, setPage] = useState(0);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/leaderboard', {
        params: { type, period, page, size: PAGE_SIZE },
      });
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [type, period, page]);

  useEffect(() => {
    setPage(0);
  }, [type, period]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="relative min-h-screen pt-24 sm:pt-28 md:pt-32 pb-16 overflow-hidden bg-[#050505]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#120e08] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,115,0,0.20),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_70%,rgba(59,130,246,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-3xl shadow-[0_10px_40px_rgba(255,115,0,0.4)] mb-4">
            🏆
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            {t('leaderboard.title')}
          </h1>
          <p className="text-white/50 text-sm">{t('leaderboard.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {/* Type */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
            {(['score', 'attempts'] as const).map((t_) => (
              <button
                key={t_}
                onClick={() => setType(t_)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  type === t_
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {t_ === 'score' ? t('leaderboard.score') : t('leaderboard.exams')}
              </button>
            ))}
          </div>

          {/* Period */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
            {(['all', 'weekly', 'monthly'] as const).map((p_) => (
              <button
                key={p_}
                onClick={() => setPeriod(p_)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  period === p_
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {p_ === 'all' ? 'Barcha vaqt' : p_ === 'weekly' ? 'Haftalik' : 'Oylik'}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 podium (only on first page) */}
        {!loading && data && page === 0 && data.entries.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-8">
            {[data.entries[1], data.entries[0], data.entries[2]].map((entry, idx) => {
              const heights = ['h-24', 'h-32', 'h-20'];
              const glows = [
                'shadow-[0_0_20px_rgba(156,163,175,0.3)]',
                'shadow-[0_0_30px_rgba(255,180,0,0.5)]',
                'shadow-[0_0_20px_rgba(180,120,50,0.3)]',
              ];
              return (
                <div key={entry.rank} className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
                  <div className="text-2xl">{MEDAL[entry.rank]}</div>
                  <div className="text-xs text-white/70 font-semibold text-center leading-tight px-1 truncate w-full text-center">
                    {entry.displayName}
                  </div>
                  {entry.cefrLevel && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                        CEFR_COLORS[entry.cefrLevel] ?? 'bg-white/10 text-white/60 border-white/20'
                      }`}
                    >
                      {entry.cefrLevel}
                    </span>
                  )}
                  <div
                    className={`w-full rounded-t-xl ${heights[idx]} ${glows[idx]} flex flex-col items-center justify-center gap-1
                      ${idx === 1 ? 'bg-gradient-to-b from-amber-500/30 to-amber-600/10 border border-amber-400/30' : 'bg-white/5 border border-white/10'}`}
                  >
                    <span className="text-white font-black text-lg">
                      {type === 'score'
                        ? entry.bestScore != null
                          ? entry.bestScore.toFixed(1)
                          : '—'
                        : entry.attemptCount}
                    </span>
                    <span className="text-white/40 text-[10px]">
                      {type === 'score' ? '/75' : t('leaderboard.exams')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[3rem_1fr_6rem_5rem] gap-2 px-4 py-3 border-b border-white/10 text-xs font-bold text-white/30 uppercase tracking-wider">
            <span>{t('leaderboard.rank')}</span>
            <span>{t('leaderboard.name')}</span>
            <span className="text-right">{t('leaderboard.score')}</span>
            <span className="text-right">{t('leaderboard.exams')}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !data || data.entries.length === 0 ? (
            <div className="text-center py-16 text-white/30">{t('leaderboard.noLeaderboard')}</div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {data.entries.map((entry) => {
                const isTop3 = entry.rank <= 3;
                return (
                  <div
                    key={entry.rank}
                    className={`grid grid-cols-[3rem_1fr_6rem_5rem] gap-2 items-center px-4 py-3 transition-colors hover:bg-white/[0.04] ${
                      isTop3 ? 'bg-white/[0.02]' : ''
                    }`}
                  >
                    <span className={`font-black text-sm ${isTop3 ? 'text-lg' : 'text-white/40'}`}>
                      {MEDAL[entry.rank] ?? `#${entry.rank}`}
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-white font-semibold text-sm truncate">
                        {entry.displayName}
                      </span>
                      {entry.cefrLevel && (
                        <span
                          className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-md border font-bold ${
                            CEFR_COLORS[entry.cefrLevel] ??
                            'bg-white/10 text-white/60 border-white/20'
                          }`}
                        >
                          {entry.cefrLevel}
                        </span>
                      )}
                    </div>
                    <span className="text-right text-white/80 font-bold text-sm">
                      {entry.bestScore != null ? entry.bestScore.toFixed(1) : '—'}
                    </span>
                    <span className="text-right text-white/50 text-sm">{entry.attemptCount}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-semibold disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              ←
            </button>
            <span className="text-white/40 text-sm">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-semibold disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
