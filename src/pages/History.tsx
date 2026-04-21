import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/useTranslation';
import { useGetAttemptHistory, useGetAttempt, useGetSpeakingAnalysis } from '../services/hooks';
import type { AttemptListResponse, AttemptStatus } from '../api/types';
import ScoreChart from '../components/ScoreChart';
import { showToast } from '../utils/configs/toastConfig';
import * as mutations from '../services/mutations';
import { combineAudioToMp3, downloadMp3 } from '../utils/audioConverter';
import { getRecordingsForAttempt } from '../utils/audioStore';
import { generateAttemptPdf } from '../utils/pdfGenerator';

// ── Constants ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;


const STATUS_STYLES: Record<AttemptStatus | string, { dot: string; bg: string; text: string; label: string }> = {
  IN_PROGRESS: { dot: 'bg-amber-400',  bg: 'bg-amber-400/10 border-amber-400/20',  text: 'text-amber-400',  label: 'Jarayonda' },
  SUBMITTED:   { dot: 'bg-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',    text: 'text-blue-400',   label: 'Topshirilgan' },
  SCORING:     { dot: 'bg-purple-400', bg: 'bg-purple-400/10 border-purple-400/20', text: 'text-purple-400', label: 'Baholanmoqda' },
  SCORED:      { dot: 'bg-green-400',  bg: 'bg-green-400/10 border-green-400/20',  text: 'text-green-400',  label: 'Baholangan' },
  COMPLETED:   { dot: 'bg-green-400',  bg: 'bg-green-400/10 border-green-400/20',  text: 'text-green-400',  label: 'Tugallangan' },
  FAILED:      { dot: 'bg-red-400',    bg: 'bg-red-400/10 border-red-400/20',      text: 'text-red-400',    label: 'Muvaffaqiyatsiz' },
  CANCELLED:   { dot: 'bg-zinc-500',   bg: 'bg-zinc-500/10 border-zinc-500/20',    text: 'text-zinc-400',   label: 'Bekor qilingan' },
  EXPIRED:     { dot: 'bg-red-500',    bg: 'bg-red-500/10 border-red-500/20',      text: 'text-red-400',    label: 'Muddati tugagan' },
};

const SOURCE_LABELS: Record<string, string> = {
  TEST: "To'liq",
  RANDOM_SECTIONS: "Tasodifiy",
  CUSTOM: "Maxsus",
};

// ── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string | null | undefined, short = false): string => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('uz-UZ', short
      ? { day: 'numeric', month: 'short', year: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    );
  } catch {
    return dateStr;
  }
};

const formatDuration = (startedAt: string, submittedAt: string | null): string => {
  if (!submittedAt) return '—';
  const ms = new Date(submittedAt).getTime() - new Date(startedAt).getTime();
  if (ms < 0) return '—';
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return min > 0 ? `${min} daq ${sec} sek` : `${sec} sek`;
};

const scoreToLevel = (pct: number | null | undefined): { label: string; color: string } | null => {
  if (pct == null || isNaN(Number(pct))) return null;
  const p = Math.round(Number(pct));
  if (p <= 37) return { label: 'A2', color: 'text-blue-400' };
  if (p <= 50) return { label: 'B1', color: 'text-cyan-400' };
  if (p <= 64) return { label: 'B2', color: 'text-green-400' };
  if (p <= 75) return { label: 'C1', color: 'text-orange-400' };
  return { label: 'C1+', color: 'text-amber-300' };
};

// ── ResponseAudioCard ────────────────────────────────────────────────────────

