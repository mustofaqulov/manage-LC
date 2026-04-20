import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { apiClient } from '../services/api';

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  bestScore: number | string | null;
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

const toNum = (v: number | string | null | undefined): number | null =>
  v != null ? parseFloat(String(v)) : null;

const CEFR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A1: { bg: 'bg-zinc-500/20',    text: 'text-zinc-300',    border: 'border-zinc-500/30' },
  A2: { bg: 'bg-blue-500/20',    text: 'text-blue-300',    border: 'border-blue-500/30' },
  B1: { bg: 'bg-cyan-500/20',    text: 'text-cyan-300',    border: 'border-cyan-500/30' },
  B2: { bg: 'bg-green-500/20',   text: 'text-green-300',   border: 'border-green-500/30' },
  C1: { bg: 'bg-orange-500/20',  text: 'text-orange-300',  border: 'border-orange-500/30' },
  C2: { bg: 'bg-amber-500/20',   text: 'text-amber-300',   border: 'border-amber-500/30' },
};

const RANK_STYLES: Record<number, { ring: string; glow: string; label: string; labelColor: string }> = {
  1: { ring: 'ring-1 ring-amber-400/50',  glow: 'shadow-[0_0_24px_rgba(251,191,36,0.25)]',  label: '🥇', labelColor: 'text-amber-400' },
  2: { ring: 'ring-1 ring-zinc-400/40',   glow: 'shadow-[0_0_16px_rgba(161,161,170,0.15)]', label: '🥈', labelColor: 'text-zinc-300' },
  3: { ring: 'ring-1 ring-orange-700/50', glow: 'shadow-[0_0_16px_rgba(180,83,9,0.2)]',     label: '🥉', labelColor: 'text-orange-600' },
};

const PAGE_SIZE = 20;

const CefrBadge: React.FC<{ level: string }> = ({ level }) => {
  const s = CEFR_COLORS[level] ?? { bg: 'bg-white/10', text: 'text-white/60', border: 'border-white/15' };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
      {level}
    </span>
  );
};

