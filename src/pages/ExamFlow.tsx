import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ExamStatus } from '../types';
import { showToast } from '../utils/configs/toastConfig';
import { playTTS, playBeep, stopAllAudio } from '../services/geminiService';
import { useHasExamAccess } from '../hooks/useHasExamAccess';
import {
  useGetTest,
  useGetSection,
  useStartAttempt,
  useStartRandomAttempt,
  useUpsertResponse,
  useSubmitSection,
  useSubmitAttempt,
  usePresignUpload,
  useUploadToS3,
  useGetAttempt,
  useGetDownloadUrl,
} from '../services/hooks';
import type {
  CefrLevel,
  TestDetailResponse,
  SectionDetailResponse,
  QuestionResponse,
  AttemptDetailResponse,
} from '../api/types';
import * as queries from '../services/queries';
import { combineAudioToMp3, downloadMp3 } from '../utils/audioConverter';
import { saveRecording } from '../utils/audioStore';
import MicPermissionScreen from '../components/examflow/MicPermissionScreen';
import StartExamScreen from '../components/examflow/StartExamScreen';
import FinishedScreen from '../components/examflow/FinishedScreen';
import ExamHeader from '../components/examflow/ExamHeader';
import ExamBody from '../components/examflow/ExamBody';

const DEFAULT_PREP_TIME = 30;
const DEFAULT_RECORD_TIME = 60;