const ResponseAudioCard: React.FC<{
  response: any;
  index: number;
  attemptId: string;
  indexedBlob: Blob | null;
}> = ({ response, index, attemptId, indexedBlob }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const urlRef = useRef<string | null>(null);

  // IndexedDB blob → object URL
  useEffect(() => {
    if (indexedBlob && indexedBlob.size > 0) {
      const url = URL.createObjectURL(indexedBlob);
      urlRef.current = url;
      setAudioUrl(url);
      return () => { URL.revokeObjectURL(url); urlRef.current = null; };
    }
  }, [indexedBlob]);

  const audioData = response?.answer?.audio ?? null;

  const loadFromS3 = async () => {
    if (!audioData || isLoading) return;
    setIsLoading(true);
    try {
      let downloadUrl: string | null = null;
      if (audioData.bucket && audioData.key) {
        const result = await mutations.presignDownload({ bucket: audioData.bucket, s3Key: audioData.key });
        downloadUrl = result.downloadUrl;
      } else if (audioData.assetId) {
        try {
          const result = await mutations.presignDownload({ assetId: audioData.assetId });
          downloadUrl = result.downloadUrl;
        } catch {
          if (audioData.bucket && audioData.key) {
            const result = await mutations.presignDownload({ bucket: audioData.bucket, s3Key: audioData.key });
            downloadUrl = result.downloadUrl;
          }
        }
      }
      if (downloadUrl) {
        const res = await fetch(downloadUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setAudioUrl(url);
      } else {
        showToast.warning('Audio topilmadi');
      }
    } catch {
      showToast.error('Audio yuklab olishda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadMp3 = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      let blob: Blob | null = indexedBlob && indexedBlob.size > 0 ? indexedBlob : null;
      if (!blob && audioData) {
        let downloadUrl: string | null = null;
        if (audioData.bucket && audioData.key) {
          const result = await mutations.presignDownload({ bucket: audioData.bucket, s3Key: audioData.key });
          downloadUrl = result.downloadUrl;
        } else if (audioData.assetId) {
          const result = await mutations.presignDownload({ assetId: audioData.assetId });
          downloadUrl = result.downloadUrl;
        }
        if (downloadUrl) {
          const res = await fetch(downloadUrl);
          blob = await res.blob();
        }
      }
      if (!blob) { showToast.warning('Audio topilmadi'); return; }
      const mp3 = await combineAudioToMp3([blob]);
      downloadMp3(mp3, `question-${index + 1}-${attemptId.slice(0, 8)}.mp3`);
    } catch {
      showToast.error('MP3 yuklab olishda xatolik');
    } finally {
      setIsDownloading(false);
    }
  };

  const hasAudioData = !!indexedBlob || !!audioData;
  if (!hasAudioData) return null;

  const aiSummary = response?.aiSummary;

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-white/45 text-[10px] font-bold uppercase tracking-widest">Savol {index + 1}</span>
        <div className="flex items-center gap-1.5">
          {/* Load from S3 if no local blob and no URL yet */}
          {!indexedBlob && !audioUrl && audioData && (
            <button
              onClick={loadFromS3}
              disabled={isLoading}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white/80 text-[10px] font-bold transition disabled:opacity-40 flex items-center gap-1">
              {isLoading ? (
                <span className="w-3 h-3 border border-white/30 border-t-white/70 rounded-full animate-spin inline-block" />
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {isLoading ? 'Yuklanmoqda...' : 'Tinglash'}
            </button>
          )}
          <button
            onClick={handleDownloadMp3}
            disabled={isDownloading}
            className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 text-[10px] font-bold transition disabled:opacity-40 flex items-center gap-1">
            {isDownloading ? (
              <span className="w-3 h-3 border border-orange-400/30 border-t-orange-400 rounded-full animate-spin inline-block" />
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            )}
            {isDownloading ? 'Tayyorlanmoqda...' : 'MP3'}
          </button>
        </div>
      </div>

      {/* Audio player */}
      {audioUrl && (
        <audio
          controls
          src={audioUrl}
          className="w-full h-8"
          style={{ filter: 'invert(0.85) hue-rotate(185deg) saturate(0.7)', borderRadius: '8px' }}
        />
      )}

      {/* AI feedback */}
      {aiSummary && (
        <p className="text-white/45 text-xs leading-relaxed border-t border-white/5 pt-2">{aiSummary}</p>
      )}
    </div>
  );
};

// ── AttemptDetail (expandable inner content) ────────────────────────────────

const AttemptDetail: React.FC<{ attemptId: string; status: AttemptStatus }> = ({ attemptId, status }) => {
  const shouldLiveRefetch = status === 'SUBMITTED' || status === 'SCORING';
  const { data: detail, isLoading } = useGetAttempt(attemptId, {
    refetchInterval: shouldLiveRefetch ? 3000 : false,
    refetchIntervalInBackground: true,
  });
  const { data: analysis } = useGetSpeakingAnalysis(attemptId, { enabled: status === 'SCORED' });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [indexedBlobs, setIndexedBlobs] = useState<(Blob | null)[]>([]);

  useEffect(() => {
    getRecordingsForAttempt(attemptId).then((recs) => {
      const map: Record<number, Blob> = {};
      recs.forEach((r) => { map[r.index ?? 0] = r.blob; });
      if (detail?.responses) {
        setIndexedBlobs(detail.responses.map((_, i) => map[i] ?? null));
      }
    }).catch(() => {});
  }, [attemptId, detail?.responses]);

  const handleDownloadAudio = async () => {
    if (!detail || isDownloading) return;
    setIsDownloading(true);
    try {
      const stored = await getRecordingsForAttempt(attemptId);
      let audioBlobs: Blob[] = stored.map((r) => r.blob).filter((b) => b.size > 0);

      if (audioBlobs.length === 0) {
        showToast.info('Audio yuklanmoqda...');
        const audioResponses = (detail.responses ?? []).filter(
          (r) => r.answer && typeof r.answer === 'object' && 'audio' in r.answer && (r.answer as any).audio,
        );
        for (const response of audioResponses) {
          const audioData = (response.answer as any).audio;
          try {
            let downloadUrl: string | null = null;
            if (audioData.bucket && audioData.key) {
              const result = await mutations.presignDownload({ bucket: audioData.bucket, s3Key: audioData.key });
              downloadUrl = result.downloadUrl;
            } else if (audioData.assetId) {
              const result = await mutations.presignDownload({ assetId: audioData.assetId });
              downloadUrl = result.downloadUrl;
            }
            if (downloadUrl) {
              const res = await fetch(downloadUrl);
              audioBlobs.push(await res.blob());
            }
          } catch { /* bitta fayl yuklanmasa o'tkazib yuboramiz */ }
        }
      }

      if (audioBlobs.length === 0) { showToast.warning('Audio topilmadi'); return; }

      showToast.info('Audio tayyorlanmoqda...');
      const combined = await combineAudioToMp3(audioBlobs);
      const timestamp = new Date(detail.startedAt).toISOString().slice(0, 10);
      downloadMp3(combined, `exam-${detail.testTitle?.replace(/\s+/g, '-') || 'recording'}-${timestamp}.mp3`);
      showToast.success('Audio muvaffaqiyatli yuklab olindi');
    } catch (error) {
      showToast.error('Audio yuklab olishda xatolik yuz berdi');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!detail || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      generateAttemptPdf(detail as any, analysis as any ?? null);
      showToast.success('PDF muvaffaqiyatli yuklab olindi');
    } catch {
      showToast.error('PDF yaratishda xatolik yuz berdi');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-7 h-7 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!detail) return <p className="text-white/40 text-sm py-4 text-center">Ma'lumot yuklanmadi</p>;

  const sections = detail.sections ?? [];
  const responses = detail.responses ?? [];
  const hasAudio = responses.some((r) => r.answer && typeof r.answer === 'object' && 'audio' in r.answer);

  return (
    <div className="space-y-5 py-2">
      {/* Action buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {detail.estimatedCefrLevel && (
            <span className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
              CEFR {detail.estimatedCefrLevel}
            </span>
          )}
          {detail.totalScore != null && detail.maxTotalScore != null && (
            <span className="text-white/45 text-xs">
              Ball: {Math.round(detail.totalScore)} / {Math.round(detail.maxTotalScore)}
            </span>
          )}
          {analysis?.confidence != null && (
            <span className="text-white/35 text-xs">
              AI ishonch: {Math.round(analysis.confidence * 100)}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {status === 'SCORED' && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {isGeneratingPdf ? 'PDF...' : 'PDF'}
            </button>
          )}
          {hasAudio && (
            <button
              type="button"
              onClick={handleDownloadAudio}
              disabled={isDownloading}
              className="px-4 py-2 rounded-xl bg-orange-500/80 hover:bg-orange-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              {isDownloading ? 'Converting...' : 'MP3'}
            </button>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="space-y-3">
          <div className="bg-orange-500/8 border border-orange-500/15 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">AI Speaking Tahlil</p>
              {analysis.estimatedSpeakingLevel && (
                <span className="px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-300 text-xs font-black">
                  {analysis.estimatedSpeakingLevel}
                </span>
              )}
            </div>
            <p className="text-white/75 text-sm leading-relaxed">{analysis.overallSummary}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {analysis.overallStrengths?.length > 0 && (
              <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-3">
                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2">Kuchli tomonlar</p>
                <ul className="space-y-1">
                  {analysis.overallStrengths.map((s: string, i: number) => (
                    <li key={i} className="text-white/65 text-xs flex gap-1.5"><span className="text-green-400 flex-shrink-0">•</span>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.areasForImprovement?.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Rivojlantirish</p>
                <ul className="space-y-1">
                  {analysis.areasForImprovement.map((s: string, i: number) => (
                    <li key={i} className="text-white/65 text-xs flex gap-1.5"><span className="text-red-400 flex-shrink-0">•</span>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.recommendations?.length > 0 && (
              <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Tavsiyalar</p>
                <ul className="space-y-1">
                  {analysis.recommendations.map((s: string, i: number) => (
                    <li key={i} className="text-white/65 text-xs flex gap-1.5"><span className="text-blue-400 flex-shrink-0">•</span>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {analysis.partAnalyses?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-white/35 uppercase tracking-widest">Bo'limlar tahlili</p>
              {analysis.partAnalyses.map((part: any) => {
                const pct = part.maxScore > 0 ? Math.round((part.score / part.maxScore) * 100) : 0;
                const color = pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
                const textColor = pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400';
                return (
                  <div key={part.partNumber} className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02]">
                      <span className="text-white text-sm font-bold">Part {part.partNumber}: {part.partName}</span>
                      <span className={`text-sm font-black ${textColor}`}>{part.maxScore > 0 ? (part.score / part.maxScore * 75).toFixed(1) : '—'}/75</span>
                    </div>
                    <div className="h-1 bg-white/5"><div className={`h-full ${color}`} style={{ width: `${pct}%` }} /></div>
                    {part.criteriaBreakdown?.length > 0 && (
                      <div className="p-4 space-y-3">
                        {part.criteriaBreakdown.map((crit: any, ci: number) => {
                          const cpct = crit.maxScore > 0 ? Math.round((crit.score / crit.maxScore) * 100) : 0;
                          const cc = cpct >= 70 ? 'bg-green-500' : cpct >= 50 ? 'bg-amber-500' : 'bg-red-500';
                          const ct = cpct >= 70 ? 'text-green-400' : cpct >= 50 ? 'text-amber-400' : 'text-red-400';
                          return (
                            <div key={ci}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white/55 text-xs">{crit.criterionName}</span>
                                <span className={`text-xs font-bold ${ct}`}>{crit.maxScore > 0 ? (crit.score / crit.maxScore * 75).toFixed(1) : '—'}/75</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full mb-1.5">
                                <div className={`h-full rounded-full ${cc}`} style={{ width: `${cpct}%` }} />
                              </div>
                              {crit.feedback && <p className="text-white/45 text-xs leading-relaxed">{crit.feedback}</p>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Basic AI Summary */}
      {!analysis && detail.aiSummary && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <p className="text-[10px] font-black text-white/35 uppercase tracking-widest mb-2">AI Tahlil</p>
          <p className="text-white/65 text-sm leading-relaxed">{detail.aiSummary}</p>
        </div>
      )}

      {/* Sections */}
      {sections.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-white/35 uppercase tracking-widest">Bo'limlar</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sections.map((sec: any) => {
              const pct = sec.sectionScore != null && sec.maxSectionScore > 0
                ? Math.round((sec.sectionScore / sec.maxSectionScore) * 100) : null;
              const color = pct != null ? (pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500') : '';
              const textColor = pct != null ? (pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400') : '';
              return (
                <div key={sec.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white text-sm font-semibold truncate">{sec.sectionTitle}</h4>
                    {pct !== null && <span className={`text-sm font-black ${textColor}`}>{pct}%</span>}
                  </div>
                  <span className="text-white/30 text-xs capitalize">{sec.skill?.toLowerCase()}</span>
                  {pct !== null && (
                    <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  )}
                  {sec.aiFeedback && <p className="text-white/45 text-xs mt-2 leading-relaxed">{sec.aiFeedback}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rubric scores */}
      {responses.some((r: any) => r.rubricScores?.length > 0) && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-white/35 uppercase tracking-widest">Batafsil baholash</p>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-3 text-[10px] font-bold text-white/35 uppercase">Mezon</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-white/35 uppercase text-right">Ball</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-white/35 uppercase hidden sm:table-cell">Fikr</th>
                </tr>
              </thead>
              <tbody>
                {responses.flatMap((r: any) =>
                  (r.rubricScores ?? []).map((rs: any) => (
                    <tr key={`${r.id}-${rs.criterionId}`} className="border-b border-white/[0.03]">
                      <td className="px-4 py-3 text-white/65 text-sm">{rs.criterionName}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-white font-bold text-sm">{rs.maxScore > 0 ? (rs.score / rs.maxScore * 75).toFixed(1) : '—'}</span>
                        <span className="text-white/30 text-xs">/75</span>
                      </td>
                      <td className="px-4 py-3 text-white/45 text-xs hidden sm:table-cell">{rs.feedback || '—'}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Per-response audio */}
      {(responses.some((r: any) => r?.answer?.audio) || indexedBlobs.some(Boolean)) && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-white/35 uppercase tracking-widest">Audio Yozuvlar</p>
          <div className="space-y-2">
            {responses.map((r: any, i: number) => (
              <ResponseAudioCard
                key={r.id ?? i}
                response={r}
                index={i}
                attemptId={attemptId}
                indexedBlob={indexedBlobs[i] ?? null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Pagination component ─────────────────────────────────────────────────────

const Pagination: React.FC<{
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // sahifa raqamlari: max 5 ta ko'rsatiladi
  const getPages = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 5) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) pages.push('...');
      for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i);
      if (page < totalPages - 3) pages.push('...');
      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-white/30 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
              p === page
                ? 'bg-orange-500 text-white shadow-[0_4px_14px_rgba(255,115,0,0.35)]'
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
            }`}>
            {(p as number) + 1}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

// ── AttemptCard ──────────────────────────────────────────────────────────────

const AttemptCard: React.FC<{
  item: AttemptListResponse;
  delta: number | null;
  expanded: boolean;
  onToggle: () => void;
}> = ({ item, delta, expanded, onToggle }) => {
  const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.SUBMITTED;

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
      expanded ? 'border-orange-500/25 bg-white/[0.05]' : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]'
    }`}>
      {/* ── Card header (always visible) */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5">
        <div className="flex items-start gap-4">

          {/* Score circle */}
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
            {item.scorePercentage != null ? (
              <>
                <span className="text-white text-sm font-black leading-none">
                  {Math.round(item.scorePercentage)}%
                </span>
                {(() => {
                  const estimatedLevel = (item as any).estimatedCefrLevel;
                  const lvl = estimatedLevel
                    ? { label: estimatedLevel, color: scoreToLevel(item.scorePercentage)?.color ?? 'text-white/60' }
                    : scoreToLevel(item.scorePercentage);
                  return lvl ? (
                    <span className={`text-[10px] font-black mt-0.5 ${lvl.color}`}>{lvl.label}</span>
                  ) : null;
                })()}
                {delta !== null && delta !== 0 && (
                  <span className={`text-[8px] font-bold ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {delta > 0 ? '+' : ''}{delta}
                  </span>
                )}
              </>
            ) : (
              <span className="text-white/30 text-xs font-medium">—</span>
            )}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-white font-bold text-sm sm:text-base leading-snug line-clamp-2">
                {item.testTitle || '—'}
              </p>
              {/* Expand icon */}
              <svg
                className={`w-4 h-4 text-white/30 flex-shrink-0 mt-1 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {/* Status */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${statusStyle.bg} ${statusStyle.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                {statusStyle.label}
              </span>
              {/* Estimated CEFR level badge */}
              {(() => {
                const estimatedLevel = (item as any).estimatedCefrLevel;
                if (!estimatedLevel) return null;
                return (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    {estimatedLevel}
                  </span>
                );
              })()}
              {/* Source type */}
              {(item as any).sourceType && (
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 text-[10px] font-medium">
                  {SOURCE_LABELS[(item as any).sourceType] ?? (item as any).sourceType}
                </span>
              )}
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1">
              <div>
                <p className="text-white/30 text-[9px] uppercase tracking-wider mb-0.5">Boshlangan</p>
                <p className="text-white/65 text-xs">{formatDate(item.startedAt, true)}</p>
              </div>
              <div>
                <p className="text-white/30 text-[9px] uppercase tracking-wider mb-0.5">Topshirilgan</p>
                <p className="text-white/65 text-xs">{formatDate((item as any).submittedAt, true)}</p>
              </div>
              <div>
                <p className="text-white/30 text-[9px] uppercase tracking-wider mb-0.5">Baholangan</p>
                <p className="text-white/65 text-xs">{formatDate((item as any).scoredAt, true)}</p>
              </div>
              <div>
                <p className="text-white/30 text-[9px] uppercase tracking-wider mb-0.5">Ball</p>
                <p className="text-white/65 text-xs">
                  {(item as any).totalScore != null && (item as any).maxTotalScore != null
                    ? `${Math.round((item as any).totalScore)} / ${Math.round((item as any).maxTotalScore)}`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* ── Expanded detail */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-white/[0.06]">
          <AttemptDetail attemptId={item.id} status={item.status} />
        </div>
      )}
    </div>
  );
};

// ── Main History page ────────────────────────────────────────────────────────

const History: React.FC = () => {
  const { t } = useTranslation();

  // ── Filter / sort / pagination state
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Debounce search input (300ms)
  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    const t = setTimeout(() => { setDebouncedSearch(val); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, []);

  const {
    data: historyData,
    isLoading,
    isError,
    refetch: refetchHistory,
  } = useGetAttemptHistory({
    page,
    size: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const attempts: AttemptListResponse[] = historyData?.items ?? [];
  const totalItems: number = historyData?.totalCount ?? historyData?.total ?? 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

  // Stats (from current filtered page — shows context-aware numbers)
  const stats = useMemo(() => {
    const scored = attempts.filter((a) => a.status === 'SCORED' && a.scorePercentage != null && !isNaN(Number(a.scorePercentage)));
    return {
      total: totalItems,
      avg: scored.length > 0 ? Math.round(scored.reduce((s, a) => s + Number(a.scorePercentage), 0) / scored.length) : 0,
      best: scored.length > 0 ? Math.round(Math.max(...scored.map((a) => Number(a.scorePercentage)))) : 0,
    };
  }, [attempts, totalItems]);

  // Chart data
  const chartData = useMemo(() => (
    [...attempts]
      .filter((a) => a.status === 'SCORED' && a.scorePercentage != null)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
      .map((a) => ({ date: a.startedAt, score: a.scorePercentage! }))
  ), [attempts]);

  // Delta map
  const deltaMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    const sorted = [...attempts]
      .filter((a) => a.status === 'SCORED' && a.scorePercentage != null)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
    sorted.forEach((a, i) => {
      map[a.id] = i === 0 ? null : Math.round((a.scorePercentage ?? 0) - (sorted[i - 1].scorePercentage ?? 0));
    });
    return map;
  }, [attempts]);

  const hasSearch = !!debouncedSearch;

  useEffect(() => {
    const hasPendingScoring = attempts.some((attempt) => attempt.status === 'SUBMITTED' || attempt.status === 'SCORING');
    if (!hasPendingScoring) return;

    const timer = window.setInterval(() => {
      refetchHistory();
    }, 4000);

    return () => {
      window.clearInterval(timer);
    };
  }, [attempts, refetchHistory]);

  return (
    <div className="relative min-h-screen py-20 sm:py-28 md:py-36 px-4 sm:px-6 md:px-12 overflow-hidden bg-[#050505]">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#120e08] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,115,0,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative z-10 max-w-5xl mx-auto text-white">

        {/* ── Header */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-4xl font-black mb-2">
            {t('history.title')}
          </h1>
          <p className="text-white/45 text-sm sm:text-base">{t('history.subtitle')}</p>
        </div>

        {/* ── Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-8">
          {[
            { label: t('history.totalExams'), value: stats.total, color: 'text-white' },
            { label: t('history.avgScore'),   value: stats.avg  > 0 ? `${stats.avg}%`  : '—', color: 'text-orange-400' },
            { label: t('history.bestScore'),  value: stats.best > 0 ? `${stats.best}%` : '—', color: 'text-green-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 sm:p-6 text-center">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-2xl sm:text-4xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Score chart */}
        {chartData.length >= 2 && (
          <div className="mb-8">
            <p className="text-[10px] font-black text-white/35 uppercase tracking-widest mb-3">Natijalar dinamikasi</p>
            <ScoreChart data={chartData} />
          </div>
        )}

        {/* ── Search */}
        <div className="relative mb-6">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Test nomini qidirish..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-orange-500/40 focus:bg-white/[0.07] transition"
          />
        </div>

        {/* ── Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
            <p className="text-white/40 text-sm">Yuklanmoqda...</p>
          </div>
        )}

        {/* ── Error */}
        {isError && (
          <div className="text-center py-24">
            <p className="text-white/50 text-sm mb-4">Tarixni yuklashda xatolik yuz berdi</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-xl bg-white/8 text-white/60 hover:bg-white/12 transition text-sm">
              Qaytadan urinish
            </button>
          </div>
        )}

        {/* ── Empty */}
        {!isLoading && !isError && attempts.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-white/55 text-base mb-1">
              {hasSearch ? 'Qidiruv bo\'yicha natija topilmadi' : 'Hali imtihon topshirmagansiz'}
            </p>
            <p className="text-white/30 text-sm">
              {hasSearch ? 'Boshqa kalit so\'z bilan qidirib ko\'ring' : 'Test topshirib, natijalaringizni bu yerda ko\'ring'}
            </p>
          </div>
        )}

        {/* ── Attempt cards */}
        {!isLoading && !isError && attempts.length > 0 && (
          <>
            {/* Result count */}
            <p className="text-white/30 text-xs mb-4">
              Jami {totalItems} ta natija
              {totalPages > 1 && ` · Sahifa ${page + 1} / ${totalPages}`}
            </p>

            <div className="space-y-3">
              {attempts.map((item) => (
                <AttemptCard
                  key={item.id}
                  item={item}
                  delta={deltaMap[item.id] ?? null}
                  expanded={expandedId === item.id}
                  onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                />
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default History;
