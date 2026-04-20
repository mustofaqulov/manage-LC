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
  A1: { bg: 'bg-zinc-500/20',   text: 'text-zinc-300',   border: 'border-zinc-500/30' },
  A2: { bg: 'bg-blue-500/20',   text: 'text-blue-300',   border: 'border-blue-500/30' },
  B1: { bg: 'bg-cyan-500/20',   text: 'text-cyan-300',   border: 'border-cyan-500/30' },
  B2: { bg: 'bg-green-500/20',  text: 'text-green-300',  border: 'border-green-500/30' },
  C1: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
  C2: { bg: 'bg-amber-500/20',  text: 'text-amber-300',  border: 'border-amber-500/30' },
};

const toScore = (entry: LeaderboardEntry, type: 'score' | 'attempts') =>
  type === 'score'
    ? toNum(entry.bestScore) != null ? toNum(entry.bestScore)!.toFixed(1) : '—'
    : String(entry.attemptCount);

const scoreUnit = (type: 'score' | 'attempts') => (type === 'score' ? '/75' : 'ta');

const PAGE_SIZE = 20;

const CefrBadge: React.FC<{ level: string; size?: 'sm' | 'md' }> = ({ level, size = 'sm' }) => {
  const s = CEFR_COLORS[level] ?? { bg: 'bg-white/10', text: 'text-white/60', border: 'border-white/15' };
  return (
    <span className={`inline-flex items-center rounded-lg border font-bold ${s.bg} ${s.text} ${s.border} ${
      size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-1.5 py-0.5 text-[10px]'
    }`}>
      {level}
    </span>
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
      const res = await apiClient.get('/leaderboard', { params: { type, period, page, size: PAGE_SIZE } });
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
  const top3 = data && page === 0 && data.entries.length >= 3 ? data.entries.slice(0, 3) : [];
  const rest = data ? (page === 0 && top3.length ? data.entries.slice(3) : data.entries) : [];

  /* podium order: 2nd | 1st | 3rd */
  const podium = top3.length === 3 ? [top3[1], top3[0], top3[2]] : [];

  const PODIUM_CFG = [
    { height: 'h-28 sm:h-32', topPad: 'pt-6',  borderColor: 'border-zinc-500/30',   glowColor: 'shadow-[0_0_30px_rgba(161,161,170,0.12)]', accent: 'text-zinc-300',  medal: '🥈', rankBg: 'bg-zinc-500/15' },
    { height: 'h-40 sm:h-48', topPad: 'pt-6',  borderColor: 'border-amber-400/40',  glowColor: 'shadow-[0_0_50px_rgba(251,191,36,0.2)]',   accent: 'text-amber-300', medal: '🥇', rankBg: 'bg-amber-500/15' },
    { height: 'h-24 sm:h-28', topPad: 'pt-4',  borderColor: 'border-orange-700/30', glowColor: 'shadow-[0_0_24px_rgba(180,83,9,0.15)]',     accent: 'text-orange-400',medal: '🥉', rankBg: 'bg-orange-700/15' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">
      {/* ── Ambient background ─────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0906] via-[#090909] to-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(255,115,0,0.13),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_60%,rgba(59,130,246,0.07),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,rgba(139,92,246,0.07),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20">

        {/* ── Hero header ────────────────────────────────────────────── */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl
            bg-gradient-to-br from-orange-500 to-amber-500
            shadow-[0_16px_50px_rgba(255,115,0,0.5)] mb-5 sm:mb-6 text-3xl sm:text-4xl">
            🏆
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-3">
            {t('leaderboard.title')}
          </h1>
          <p className="text-white/40 text-base sm:text-lg">{t('leaderboard.subtitle')}</p>

          {/* Live dot */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400/70 text-xs font-medium uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* ── Filters ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 justify-center mb-10 sm:mb-14">
          <div className="rounded-2xl p-1 bg-white/[0.04] border border-white/10 backdrop-blur-xl flex gap-1">
            {(['score', 'attempts'] as const).map((v) => (
              <button key={v} onClick={() => setType(v)}
                className={`h-10 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  type === v
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_6px_24px_rgba(255,140,0,0.45)]'
                    : 'text-white/45 hover:text-white/75'
                }`}>
                {v === 'score' ? t('leaderboard.score') : t('leaderboard.exams')}
              </button>
            ))}
          </div>

          <div className="rounded-2xl p-1 bg-white/[0.04] border border-white/10 backdrop-blur-xl flex gap-1">
            {(['all', 'weekly', 'monthly'] as const).map((v) => (
              <button key={v} onClick={() => setPeriod(v)}
                className={`h-10 px-5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  period === v
                    ? 'bg-sky-500/90 text-white shadow-[0_6px_20px_rgba(56,189,248,0.35)]'
                    : 'text-white/45 hover:text-white/75'
                }`}>
                {v === 'all' ? 'Barcha vaqt' : v === 'weekly' ? 'Haftalik' : 'Oylik'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          /* ── Skeleton ────────────────────────────────────────────── */
          <div className="space-y-3 max-w-3xl mx-auto">
            <div className="flex gap-3 mb-8">
              {[1, 0, 2].map((i) => (
                <div key={i} className="flex-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" style={{ height: i === 0 ? 192 : i === 1 ? 128 : 112 }} />
              ))}
            </div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" style={{ opacity: 1 - i * 0.07 }} />
            ))}
          </div>
        ) : !data || data.entries.length === 0 ? (
          /* ── Empty ───────────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-32 text-white/25">
            <span className="text-5xl mb-4">📭</span>
            <p className="text-base">{t('leaderboard.noLeaderboard')}</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

            {/* ── Left: Podium + stats ──────────────────────────────── */}
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">

              {/* Podium */}
              {podium.length === 3 && (
                <div className="mb-6">
                  <p className="text-white/25 text-xs font-bold uppercase tracking-widest text-center mb-6">Top 3</p>

                  {/* Podium bars + avatar area */}
                  <div className="flex items-end justify-center gap-3 mb-0">
                    {podium.map((entry, idx) => {
                      const cfg = PODIUM_CFG[idx];
                      return (
                        <div key={entry.rank} className="flex flex-col items-center gap-2 flex-1">
                          {/* Avatar circle */}
                          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-lg ${cfg.rankBg} border ${cfg.borderColor}`}>
                            {cfg.medal}
                          </div>
                          {/* Name */}
                          <p className="text-white/80 text-xs font-semibold text-center truncate w-full px-1 leading-tight">
                            {entry.displayName}
                          </p>
                          {/* CEFR */}
                          {entry.cefrLevel && <CefrBadge level={entry.cefrLevel} />}
                          {/* Bar */}
                          <div className={`w-full ${cfg.height} ${cfg.borderColor} ${cfg.glowColor}
                            rounded-t-2xl border border-b-0 bg-white/[0.04] backdrop-blur-xl
                            flex flex-col items-center justify-center gap-1 ${cfg.topPad}`}>
                            <span className={`text-xl sm:text-2xl font-black ${cfg.accent}`}>
                              {toScore(entry, type)}
                            </span>
                            <span className="text-white/25 text-[10px]">{scoreUnit(type)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Podium base */}
                  <div className="h-2 rounded-b-xl bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] border-x border-b border-white/[0.08]" />
                </div>
              )}

              {/* Stats card */}
              <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
                <p className="text-white/25 text-[11px] font-bold uppercase tracking-widest mb-3">Statistika</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3 text-center">
                    <div className="text-2xl font-black text-white">{data.total}</div>
                    <div className="text-white/35 text-xs mt-0.5">Ishtirokchi</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-3 text-center">
                    <div className="text-2xl font-black text-orange-400">
                      {data.entries[0] ? toScore(data.entries[0], type) : '—'}
                    </div>
                    <div className="text-white/35 text-xs mt-0.5">Eng yuqori</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Full ranked list ───────────────────────────── */}
            <div className="flex-1 min-w-0">
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl overflow-hidden">

                {/* Table header */}
                <div className="grid grid-cols-[3.5rem_1fr_7rem_5rem] gap-3 px-5 py-3.5 border-b border-white/[0.07] bg-white/[0.02]">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/25">#</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/25">{t('leaderboard.name')}</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/25 text-right">{t('leaderboard.score')}</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/25 text-right">{t('leaderboard.exams')}</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/[0.04]">
                  {(page === 0 ? data.entries : rest).map((entry) => {
                    const isTop = entry.rank <= 3;
                    const rankColors = ['', 'text-amber-400', 'text-zinc-300', 'text-orange-500'];
                    return (
                      <div key={entry.rank}
                        className={`grid grid-cols-[3.5rem_1fr_7rem_5rem] gap-3 items-center px-5 py-4
                          hover:bg-white/[0.03] transition-colors duration-150
                          ${isTop ? 'bg-white/[0.015]' : ''}`}>

                        {/* Rank */}
                        <span className={`font-black text-sm ${isTop ? rankColors[entry.rank] : 'text-white/25'}`}>
                          {isTop ? ['', '🥇', '🥈', '🥉'][entry.rank] : `#${entry.rank}`}
                        </span>

                        {/* Name + badge */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                            <span className="text-white/40 text-xs font-bold">{entry.displayName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className={`font-semibold text-sm truncate ${isTop ? 'text-white' : 'text-white/75'}`}>
                              {entry.displayName}
                            </p>
                            {entry.cefrLevel && (
                              <div className="mt-0.5">
                                <CefrBadge level={entry.cefrLevel} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <span className={`font-black text-base ${isTop ? rankColors[entry.rank] || 'text-white' : 'text-white/70'}`}>
                            {toScore(entry, type)}
                          </span>
                          <span className="text-white/20 text-xs ml-0.5">{type === 'score' ? '/75' : ''}</span>
                        </div>

                        {/* Attempts */}
                        <div className="text-right text-white/35 text-sm">{entry.attemptCount}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-5">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                    className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/10 text-white/50
                      hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed transition-all
                      flex items-center justify-center font-bold text-base">
                    ‹
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                      const p = totalPages <= 7 ? i : i; // simplified
                      return (
                        <button key={i} onClick={() => setPage(i)}
                          className={`h-10 w-10 rounded-xl text-sm font-bold transition-all ${
                            page === i
                              ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_4px_16px_rgba(255,140,0,0.4)]'
                              : 'bg-white/[0.04] border border-white/10 text-white/40 hover:bg-white/[0.08]'
                          }`}>
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/10 text-white/50
                      hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed transition-all
                      flex items-center justify-center font-bold text-base">
                    ›
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