const ExamFlow: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasAccess, roles } = useHasExamAccess();
  const accessCheckedRef = useRef(false);

  // Premium obuna tekshiruvi - access yo'q bo'lsa /subscribe ga yo'naltirish
  useEffect(() => {
    // Roles yuklanguncha kutamiz va faqat bir marta tekshiramiz
    if (roles.length > 0 && !hasAccess && !accessCheckedRef.current) {
      accessCheckedRef.current = true;
      showToast.warning('Imtihon topshirish uchun premium obuna sotib oling');
      navigate('/subscribe', { replace: true });
    }
  }, [hasAccess, roles, navigate]);

  // Mode support
  const routeState = location.state as {
    selectedSectionIds?: string[];
    mode?: string;
    randomConfig?: {
      cefrLevel?: CefrLevel;
      sectionCount?: number;
      skills?: string[];
      sourceTestIds?: string[];
    };
  } | null;
  const isCustomMode = routeState?.mode === 'custom';
  const isRandomMode = routeState?.mode === 'random' || testId === 'random';
  const selectedSectionIds = routeState?.selectedSectionIds;
  const randomConfig = routeState?.randomConfig;
  const resolvedRouteTestId = testId && testId !== 'random' ? testId : null;
  const [resolvedTestId, setResolvedTestId] = useState<string | null>(resolvedRouteTestId);

  // ================= API DATA =================
  const {
    data: testDetail,
    isLoading: isLoadingTest,
    isError: isTestError,
    error: testError,
  } = useGetTest(resolvedTestId, { enabled: !!resolvedTestId });

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [sectionDetail, setSectionDetail] = useState<SectionDetailResponse | null>(null);
  const [attemptDetail, setAttemptDetail] = useState<AttemptDetailResponse | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [localRecordings, setLocalRecordings] = useState<{ id: string; blob: Blob; index: number }[]>([]);
  // Maps sectionId → testId for RANDOM_SECTIONS attempts (when backend returns testId: null)
  const [sectionToTestIdMap, setSectionToTestIdMap] = useState<Record<string, string>>({});

  // Current section ID derived from test detail (filtered for custom mode)
  const allSections = testDetail?.sections ?? [];
  const sections =
    isCustomMode && selectedSectionIds
      ? allSections.filter((s) => selectedSectionIds.includes(s.id))
      : allSections;

  // For random mode: use attempt's selected sections (not all test sections).
  // AttemptSectionResponse.sectionId is the actual section UUID needed for API calls.
  // We must wait for attemptDetail before fetching any sections, to avoid using the
  // wrong (full-test) section list from testDetail.
  const randomAttemptSections = isRandomMode ? (attemptDetail?.sections ?? null) : null;
  const effectiveSectionCount = randomAttemptSections ? randomAttemptSections.length : sections.length;
  const currentSectionId = isRandomMode
    ? (randomAttemptSections?.[currentSectionIdx]?.sectionId ?? null)
    : (sections[currentSectionIdx]?.id ?? null);

  // For RANDOM_SECTIONS (testId: null), each section may belong to a different test.
  // Use the sectionToTestIdMap to resolve the correct testId per section.
  const currentSectionTestId = (isRandomMode && currentSectionId && sectionToTestIdMap[currentSectionId])
    ? sectionToTestIdMap[currentSectionId]
    : resolvedTestId;

  // Fetch section detail
  const {
    data: fetchedSection,
    isLoading: isLoadingSection,
    refetch: refetchSection,
  } = useGetSection(
    { testId: currentSectionTestId!, sectionId: currentSectionId! },
    { enabled: !!currentSectionTestId && !!currentSectionId },
  );
  const { data: fetchedAttempt, refetch: refetchAttempt } = useGetAttempt(attemptId);

  // Update section detail when fetched
  useEffect(() => {
    if (fetchedSection) {
      setSectionDetail(fetchedSection);
    }
  }, [fetchedSection]);

  useEffect(() => {
    if (fetchedAttempt) {
      setAttemptDetail(fetchedAttempt);
    }
  }, [fetchedAttempt]);

  // Questions from current section
  const questions = useMemo(() => {
    return sectionDetail?.questions ?? [];
  }, [sectionDetail]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const currentQuestion = questions[currentQuestionIdx];

  const audioRecordings = useMemo(() => {
    if (!attemptDetail?.responses || attemptDetail.responses.length === 0) {
      return [];
    }

    return attemptDetail.responses
      .map((response) => {
        const assetId = (response.answer as { assetId?: string } | null)?.assetId;
        if (!assetId) return null;
        return {
          assetId,
          questionId: response.questionId,
          answeredAt: response.answeredAt,
        };
      })
      .filter((item): item is { assetId: string; questionId: string; answeredAt: string } => !!item)
      .sort((a, b) => new Date(a.answeredAt).getTime() - new Date(b.answeredAt).getTime());
  }, [attemptDetail]);

  const recordingItems = useMemo(() => {
    if (localRecordings.length > 0) {
      return localRecordings.map((recording) => ({
        id: recording.id,
        label: `Recording ${recording.index}`,
        blob: recording.blob,
      }));
    }

    return audioRecordings.map((recording, index) => ({
      id: recording.assetId,
      label: `Recording ${index + 1}`,
      assetId: recording.assetId,
    }));
  }, [audioRecordings, localRecordings]);

  // ================= IMAGE URLS =================
  const [sectionImageUrls, setSectionImageUrls] = useState<string[]>([]);

  // Fetch section-level image asset URLs (e.g. Part 1.2 comparison images)
  useEffect(() => {
    if (!sectionDetail?.assets?.length) {
      setSectionImageUrls([]);
      return;
    }
    const imageAssets = sectionDetail.assets
      .filter((a) => a.assetType === 'IMAGE')
      .sort((a, b) => a.orderIndex - b.orderIndex);

    if (imageAssets.length === 0) {
      setSectionImageUrls([]);
      return;
    }

    let cancelled = false;
    Promise.all(imageAssets.map((a) => queries.getDownloadUrl(a.id)))
      .then((results) => {
        if (!cancelled) {
          setSectionImageUrls(results.map((r: any) => r.downloadUrl));
        }
      })
      .catch(() => {
        if (!cancelled) setSectionImageUrls([]);
      });

    return () => {
      cancelled = true;
    };
  }, [sectionDetail]);

  // Fetch question-level image URLs (Part 1.2 has 2 images)
  const { data: questionImageData } = useGetDownloadUrl(
    currentQuestion?.promptImageAssetId ?? null,
    { enabled: !!currentQuestion?.promptImageAssetId },
  );
  const { data: questionImage2Data } = useGetDownloadUrl(
    currentQuestion?.settings?.image2AssetId ?? null,
    { enabled: !!currentQuestion?.settings?.image2AssetId },
  );
  const promptImageUrl = questionImageData?.downloadUrl ?? null;
  const promptImage2Url = questionImage2Data?.downloadUrl ?? null;

  // ================= UI STATE =================
  const [status, setStatus] = useState<ExamStatus>(ExamStatus.IDLE);

  // Poll attempt detail every 4s while on FINISHED screen and scoring is in progress
  useEffect(() => {
    const needsPolling =
      status === ExamStatus.FINISHED &&
      (attemptDetail?.status === 'SUBMITTED' || attemptDetail?.status === 'SCORING');
    if (!needsPolling) return;
    const timer = setInterval(() => { refetchAttempt(); }, 4000);
    return () => clearInterval(timer);
  }, [status, attemptDetail?.status, refetchAttempt]);
  const [displayTime, setDisplayTime] = useState(0);
  const [timeProgress, setTimeProgress] = useState(1);
  const [isMicAllowed, setIsMicAllowed] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);
  const [transcript, setTranscript] = useState('');

  // ================= REFS =================
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveformAnimationRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const attemptIdRef = useRef<string | null>(null);
  const recordingIndexRef = useRef(0);

  // Keep ref in sync with state
  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);

  // ================= MUTATIONS =================
  const { mutateAsync: startAttemptMutation } = useStartAttempt();
  const { mutateAsync: startRandomAttemptMutation } = useStartRandomAttempt();
  const { mutateAsync: upsertResponseMutation } = useUpsertResponse();
  const { mutateAsync: submitSectionMutation } = useSubmitSection();
  const { mutateAsync: submitAttemptMutation } = useSubmitAttempt();
  const { mutateAsync: presignUploadMutation } = usePresignUpload();
  const { mutateAsync: uploadToS3Mutation } = useUploadToS3();

  // ================= CLEANUP =================
  const cleanupAll = useCallback(() => {
    try {
      stopAllAudio();

      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (waveformAnimationRef.current !== null) {
        cancelAnimationFrame(waveformAnimationRef.current);
        waveformAnimationRef.current = null;
      }

      runningRef.current = false;
    } catch (error) {
      console.warn('⚠️ Cleanup error:', error);
    }
  }, []);

  useEffect(() => {
    return () => cleanupAll();
  }, [cleanupAll]);

  useEffect(() => {
    const handleBeforeUnload = () => cleanupAll();
    const handleVisibilityChange = () => {
      if (document.hidden) stopAllAudio();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cleanupAll]);

  // ================= TIMER =================
  const startTimer = (seconds: number) => {
    return new Promise<void>((resolve) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const end = performance.now() + seconds * 1000;
      setDisplayTime(seconds);
      setTimeProgress(1);

      const tick = () => {
        const now = performance.now();
        const remaining = Math.max(0, end - now);
        const sec = Math.ceil(remaining / 1000);

        setDisplayTime(sec);
        setTimeProgress(remaining / (seconds * 1000));

        if (remaining > 0) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setDisplayTime(0);
          setTimeProgress(0);
          rafRef.current = null;
          resolve();
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    });
  };

  // ================= AUDIO UPLOAD =================
  const resolveBucketFromUploadUrl = (uploadUrl: string) => {
    try {
      const url = new URL(uploadUrl);
      const host = url.hostname;
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (host.includes('.s3')) {
        return host.split('.s3')[0] || null;
      }
      if (host.startsWith('s3') || host.startsWith('s3-')) {
        return pathParts[0] || null;
      }
      return pathParts[0] || null;
    } catch {
      return null;
    }
  };

  const uploadAudioAndSubmitResponse = async (audioBlob: Blob, aId: string, questionId: string) => {
    try {
      // 1. Get presigned upload URL
      const presign = await presignUploadMutation({
        assetType: 'AUDIO',
        mimeType: 'audio/webm',
        contextType: 'speaking_response',
        attemptId: aId,
        questionId,
      });

      const bucket = resolveBucketFromUploadUrl(presign.uploadUrl) ?? 'unknown';
      const key = presign.s3Key ?? '';
      const assetId = presign.assetId;

      // 2. Upload to S3
      await uploadToS3Mutation({
        uploadUrl: presign.uploadUrl,
        file: audioBlob,
        headers: presign.headers,
      });

      // 3. Save response with assetId for future downloads
      await upsertResponseMutation({
        attemptId: aId,
        questionId,
        answer: { audio: { assetId, bucket, key } },
      });

    } catch (error) {
      console.error('❌ Failed to upload/save response:', error);
      // Don't block exam flow on upload failure
    }
  };

  const triggerDownload = (url: string, filename: string) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const fetchDownloadUrl = useCallback(async (assetId: string) => {
    const data = await queries.getDownloadUrl(assetId);
    if (!data?.downloadUrl) {
      throw new Error('Download URL not available');
    }
    return data.downloadUrl as string;
  }, []);

  const downloadLocalBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    triggerDownload(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadRecordingItem = useCallback(async (
    recording: { assetId?: string; blob?: Blob },
    index: number,
    usePopup: boolean,
  ) => {
    const safeAttemptId = attemptIdRef.current ?? 'attempt';
    const filename = `recording-${safeAttemptId}-${index + 1}.webm`;

    if (recording.blob) {
      downloadLocalBlob(recording.blob, filename);
      return;
    }

    if (!recording.assetId) {
      throw new Error('Recording data missing');
    }

    const downloadUrl = await fetchDownloadUrl(recording.assetId);
    if (usePopup) {
      const popup = window.open('', '_blank');
      if (popup) {
        popup.location.href = downloadUrl;
        return;
      }
    }
    triggerDownload(downloadUrl, filename);
  }, [fetchDownloadUrl]);

  const handleDownloadRecording = useCallback(async (
    recording: { assetId?: string; blob?: Blob },
    index: number,
  ) => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadRecordingItem(recording, index, true);
    } catch (error) {
      console.error('Download failed:', error);
      showToast.error('Yozuvni yuklab olishda xatolik yuz berdi');
    } finally {
      setIsDownloading(false);
    }
  }, [downloadRecordingItem, isDownloading]);

  const handleDownloadAll = useCallback(async () => {
    if (isDownloading) return;

    // Faqat xotiradagi local blob'larni ishlatish — backend'ga zapros yo'q
    const audioBlobs = [...localRecordings]
      .sort((a, b) => a.index - b.index)
      .map((r) => r.blob)
      .filter((b) => b.size > 0);

    if (audioBlobs.length === 0) {
      showToast.warning('Hech qanday audio topilmadi');
      return;
    }

    setIsDownloading(true);
    try {
      showToast.info('Audio tayyorlanmoqda...');
      const combined = await combineAudioToMp3(audioBlobs);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `exam-recording-${timestamp}.mp3`;

      downloadMp3(combined, filename);
      showToast.success('Audio muvaffaqiyatli yuklab olindi');
    } catch (error) {
      console.error('MP3 conversion failed:', error);
      showToast.error('Audio yuklab olishda xatolik yuz berdi');
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, localRecordings]);

  // ================= QUESTION FLOW =================
  const runQuestion = async (q: QuestionResponse) => {
    if (runningRef.current) return;
    runningRef.current = true;

    const prepTime = q.settings?.delay ?? DEFAULT_PREP_TIME;
    const recordTime = q.settings?.duration ?? DEFAULT_RECORD_TIME;

    try {
      // PREPARING - First play TTS, then start prep timer
      if (prepTime > 0) {
        setStatus(ExamStatus.PREPARING);
        // Wait for TTS to finish first
        try {
          await playTTS(q.prompt);
        } catch (error) {
          console.error('TTS Error:', error);
        }
        // Then start prep timer
        await startTimer(prepTime);
        await playBeep();
      }

      // RECORDING
      setStatus(ExamStatus.RECORDING);
      audioChunksRef.current = [];

      // Create a fresh MediaRecorder for this question
      if (micStreamRef.current) {
        const recorder = new MediaRecorder(micStreamRef.current);
        mediaRecorderRef.current = recorder;

        const recordingPromise = new Promise<Blob>((resolve) => {
          const chunks: Blob[] = [];

          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };

          recorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            resolve(audioBlob);
          };
        });

        recorder.start();

        await startTimer(recordTime);
        await playBeep();

        if (recorder.state === 'recording') {
          recorder.stop();
        }

        // Wait for the blob and upload
        const audioBlob = await recordingPromise;

        if (audioBlob.size > 0) {
          recordingIndexRef.current += 1;
          const localIndex = recordingIndexRef.current;
          setLocalRecordings((prev) => [
            ...prev,
            { id: `${q.id}-${localIndex}`, blob: audioBlob, index: localIndex },
          ]);
          // IndexedDB'ga saqlash — History sahifasi backend'siz yuklasin
          if (attemptIdRef.current) {
            saveRecording(attemptIdRef.current, localIndex, audioBlob).catch(() => {});
          }
        }

        if (audioBlob.size > 0 && attemptIdRef.current) {
          setIsSaving(true);
          setStatus(ExamStatus.IDLE);
          await uploadAudioAndSubmitResponse(audioBlob, attemptIdRef.current, q.id);
          setIsSaving(false);
        }
      } else {
        // No mic stream - just run timer
        await startTimer(recordTime);
        await playBeep();
      }

      // Advance to next question or section
      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx((i) => i + 1);
        setStatus(ExamStatus.IDLE);
      } else {
        // Section complete - submit section
        if (attemptIdRef.current && currentSectionId) {
          try {
            await submitSectionMutation({
              attemptId: attemptIdRef.current,
              sectionId: currentSectionId,
            });
          } catch (error) {
            console.error('❌ Section submit failed:', error);
          }
        }

        if (currentSectionIdx < effectiveSectionCount - 1) {
          // More sections to go - automatically move to next section
          setCurrentSectionIdx((i) => i + 1);
          setCurrentQuestionIdx(0);
          setSectionDetail(null);
          setStatus(ExamStatus.IDLE);
        } else {
          // All sections done - submit attempt
          setStatus(ExamStatus.FINISHED);

          if (attemptIdRef.current) {
            setIsSubmittingAttempt(true);
            try {
              await submitAttemptMutation(attemptIdRef.current);
              await refetchAttempt();
            } catch (error) {
              console.error('❌ Attempt submit failed:', error);
            }
            setIsSubmittingAttempt(false);
          }
        }
      }
    } catch (error) {
      console.error('Question flow error:', error);
      setStatus(ExamStatus.IDLE);
    } finally {
      runningRef.current = false;
    }
  };

  // ================= WAVEFORM ANIMATION =================
  useEffect(() => {
    if (status !== ExamStatus.RECORDING || !waveformCanvasRef.current) return;

    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = 30;
    const barWidth = canvas.width / bars;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    let lastFrameTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastFrameTime;

      if (elapsed >= frameInterval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f97316';

        for (let i = 0; i < bars; i++) {
          const height = Math.random() * canvas.height * 0.8;
          const x = i * barWidth;
          const y = (canvas.height - height) / 2;
          ctx.fillRect(x, y, barWidth - 2, height);
        }

        lastFrameTime = currentTime - (elapsed % frameInterval);
      }

      waveformAnimationRef.current = requestAnimationFrame(animate);
    };

    waveformAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      if (waveformAnimationRef.current !== null) {
        cancelAnimationFrame(waveformAnimationRef.current);
        waveformAnimationRef.current = null;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [status]);

  // ================= NEXT SECTION HANDLER =================
  const handleNextSection = useCallback(() => {
    if (currentSectionIdx < effectiveSectionCount - 1) {
      setCurrentSectionIdx((i) => i + 1);
      setCurrentQuestionIdx(0);
      setSectionDetail(null);
      setStatus(ExamStatus.IDLE);
      runningRef.current = false;
    } else {
      setStatus(ExamStatus.FINISHED);
    }
  }, [currentSectionIdx, effectiveSectionCount]);

  // ================= FINISH (CUSTOM MODE) =================
  const handleFinishExam = useCallback(async () => {
    cleanupAll();
    if (!isRandomMode && attemptIdRef.current) {
      try {
        // Submit current section if in progress
        if (currentSectionId) {
          await submitSectionMutation({
            attemptId: attemptIdRef.current,
            sectionId: currentSectionId,
          }).catch(() => {});
        }
        await submitAttemptMutation(attemptIdRef.current);
      } catch (error) {
        console.error('Finish attempt error:', error);
      }
    }
    navigate('/mock-exam');
  }, [cleanupAll, currentSectionId, submitSectionMutation, submitAttemptMutation, navigate, isRandomMode]);

  // ================= START EXAM =================
  const handleStartExam = useCallback(async () => {
    if (!isRandomMode && !resolvedTestId) return;

    try {
      setLocalRecordings([]);
      recordingIndexRef.current = 0;
      const result = isRandomMode
        ? await startRandomAttemptMutation({
            cefrLevel: randomConfig?.cefrLevel ?? testDetail?.cefrLevel ?? 'B1',
            ...(typeof randomConfig?.sectionCount === 'number'
              ? { sectionCount: Math.max(1, Math.min(10, randomConfig.sectionCount)) }
              : {}),
            ...(Array.isArray(randomConfig?.skills) && randomConfig.skills.length > 0
              ? { skills: randomConfig.skills }
              : {}),
            ...(Array.isArray(randomConfig?.sourceTestIds) && randomConfig.sourceTestIds.length > 0
              ? { sourceTestIds: randomConfig.sourceTestIds }
              : {}),
          })
        : await startAttemptMutation({ testId: resolvedTestId!, sectionId: undefined });
      if (isRandomMode) {
        let randomTestId = result?.testId ?? null;
        let startedAttempt: any = null;

        // Fetch attempt detail to get selected sections
        if (result?.attemptId) {
          try {
            startedAttempt = await queries.getAttempt(result.attemptId);
            if (!randomTestId) randomTestId = startedAttempt?.testId ?? null;
            if (startedAttempt) setAttemptDetail(startedAttempt);
          } catch (attemptError) {
            console.error('Failed to fetch attempt detail:', attemptError);
          }
        }

        // If testId still null (RANDOM_SECTIONS across multiple tests),
        // build a sectionId→testId map by fetching all available tests.
        if (!randomTestId && startedAttempt?.sections?.length > 0) {
          try {
            const sectionIds: string[] = startedAttempt.sections.map((s: any) => s.sectionId);
            const cefrLevel = randomConfig?.cefrLevel ?? startedAttempt?.cefrLevel ?? undefined;
            const testsData = await queries.getTests({ page: 0, size: 100, level: cefrLevel });
            const testList: any[] = testsData?.items ?? [];
            const testDetails = await Promise.all(
              testList.map((t: any) => queries.getTest(t.id).catch(() => null))
            );
            const map: Record<string, string> = {};
            for (const td of testDetails) {
              if (td) {
                for (const section of td.sections ?? []) {
                  if (sectionIds.includes(section.id)) {
                    map[section.id] = td.id;
                  }
                }
              }
            }
            if (Object.keys(map).length > 0) {
              setSectionToTestIdMap(map);
              // Use any resolved testId as a fallback for test info display
              randomTestId = map[sectionIds[0]] ?? null;
            }
          } catch (lookupError) {
            console.error('Failed to resolve sectionId→testId map:', lookupError);
          }
        }

        if (!randomTestId) {
          showToast.error("Random testni aniqlab bo'lmadi. Qayta urinib ko'ring.");
          return;
        }
        setResolvedTestId(randomTestId);
        showToast.success('Imtihon boshlandi');
      }
      setAttemptId(result.attemptId);
      attemptIdRef.current = result.attemptId;
      setIsStarted(true);
    } catch (error: any) {
      console.error('❌ Failed to start attempt:', error);
      // Backend 403 qaytarsa — obuna yo'q
      if (error?.response?.status === 403) {
        showToast.error('Imtihon topshirish uchun obuna sotib oling');
        navigate('/subscribe');
        return;
      }
      const backendMessage = error?.response?.data?.message;
      showToast.error(
        backendMessage || "Imtihonni boshlashda xatolik yuz berdi. Qaytadan urinib ko'ring.",
      );
    }
  }, [
    isRandomMode,
    resolvedTestId,
    randomConfig,
    testDetail,
    startAttemptMutation,
    startRandomAttemptMutation,
  ]);

  // ================= TRIGGER QUESTION =================
  useEffect(() => {
    if (!isStarted) return;
    if (!currentQuestion) return;
    if (status !== ExamStatus.IDLE) return;
    if (runningRef.current) return;
    if (isSaving) return;
    if (isLoadingSection) return;

    runQuestion(currentQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isStarted,
    currentQuestionIdx,
    currentSectionIdx,
    status,
    isSaving,
    isLoadingSection,
    sectionDetail,
  ]);

  // ================= MIC PERMISSION =================
  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      micStreamRef.current = stream;
      setIsMicAllowed(true);

      // Expose for debugging
      (window as any).audioChunks = audioChunksRef.current;
    } catch (error) {
      console.error('❌ Microphone access denied:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(
        `Microphone access failed: ${errorMessage}. Microphone access is required for the speaking exam.`,
      );
    }
  };

  const getTimerColor = (p: number) => {
    if (p > 0.6) return '#22c55e';
    if (p > 0.3) return '#facc15';
    return '#ef4444';
  };

  // ================= 403 SUBSCRIPTION CHECK =================
  useEffect(() => {
    if (isTestError && (testError as any)?.response?.status === 403) {
      showToast.error('Imtihon topshirish uchun obuna sotib oling');
      navigate('/subscribe');
    }
  }, [isTestError, testError, navigate]);

  // ================= LOADING / ERROR STATES =================
  const canStartRandomWithoutTest = isRandomMode && !resolvedTestId && !isStarted;
  if (isLoadingTest && !canStartRandomWithoutTest) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-black" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-14 h-14 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-white/50 text-base">Test yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if ((isTestError || !testDetail) && !canStartRandomWithoutTest) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-black" />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-white/60 text-lg">Test topilmadi yoki yuklanmadi</p>
          <button
            onClick={() => navigate('/mock-exam')}
            className="px-6 py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition">
            Testlar ro'yxatiga qaytish
          </button>
        </div>
      </div>
    );
  }

  // ================= RENDER =================
  if (!isMicAllowed) {
    return (
      <MicPermissionScreen
        onEnableMicrophone={requestMic}
        onCancel={() => navigate('/mock-exam')}
      />
    );
  }

  if (!isStarted) {
    const startTitle = isRandomMode
      ? (testDetail?.title ?? 'Random CEFR Mock Test')
      : testDetail!.title;
    const startLevel: CefrLevel = isRandomMode
      ? (randomConfig?.cefrLevel ?? testDetail?.cefrLevel ?? 'B1')
      : testDetail!.cefrLevel;
    const startSectionCount = isRandomMode
      ? (effectiveSectionCount || Math.max(1, Math.min(10, randomConfig?.sectionCount ?? 3)))
      : sections.length;
    const startInstructions = isRandomMode
      ? (testDetail?.instructions ?? 'Random API tanlagan test bo\'yicha imtihon boshlanadi.')
      : testDetail!.instructions;

    return (
      <StartExamScreen
        testTitle={startTitle}
        cefrLevel={startLevel}
        sectionCount={startSectionCount}
        instructions={startInstructions}
        onStart={handleStartExam}
        onBack={() => navigate('/mock-exam')}
      />
    );
  }

  if (status === ExamStatus.FINISHED) {
    return (
      <FinishedScreen
        onGoToResults={() => {
          cleanupAll();
          navigate('/history', { replace: true });
        }}
        attempt={attemptDetail}
        isSubmitting={isSubmittingAttempt}
        recordings={localRecordings.map((r) => ({ id: r.id, label: `Recording ${r.index}`, blob: r.blob }))}
        onDownloadRecording={handleDownloadRecording}
        onDownloadAll={handleDownloadAll}
        isDownloading={isDownloading}
      />
    );
  }

  // Section loading state
  if (isLoadingSection || !sectionDetail) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-black" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-14 h-14 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-white/50 text-base">Bo'lim yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-20 sm:pt-24 md:pt-32 px-4 md:px-10 pb-4 sm:pb-6 md:pb-10 flex items-start md:items-center justify-center overflow-hidden">
      {/* Dark immersive background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,140,0,0.10),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(239,68,68,0.08),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.06),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />

      <div className="relative z-10 max-w-5xl w-full flex flex-col gap-8">
        <ExamHeader
          sectionTitle={sectionDetail.title}
          currentSectionIdx={currentSectionIdx}
          totalSections={effectiveSectionCount}
          currentQuestionIdx={currentQuestionIdx}
          questionsCount={questions.length}
          status={status}
          displayTime={displayTime}
          timeProgress={timeProgress}
          getTimerColor={getTimerColor}
          isCustomMode={isCustomMode}
          onFinish={handleFinishExam}
          onExit={() => {
            cleanupAll();
            navigate('/mock-exam');
          }}
        />

        <ExamBody
          status={status}
          currentQuestion={currentQuestion}
          sectionImageUrls={sectionImageUrls}
          promptImageUrl={promptImageUrl}
          promptImage2Url={promptImage2Url}
          waveformCanvasRef={waveformCanvasRef}
          onNextPart={handleNextSection}
          isSaving={isSaving}
          sectionTitle={sectionDetail?.title ?? ''}
        />
      </div>
    </div>
  );
};

export default ExamFlow;














