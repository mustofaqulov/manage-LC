import React, { useMemo, useState } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useGetAttemptHistory, useGetAttempt } from '../services/hooks';
import type { AttemptListResponse, AttemptStatus } from '../api/types';
import ScoreChart from '../components/ScoreChart';
import { showToast } from '../utils/configs/toastConfig';
import * as queries from '../services/queries';
import { combineAudioToMp3, downloadMp3 } from '../utils/audioConverter';
import { getRecordingsForAttempt } from '../utils/audioStore';

const STATUS_STYLES: Record<AttemptStatus, { bg: string; text: string; label: string }> = {
  IN_PROGRESS: { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-400', label: 'Jarayonda' },
  SUBMITTED: { bg: 'from-amber-500 to-orange-500', text: 'text-amber-400', label: 'Topshirilgan' },
  SCORING: { bg: 'from-purple-500 to-fuchsia-500', text: 'text-purple-400', label: 'Baholanmoqda' },
  SCORED: { bg: 'from-green-500 to-emerald-500', text: 'text-green-400', label: 'Baholangan' },
  CANCELLED: { bg: 'from-gray-500 to-gray-600', text: 'text-gray-400', label: 'Bekor qilingan' },
  EXPIRED: { bg: 'from-red-500 to-rose-500', text: 'text-red-400', label: 'Muddati tugagan' },
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

// Expandable detail row
const AttemptDetail: React.FC<{ attemptId: string }> = ({ attemptId }) => {
  const { data: detail, isLoading } = useGetAttempt(attemptId);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAudio = async () => {
    if (!detail || isDownloading) return;
    setIsDownloading(true);
    try {
      // 1. Avval IndexedDB'dan qidirish (backend'siz, tez)
      const stored = await getRecordingsForAttempt(attemptId);
      let audioBlobs: Blob[] = stored.map((r) => r.blob).filter((b) => b.size > 0);

      // 2. IndexedDB bo'sh bo'lsa — S3'dan yuklab olish
      if (audioBlobs.length === 0) {
        showToast.info('Audio yuklanmoqda...');
        const audioResponses = (detail.responses ?? []).filter(
          (r) => r.answer && typeof r.answer === 'object' && 'audio' in r.answer && (r.answer as any).audio
        );
        for (const response of audioResponses) {
          const audioData = (response.answer as any).audio;
          try {
            if (audioData.assetId) {
              const { downloadUrl } = await queries.getDownloadUrl(audioData.assetId);
              const res = await fetch(downloadUrl);
              audioBlobs.push(await res.blob());
            } else if (audioData.bucket && audioData.key) {
              const { downloadUrl } = await queries.presignDownload({ bucket: audioData.bucket, s3Key: audioData.key });
              const res = await fetch(downloadUrl);
              audioBlobs.push(await res.blob());
            }
          } catch {
            // bitta fayl yuklanmasa o'tkazib yuboramiz
          }
        }
      }

      if (audioBlobs.length === 0) {
        showToast.warning('Audio topilmadi');
        return;
      }

      showToast.info('MP3 tayyorlanmoqda...');
      const combinedMp3 = await combineAudioToMp3(audioBlobs);
      const timestamp = new Date(detail.startedAt).toISOString().slice(0, 10);
      const filename = `exam-${detail.testTitle?.replace(/\s+/g, '-') || 'recording'}-${timestamp}.mp3`;
      downloadMp3(combinedMp3, filename);
      showToast.success('Audio muvaffaqiyatli yuklab olindi');
    } catch (error) {
      console.error('Audio download failed:', error);
      showToast.error('Audio yuklab olishda xatolik yuz berdi');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!detail) {
    return <p className="text-white/40 text-sm py-4 text-center">Ma'lumot yuklanmadi</p>;
  }

  const sections = detail.sections ?? [];
  const responses = detail.responses ?? [];

  return (
    <div className="space-y-5 py-2">
      {/* Summary row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {detail.estimatedCefrLevel && (
            <span className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
              CEFR {detail.estimatedCefrLevel}
            </span>
          )}
          {detail.totalScore != null && detail.maxTotalScore != null && (
            <span className="text-white/50 text-xs">
              Ball: {Math.round(detail.totalScore)} / {Math.round(detail.maxTotalScore)}
            </span>
          )}
        </div>

        {responses.some((r) => r.answer && typeof r.answer === 'object' && 'audio' in r.answer) && (
          <button
            type="button"
            onClick={handleDownloadAudio}
            disabled={isDownloading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            {isDownloading ? 'Converting...' : 'Download Audio (MP3)'}
          </button>
        )}
      </div>

      {/* AI Summary */}
      {detail.aiSummary && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">AI Tahlil</p>
          <p className="text-white/70 text-sm leading-relaxed">{detail.aiSummary}</p>
        </div>
      )}

      {/* Sections */}
      {sections.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Bo'limlar</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sections.map((sec) => {
              const pct =
                sec.sectionScore != null && sec.maxSectionScore && sec.maxSectionScore > 0
                  ? Math.round((sec.sectionScore / sec.maxSectionScore) * 100)
                  : null;
              return (
                <div
                  key={sec.id}
                  className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white text-sm font-semibold truncate">{sec.sectionTitle}</h4>
                    {pct !== null && (
                      <span className={`text-sm font-black ${pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {pct}%
                      </span>
                    )}
                  </div>
                  <span className="text-white/30 text-xs capitalize">{sec.skill.toLowerCase()}</span>
                  {/* Score bar */}
                  {pct !== null && (
                    <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                  {sec.aiFeedback && (
                    <p className="text-white/50 text-xs mt-3 leading-relaxed">{sec.aiFeedback}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rubric scores from responses */}
      {responses.some((r) => r.rubricScores && r.rubricScores.length > 0) && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Batafsil baholash</p>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-xs font-bold text-white/40 uppercase">Mezon</th>
                  <th className="px-4 py-3 text-xs font-bold text-white/40 uppercase text-right">Ball</th>
                  <th className="px-4 py-3 text-xs font-bold text-white/40 uppercase hidden sm:table-cell">Fikr</th>
                </tr>
              </thead>
              <tbody>
                {responses.flatMap((r) =>
                  (r.rubricScores ?? []).map((rs) => (
                    <tr key={`${r.id}-${rs.criterionId}`} className="border-b border-white/[0.03]">
                      <td className="px-4 py-3 text-white/70 text-sm font-medium">{rs.criterionName}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-white font-bold text-sm">{Math.round(rs.score)}</span>
                        <span className="text-white/30 text-xs">/{Math.round(rs.maxScore)}</span>
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs hidden sm:table-cell">
                        {rs.feedback || '—'}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const History: React.FC = () => {
  const { t } = useTranslation();
  const { data: historyData, isLoading, isError } = useGetAttemptHistory({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const attempts: AttemptListResponse[] = historyData?.items ?? [];

  const stats = useMemo(() => {
    const scoredAttempts = attempts.filter(
      (a) => a.status === 'SCORED' && a.scorePercentage != null,
    );
    const totalExams = attempts.length;
    const avgScore =
      scoredAttempts.length > 0
        ? Math.round(
            scoredAttempts.reduce((sum, a) => sum + (a.scorePercentage ?? 0), 0) /
              scoredAttempts.length,
          )
        : 0;
    const bestScore =
      scoredAttempts.length > 0
        ? Math.round(Math.max(...scoredAttempts.map((a) => a.scorePercentage ?? 0)))
        : 0;

    return { totalExams, avgScore, bestScore };
  }, [attempts]);

  // Chart data — scored attempts sorted by date
  const chartData = useMemo(() => {
    return attempts
      .filter((a) => a.status === 'SCORED' && a.scorePercentage != null)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
      .map((a) => ({ date: a.startedAt, score: a.scorePercentage! }));
  }, [attempts]);

  // Delta map: attemptId → delta from previous scored attempt
  const deltaMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    const sorted = [...attempts]
      .filter((a) => a.status === 'SCORED' && a.scorePercentage != null)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) {
        map[sorted[i].id] = null;
      } else {
        map[sorted[i].id] = Math.round(
          (sorted[i].scorePercentage ?? 0) - (sorted[i - 1].scorePercentage ?? 0),
        );
      }
    }
    return map;
  }, [attempts]);

  return (
    <div className="relative min-h-screen py-24 sm:py-28 md:py-36 px-6 md:px-12 overflow-hidden bg-[#050505]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#120e08] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,115,0,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 max-w-6xl mx-auto text-white">
        {/* Header */}
        <div className="mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3">
            {t('history.title')} <span className="text-orange-400"></span>
          </h1>
          <p className="text-white/60 text-lg">{t('history.subtitle')}</p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
            <p className="text-white/50 text-sm">Yuklanmoqda...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg mb-4">Tarixni yuklashda xatolik yuz berdi</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition">
              Qaytadan urinish
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Total Exams */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-white/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:-translate-y-2 transition">
                  <p className="text-white/50 text-xs font-bold uppercase mb-2">
                    {t('history.totalExams')}
                  </p>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-black">{stats.totalExams}</p>
                </div>
              </div>

              {/* Avg Score */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/40 to-amber-400/40 rounded-3xl blur-xl" />
                <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-8 shadow-[0_20px_70px_rgba(255,115,0,0.45)] hover:-translate-y-2 transition">
                  <p className="text-orange-100 text-xs font-bold uppercase mb-2">
                    {t('history.avgScore')}
                  </p>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                    {stats.avgScore > 0 ? `${stats.avgScore}%` : '—'}
                  </p>
                </div>
              </div>

              {/* Best Score */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-green-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:-translate-y-2 transition">
                  <p className="text-white/50 text-xs font-bold uppercase mb-2">
                    {t('history.bestScore')}
                  </p>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-black text-green-400">
                    {stats.bestScore > 0 ? `${stats.bestScore}%` : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Score Trend Chart */}
            {chartData.length >= 2 && (
              <div className="mb-10">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">
                  Natijalar dinamikasi
                </h3>
                <ScoreChart data={chartData} />
              </div>
            )}

            {/* Empty state */}
            {attempts.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-white/60 text-lg mb-2">Hali imtihon topshirmagansiz</p>
                <p className="text-white/40 text-sm">Test topshirib, natijalaringizni bu yerda ko'ring</p>
              </div>
            )}

            {/* History Table */}
            {attempts.length > 0 && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-amber-400/20 blur-xl rounded-3xl opacity-40" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-white/5">
                    {attempts.map((item) => {
                      const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.SUBMITTED;
                      const delta = deltaMap[item.id];
                      const isExpanded = expandedId === item.id;

                      return (
                        <div key={item.id} className="p-4">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className="w-full text-left">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-white/40 text-xs">{formatDate(item.startedAt)}</p>
                                <p className="text-white font-semibold text-sm truncate">
                                  {item.testTitle}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold">
                                    {item.cefrLevel}
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase bg-gradient-to-r ${statusStyle.bg}`}>
                                    {statusStyle.label}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-black text-white">
                                  {item.scorePercentage != null
                                    ? `${Math.round(item.scorePercentage)}%`
                                    : 'â€”'}
                                </span>
                                {delta !== null && delta !== undefined && delta !== 0 && (
                                  <div
                                    className={`mt-1 inline-flex items-center gap-0.5 text-[10px] font-bold ${
                                      delta > 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    <svg
                                      className={`w-3 h-3 ${delta < 0 ? 'rotate-180' : ''}`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {delta > 0 ? '+' : ''}{delta}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                              <AttemptDetail attemptId={item.id} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop table */}
                  <table className="hidden md:table w-full text-left">
                    <thead className="bg-white/5">
                      <tr>
                        {[t('history.date'), 'Test', 'Level', 'Status', t('history.score')].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-6 md:px-8 py-5 text-xs font-black uppercase tracking-wider text-white/60">
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((item) => {
                        const statusStyle =
                          STATUS_STYLES[item.status] || STATUS_STYLES.SUBMITTED;
                        const delta = deltaMap[item.id];
                        const isExpanded = expandedId === item.id;

                        return (
                          <React.Fragment key={item.id}>
                            <tr
                              onClick={() => setExpandedId(isExpanded ? null : item.id)}
                              className={`border-b border-white/5 cursor-pointer transition ${
                                isExpanded ? 'bg-white/5' : 'hover:bg-white/[0.03]'
                              }`}>
                              <td className="px-6 md:px-8 py-6 font-semibold text-sm">
                                {formatDate(item.startedAt)}
                              </td>
                              <td className="px-6 md:px-8 py-6 font-semibold text-sm max-w-[200px] truncate">
                                {item.testTitle}
                              </td>
                              <td className="px-6 md:px-8 py-6">
                                <span className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
                                  {item.cefrLevel}
                                </span>
                              </td>
                              <td className="px-6 md:px-8 py-6">
                                <span
                                  className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase bg-gradient-to-r ${statusStyle.bg}`}>
                                  {statusStyle.label}
                                </span>
                              </td>
                              <td className="px-6 md:px-8 py-6">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-black">
                                    {item.scorePercentage != null
                                      ? `${Math.round(item.scorePercentage)}%`
                                      : '—'}
                                  </span>
                                  {/* Delta arrow */}
                                  {delta !== null && delta !== undefined && delta !== 0 && (
                                    <span
                                      className={`flex items-center gap-0.5 text-xs font-bold ${
                                        delta > 0 ? 'text-green-400' : 'text-red-400'
                                      }`}>
                                      <svg
                                        className={`w-3 h-3 ${delta < 0 ? 'rotate-180' : ''}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20">
                                        <path
                                          fillRule="evenodd"
                                          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      {delta > 0 ? '+' : ''}{delta}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* Expandable detail */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={5} className="px-6 md:px-8 pb-6 bg-white/[0.02]">
                                  <AttemptDetail attemptId={item.id} />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;

