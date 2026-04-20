import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { apiClient } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

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
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toNum = (v: number | string | null | undefined): number | null =>
  v != null ? parseFloat(String(v)) : null;

const fmtScore = (v: number | string | null | undefined) => {
  const n = toNum(v);
  return n != null ? n.toFixed(1) : '—';
};

const PAGE_SIZE = 20;

// ─── Constants ────────────────────────────────────────────────────────────────

const CEFR: Record<string, { pill: string; dot: string }> = {
  A1: { pill: 'bg-slate-500/25 text-slate-300 border-slate-500/30',   dot: 'bg-slate-400' },
  A2: { pill: 'bg-blue-500/20 text-blue-300 border-blue-500/25',      dot: 'bg-blue-400' },
  B1: { pill: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/25',      dot: 'bg-cyan-400' },
  B2: { pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25', dot: 'bg-emerald-400' },
  C1: { pill: 'bg-orange-500/20 text-orange-300 border-orange-500/25', dot: 'bg-orange-400' },
  C2: { pill: 'bg-amber-500/20 text-amber-300 border-amber-500/25',   dot: 'bg-amber-400' },
};

const AVATAR_GRADIENTS = [
  'from-orange-500 to-rose-500',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-blue-600',
  'from-green-500 to-emerald-600',
];

const avatarGradient = (name: string) =>
  AVATAR_GRADIENTS[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_GRADIENTS.length];

// ─── Sub-components ───────────────────────────────────────────────────────────

const CefrPill: React.FC<{ level: string }> = ({ level }) => {
  const s = CEFR[level] ?? { pill: 'bg-white/10 text-white/50 border-white/15', dot: 'bg-white/40' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {level}
    </span>
  );
};

const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 36 }) => (
  <div
    style={{ width: size, height: size }}
    className={`rounded-xl flex-shrink-0 flex items-center justify-center
      bg-gradient-to-br ${avatarGradient(name)} text-white font-black`}
  >
    <span style={{ fontSize: size * 0.38 }}>{name.charAt(0).toUpperCase()}</span>
  </div>
);