const ScoreDisplay: React.FC<{ score: number | string | null; type: 'score' | 'attempts'; attemptCount: number }> = ({ score, type, attemptCount }) => {
  const num = toNum(score);
  if (type === 'attempts') {
    return <span className="font-black text-white">{attemptCount}</span>;
  }
  return num != null ? (
    <span className="font-black text-white">{num.toFixed(1)}<span className="text-white/30 font-normal text-xs">/75</span></span>
  ) : (
    <span className="text-white/30">—</span>
  );
};

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

  useEffect(() => { setPage(0); }, [type, period]);
  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const top3 = data && page === 0 ? data.entries.slice(0, 3) : [];
  const rest = data ? (page === 0 ? data.entries.slice(3) : data.entries) : [];

  return (
    <div className="relative min-h-screen pt-24 sm:pt-28 md:pt-32 pb-20 overflow-hidden bg-[#050505]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#120e08] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,115,0,0.18),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.10),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="text-center mb-8 sm:mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
            bg-gradient-to-br from-orange-500 to-amber-500
            shadow-[0_12px_40px_rgba(255,115,0,0.45)] mb-5 text-2xl">
            🏆
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            {t('leaderboard.title')}
          </h1>
          <p className="text-white/40 text-sm">{t('leaderboard.subtitle')}</p>
        </div>

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {/* Type filter */}
          <div className="rounded-2xl p-1 bg-white/[0.04] border border-white/10 backdrop-blur-xl flex gap-1">
            {(['score', 'attempts'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setType(v)}
                className={`h-9 px-5 rounded-xl text-sm font-semibold transition-all ${
                  type === v
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_6px_20px_rgba(255,140,0,0.4)]'
                    : 'text-white/50 hover:text-white/80'
                }`}>
                {v === 'score' ? t('leaderboard.score') : t('leaderboard.exams')}
              </button>
            ))}
          </div>

          {/* Period filter */}
          <div className="rounded-2xl p-1 bg-white/[0.04] border border-white/10 backdrop-blur-xl flex gap-1">
            {(['all', 'weekly', 'monthly'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setPeriod(v)}
                className={`h-9 px-4 rounded-xl text-sm font-semibold transition-all ${
                  period === v
                    ? 'bg-sky-500/90 text-white shadow-[0_6px_20px_rgba(56,189,248,0.35)]'
                    : 'text-white/50 hover:text-white/80'
                }`}>
                {v === 'all' ? 'Barcha' : v === 'weekly' ? 'Hafta' : 'Oy'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          /* ── Skeleton ──────────────────────────────────────────────── */
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
            ))}
          </div>
        ) : !data || data.entries.length === 0 ? (
          /* ── Empty ─────────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 text-white/30">
            <span className="text-4xl mb-3">📭</span>
            <p className="text-sm">{t('leaderboard.noLeaderboard')}</p>
          </div>
        ) : (
          <>
            {/* ── Top 3 podium ─────────────────────────────────────────── */}
            {top3.length >= 3 && (
              <div className="mb-4">
                {/* 1st place — full width hero */}
                {(() => {
                  const entry = top3[0];
                  const rs = RANK_STYLES[1];
                  return (
                    <div className={`relative rounded-2xl p-4 sm:p-5 mb-3 bg-white/[0.04] border border-amber-400/20 backdrop-blur-xl ${rs.glow} overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent" />
                      <div className="relative flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center text-xl">
                          {rs.label}
                        </div>
                        {/* Name + CEFR */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-base truncate">{entry.displayName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {entry.cefrLevel && <CefrBadge level={entry.cefrLevel} />}
                            <span className="text-white/30 text-xs">{entry.attemptCount} ta imtihon</span>
                          </div>
                        </div>
                        {/* Score */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-black text-amber-400">
                            {type === 'score'
                              ? toNum(entry.bestScore) != null ? toNum(entry.bestScore)!.toFixed(1) : '—'
                              : entry.attemptCount}
                          </div>
                          <div className="text-white/30 text-xs">{type === 'score' ? '/75' : t('leaderboard.exams')}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2nd & 3rd side by side */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[top3[1], top3[2]].map((entry) => {
                    const rs = RANK_STYLES[entry.rank];
                    const borderColor = entry.rank === 2 ? 'border-zinc-500/25' : 'border-orange-700/25';
                    return (
                      <div key={entry.rank} className={`relative rounded-2xl p-3.5 bg-white/[0.04] border ${borderColor} backdrop-blur-xl ${rs.glow}`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-lg">{rs.label}</span>
                          {entry.cefrLevel && <CefrBadge level={entry.cefrLevel} />}
                        </div>
                        <p className="text-white font-semibold text-sm truncate mb-1">{entry.displayName}</p>
                        <div className="text-lg font-black text-white/80">
                          {type === 'score'
                            ? toNum(entry.bestScore) != null ? toNum(entry.bestScore)!.toFixed(1) : '—'
                            : entry.attemptCount}
                          <span className="text-white/25 text-xs font-normal ml-0.5">{type === 'score' ? '/75' : ''}</span>
                        </div>
                        <div className="text-white/25 text-[11px]">{entry.attemptCount} ta imtihon</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Rest of the list ─────────────────────────────────────── */}
            {rest.length > 0 && (
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl overflow-hidden">
                {/* Column headers */}
                <div className="grid grid-cols-[3rem_1fr_5.5rem_4.5rem] gap-2 px-4 py-2.5 border-b border-white/[0.07]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/25">#</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/25">{t('leaderboard.name')}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/25 text-right">{t('leaderboard.score')}</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/25 text-right">{t('leaderboard.exams')}</span>
                </div>

                <div className="divide-y divide-white/[0.05]">
                  {rest.map((entry) => (
                    <div
                      key={entry.rank}
                      className="grid grid-cols-[3rem_1fr_5.5rem_4.5rem] gap-2 items-center px-4 py-3 hover:bg-white/[0.03] transition-colors">
                      <span className="text-white/35 font-bold text-sm">#{entry.rank}</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-white/80 font-medium text-sm truncate">{entry.displayName}</span>
                        {entry.cefrLevel && <CefrBadge level={entry.cefrLevel} />}
                      </div>
                      <div className="text-right text-sm">
                        <ScoreDisplay score={entry.bestScore} type={type} attemptCount={entry.attemptCount} />
                      </div>
                      <div className="text-right text-white/40 text-sm">{entry.attemptCount}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Pagination ───────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/10 text-white/50
                    hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all
                    flex items-center justify-center text-sm font-bold">
                  ‹
                </button>
                <span className="text-white/30 text-sm px-3">{page + 1} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/10 text-white/50
                    hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all
                    flex items-center justify-center text-sm font-bold">
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