const ScoreBar: React.FC<{ score: number | string | null; max?: number }> = ({ score, max = 75 }) => {
  const n = toNum(score);
  const pct = n != null ? Math.min(100, (n / max) * 100) : 0;
  return (
    <div className="w-full h-1 rounded-full bg-white/[0.07] overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// Crown SVG for 1st place
const Crown: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 24 16" fill="none" className={className}>
    <path d="M2 14 L2 16 L22 16 L22 14 Z" fill="currentColor" opacity="0.6" />
    <path d="M2 14 L5 4 L10 10 L12 2 L14 10 L19 4 L22 14 Z" fill="currentColor" />
    <circle cx="2" cy="4" r="2" fill="currentColor" />
    <circle cx="12" cy="2" r="2" fill="currentColor" />
    <circle cx="22" cy="4" r="2" fill="currentColor" />
  </svg>
);

// ─── Podium Card ──────────────────────────────────────────────────────────────

const PodiumCard: React.FC<{
  entry: LeaderboardEntry;
  pos: 1 | 2 | 3;
  type: 'score' | 'attempts';
}> = ({ entry, pos, type }) => {
  const cfg = {
    1: {
      barH: 'h-36 sm:h-44',
      border: 'border-amber-400/35',
      glow: '0 0 60px rgba(251,191,36,0.18), 0 0 120px rgba(251,191,36,0.08)',
      accent: 'text-amber-300',
      accentBg: 'from-amber-500/20 to-amber-600/5',
      ring: 'ring-1 ring-amber-400/30',
      crownColor: 'text-amber-400',
      label: '#1',
    },
    2: {
      barH: 'h-28 sm:h-32',
      border: 'border-slate-400/25',
      glow: '0 0 40px rgba(148,163,184,0.10)',
      accent: 'text-slate-300',
      accentBg: 'from-slate-500/15 to-transparent',
      ring: 'ring-1 ring-slate-400/20',
      crownColor: '',
      label: '#2',
    },
    3: {
      barH: 'h-24 sm:h-28',
      border: 'border-orange-700/30',
      glow: '0 0 40px rgba(194,65,12,0.12)',
      accent: 'text-orange-500',
      accentBg: 'from-orange-700/15 to-transparent',
      ring: 'ring-1 ring-orange-700/25',
      crownColor: '',
      label: '#3',
    },
  }[pos];

  const score = type === 'score' ? fmtScore(entry.bestScore) : String(entry.attemptCount);
  const unit  = type === 'score' ? '/75' : 'ta';

  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
      {/* Crown for 1st */}
      {pos === 1 ? (
        <Crown className={`w-8 h-5 sm:w-10 sm:h-6 ${cfg.crownColor} drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]`} />
      ) : (
        <div className="h-5 sm:h-6" />
      )}

      {/* Avatar */}
      <div className={`relative ${pos === 1 ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-11 h-11 sm:w-13 sm:h-13'}`}>
        <div
          className={`w-full h-full rounded-2xl bg-gradient-to-br ${avatarGradient(entry.displayName)}
            flex items-center justify-center text-white font-black
            ${cfg.ring} ${pos === 1 ? 'shadow-[0_0_30px_rgba(251,191,36,0.25)]' : ''}`}
          style={{ fontSize: pos === 1 ? 22 : 17 }}
        >
          {entry.displayName.charAt(0).toUpperCase()}
        </div>
        {/* rank badge */}
        <div className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-md
          ${pos === 1 ? 'bg-amber-400 text-black' : pos === 2 ? 'bg-slate-400 text-black' : 'bg-orange-700 text-white'}
          text-[9px] font-black flex items-center justify-center`}>
          {pos}
        </div>
      </div>

      {/* Name */}
      <div className="text-center w-full px-1">
        <p className={`text-white font-bold truncate ${pos === 1 ? 'text-sm' : 'text-xs'}`}>
          {entry.displayName}
        </p>
        {entry.cefrLevel && (
          <div className="flex justify-center mt-1">
            <CefrPill level={entry.cefrLevel} />
          </div>
        )}
      </div>

      {/* Bar */}
      <div
        className={`w-full ${cfg.barH} rounded-t-2xl ${cfg.border} bg-gradient-to-b ${cfg.accentBg}
          border border-b-0 backdrop-blur-xl flex flex-col items-center justify-center gap-1`}
        style={{ boxShadow: cfg.glow }}
      >
        <span className={`font-black ${pos === 1 ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'} ${cfg.accent}`}>
          {score}
        </span>
        <span className="text-white/25 text-[10px]">{unit}</span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  const [data,   setData]   = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [type,   setType]   = useState<'score' | 'attempts'>('score');
  const [period, setPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [page,   setPage]   = useState(0);

  const fetch_ = useCallback(async () => {
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
  useEffect(() => { fetch_(); }, [fetch_]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const entries    = data?.entries ?? [];
  const top3       = page === 0 && entries.length >= 3 ? entries.slice(0, 3) : [];
  const rows       = page === 0 && top3.length ? entries.slice(3) : entries;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060606]">

      {/* ── Background ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_0%,rgba(255,100,0,0.11),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(99,102,241,0.07),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px]" />
      {/* top glow streak */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-24">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="text-center mb-10 sm:mb-12">
          {/* trophy + glow */}
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 blur-2xl bg-orange-500/30 rounded-full scale-150" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl
              bg-gradient-to-br from-orange-500 to-amber-500
              shadow-[0_16px_48px_rgba(255,115,0,0.55)]
              flex items-center justify-center text-3xl sm:text-4xl">
              🏆
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-3">
            {t('leaderboard.title')}
          </h1>
          <p className="text-white/40 text-sm sm:text-base mb-5">{t('leaderboard.subtitle')}</p>

          {/* live + total */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full
            bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm">
            <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
            {data && (
              <>
                <span className="w-px h-3 bg-white/15" />
                <span className="text-xs text-white/40">{data.total} ta ishtirokchi</span>
              </>
            )}
          </div>
        </div>

        {/* ── Filters ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 justify-center mb-10 sm:mb-12">
          {/* Type */}
          <div className="flex p-1 gap-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
            {(['score', 'attempts'] as const).map((v) => (
              <button key={v} onClick={() => setType(v)}
                className={`h-9 px-5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  type === v
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_4px_20px_rgba(255,140,0,0.5)]'
                    : 'text-white/40 hover:text-white/70'
                }`}>
                {v === 'score' ? t('leaderboard.score') : t('leaderboard.exams')}
              </button>
            ))}
          </div>

          {/* Period */}
          <div className="flex p-1 gap-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
            {(['all', 'weekly', 'monthly'] as const).map((v) => (
              <button key={v} onClick={() => setPeriod(v)}
                className={`h-9 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  period === v
                    ? 'bg-sky-500 text-white shadow-[0_4px_16px_rgba(56,189,248,0.4)]'
                    : 'text-white/40 hover:text-white/70'
                }`}>
                {v === 'all' ? 'Barcha' : v === 'weekly' ? 'Haftalik' : 'Oylik'}
              </button>
            ))}
          </div>
        </div>

        {/* ── States ────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-2.5 max-w-2xl mx-auto">
            {/* podium skeleton */}
            <div className="flex items-end gap-3 h-52 mb-6">
              {[0.7, 1, 0.6].map((h, i) => (
                <div key={i} className="flex-1 rounded-2xl bg-white/[0.04] border border-white/[0.06] animate-pulse"
                  style={{ height: `${h * 100}%` }} />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[60px] rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse"
                style={{ opacity: 1 - i * 0.09 }} />
            ))}
          </div>
        ) : !data || entries.length === 0 ? (
          <div className="flex flex-col items-center py-32 text-white/20 gap-3">
            <span className="text-5xl">📭</span>
            <p className="text-sm">{t('leaderboard.noLeaderboard')}</p>
          </div>
        ) : (
          <>
            {/* ── Podium ──────────────────────────────────────────────── */}
            {top3.length === 3 && (
              <div className="max-w-lg mx-auto mb-10">
                {/* 3 cards: order 2 | 1 | 3 */}
                <div className="flex items-end gap-3 sm:gap-4">
                  <PodiumCard entry={top3[1]} pos={2} type={type} />
                  <PodiumCard entry={top3[0]} pos={1} type={type} />
                  <PodiumCard entry={top3[2]} pos={3} type={type} />
                </div>
                {/* stage base */}
                <div className="h-3 rounded-b-2xl bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02]
                  border border-t-0 border-white/[0.07]" />
              </div>
            )}

            {/* ── Table ───────────────────────────────────────────────── */}
            {rows.length > 0 && (
              <div className="rounded-2xl overflow-hidden border border-white/[0.07] backdrop-blur-xl bg-white/[0.02]">

                {/* header */}
                <div className="grid grid-cols-[2.5rem_1fr_8rem_4.5rem] sm:grid-cols-[3rem_1fr_9rem_5rem]
                  gap-3 px-4 sm:px-5 py-3 bg-white/[0.03] border-b border-white/[0.07]">
                  {['#', t('leaderboard.name'), t('leaderboard.score'), t('leaderboard.exams')].map((h, i) => (
                    <span key={i}
                      className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/25
                        ${i >= 2 ? 'text-right' : ''}`}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* rows */}
                <div className="divide-y divide-white/[0.04]">
                  {rows.map((entry, idx) => (
                    <div key={entry.rank}
                      className="grid grid-cols-[2.5rem_1fr_8rem_4.5rem] sm:grid-cols-[3rem_1fr_9rem_5rem]
                        gap-3 items-center px-4 sm:px-5 py-3.5
                        hover:bg-white/[0.025] transition-colors duration-150 group"
                      style={{ opacity: Math.max(0.45, 1 - idx * 0.028) }}>

                      {/* Rank */}
                      <span className="text-white/30 text-sm font-bold tabular-nums">
                        #{entry.rank}
                      </span>

                      {/* User */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={entry.displayName} size={34} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-white/80 font-semibold text-sm truncate group-hover:text-white transition-colors">
                              {entry.displayName}
                            </p>
                            {entry.cefrLevel && <CefrPill level={entry.cefrLevel} />}
                          </div>
                          {type === 'score' && (
                            <div className="mt-1.5 w-24">
                              <ScoreBar score={entry.bestScore} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <span className="text-white/75 font-black text-base tabular-nums">
                          {type === 'score' ? fmtScore(entry.bestScore) : entry.attemptCount}
                        </span>
                        <span className="text-white/20 text-xs ml-0.5">
                          {type === 'score' ? '/75' : 'ta'}
                        </span>
                      </div>

                      {/* Attempts */}
                      <div className="text-right text-white/30 text-sm tabular-nums">
                        {entry.attemptCount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Pagination ──────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.08]
                    text-white/40 hover:text-white/80 hover:bg-white/[0.08]
                    disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center font-bold">
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`h-10 w-10 rounded-xl text-sm font-bold transition-all ${
                      page === i
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_4px_16px_rgba(255,140,0,0.45)]'
                        : 'bg-white/[0.04] border border-white/[0.08] text-white/35 hover:bg-white/[0.08] hover:text-white/70'
                    }`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="h-10 w-10 rounded-xl bg-white/[0.04] border border-white/[0.08]
                    text-white/40 hover:text-white/80 hover:bg-white/[0.08]
                    disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center font-bold">
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
