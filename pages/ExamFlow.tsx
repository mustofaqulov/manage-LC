import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ExamStatus } from '../types';
import { playTTS, playBeep, stopAllAudio } from '../services/geminiService';
import {
  useGetTest,
  useGetSection,
  useStartAttempt,
  useUpsertResponse,
  useSubmitSection,
  useSubmitAttempt,
  usePresignUpload,
  useUploadToS3,
  useGetAttempt,
  useGetDownloadUrl,
} from '../services/hooks';
import type {
  TestDetailResponse,
  SectionDetailResponse,
  QuestionResponse,
  AttemptDetailResponse,
} from '../src/api/types';
import * as queries from '../services/queries';
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

  // Mode support
  const routeState = location.state as { selectedSectionIds?: string[]; mode?: string } | null;
  const isCustomMode = routeState?.mode === 'custom';
  const isRandomMode = routeState?.mode === 'random';
  const selectedSectionIds = routeState?.selectedSectionIds;

  // ================= API DATA =================
  const { data: testDetail, isLoading: isLoadingTest, isError: isTestError } = useGetTest(testId);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [sectionDetail, setSectionDetail] = useState<SectionDetailResponse | null>(null);
  const [attemptDetail, setAttemptDetail] = useState<AttemptDetailResponse | null>(null);

  // Current section ID derived from test detail (filtered for custom mode)
  const allSections = testDetail?.sections ?? [];
  const sections = isCustomMode && selectedSectionIds
    ? allSections.filter((s) => selectedSectionIds.includes(s.id))
    : allSections;
  const currentSectionInfo = sections[currentSectionIdx];
  const currentSectionId = currentSectionInfo?.id;

  // Fetch section detail
  const {
    data: fetchedSection,
    isLoading: isLoadingSection,
    refetch: refetchSection,
  } = useGetSection(
    { testId: testId!, sectionId: currentSectionId! },
    { enabled: !!testId && !!currentSectionId }
  );

  // Update section detail when fetched
  useEffect(() => {
    if (fetchedSection) {
      setSectionDetail(fetchedSection);
    }
  }, [fetchedSection]);

  // Questions from current section (shuffled + limited in random mode)
  const [shuffledQuestions, setShuffledQuestions] = useState<QuestionResponse[]>([]);

  useEffect(() => {
    const raw = sectionDetail?.questions ?? [];
    if (raw.length === 0) {
      setShuffledQuestions([]);
      return;
    }
    if (isRandomMode) {
      const shuffled = [...raw].sort(() => Math.random() - 0.5);
      setShuffledQuestions(shuffled.slice(0, 3));
    } else {
      setShuffledQuestions(raw);
    }
  }, [sectionDetail, isRandomMode]);

  const questions = shuffledQuestions;
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const currentQuestion = questions[currentQuestionIdx];

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

    return () => { cancelled = true; };
  }, [sectionDetail]);

  // Fetch question-level image URLs (Part 1.2 has 2 images)
  const { data: questionImageData } = useGetDownloadUrl(
    currentQuestion?.promptImageAssetId ?? null,
    { enabled: !!currentQuestion?.promptImageAssetId }
  );
  const { data: questionImage2Data } = useGetDownloadUrl(
    currentQuestion?.settings?.image2AssetId ?? null,
    { enabled: !!currentQuestion?.settings?.image2AssetId }
  );
  const promptImageUrl = questionImageData?.downloadUrl ?? null;
  const promptImage2Url = questionImage2Data?.downloadUrl ?? null;

  // ================= UI STATE =================
  const [status, setStatus] = useState<ExamStatus>(ExamStatus.IDLE);
  const [displayTime, setDisplayTime] = useState(0);
  const [timeProgress, setTimeProgress] = useState(1);
  const [isMicAllowed, setIsMicAllowed] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState(false);

  // ================= REFS =================
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveformAnimationRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const attemptIdRef = useRef<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    attemptIdRef.current = attemptId;
  }, [attemptId]);

  // ================= MUTATIONS =================
  const { mutateAsync: startAttemptMutation } = useStartAttempt();
  const { mutateAsync: upsertResponseMutation } = useUpsertResponse();
  const { mutateAsync: submitSectionMutation } = useSubmitSection();
  const { mutateAsync: submitAttemptMutation } = useSubmitAttempt();
  const { mutateAsync: presignUploadMutation } = usePresignUpload();
  const { mutateAsync: uploadToS3Mutation } = useUploadToS3();

  // ================= CLEANUP =================
  const cleanupAll = useCallback(() => {
    try {
      console.log('🧹 Starting cleanup...');
      stopAllAudio();

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
      console.log('✅ All audio and resources cleaned up');
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
  const uploadAudioAndSubmitResponse = async (
    audioBlob: Blob,
    aId: string,
    questionId: string,
  ) => {
    try {
      console.log('📤 Uploading audio response...', { attemptId: aId, questionId, size: audioBlob.size });

      // 1. Get presigned upload URL
      const presign = await presignUploadMutation({
        assetType: 'AUDIO',
        mimeType: 'audio/webm',
        contextType: 'speaking_response',
        attemptId: aId,
        questionId,
      });

      console.log('📋 Got presigned URL, uploading to S3...');

      // 2. Upload to S3
      await uploadToS3Mutation({
        uploadUrl: presign.uploadUrl,
        file: audioBlob,
        headers: presign.headers,
      });

      console.log('✅ Uploaded to S3, saving response...');

      // 3. Save response
      await upsertResponseMutation({
        attemptId: aId,
        questionId,
        answer: { assetId: presign.assetId },
      });

      console.log('✅ Response saved successfully');
    } catch (error) {
      console.error('❌ Failed to upload/save response:', error);
      // Don't block exam flow on upload failure
    }
  };

  // ================= QUESTION FLOW =================
  const runQuestion = async (q: QuestionResponse) => {
    if (runningRef.current) return;
    runningRef.current = true;

    const prepTime = q.settings?.prepTime ?? DEFAULT_PREP_TIME;
    const recordTime = q.settings?.recordTime ?? DEFAULT_RECORD_TIME;

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
            console.log('🔊 Recording completed:', { size: audioBlob.size, chunks: chunks.length });
            resolve(audioBlob);
          };
        });

        recorder.start();
        console.log('🎙️ Recording started');

        await startTimer(recordTime);
        await playBeep();

        if (recorder.state === 'recording') {
          recorder.stop();
          console.log('🎙️ Recording stopped');
        }

        // Wait for the blob and upload
        const audioBlob = await recordingPromise;

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
            console.log('✅ Section submitted');
          } catch (error) {
            console.error('❌ Section submit failed:', error);
          }
        }

        if (currentSectionIdx < sections.length - 1) {
          // More sections to go - automatically move to next section
          console.log(`✅ Section ${currentSectionIdx + 1} completed, moving to next`);
          setCurrentSectionIdx((i) => i + 1);
          setCurrentQuestionIdx(0);
          setSectionDetail(null);
          setStatus(ExamStatus.IDLE);
        } else {
          // All sections done - submit attempt
          console.log('🎉 All sections completed!');
          setIsSubmittingAttempt(true);
          setStatus(ExamStatus.FINISHED);

          if (attemptIdRef.current) {
            try {
              await submitAttemptMutation(attemptIdRef.current);
              console.log('✅ Attempt submitted');
            } catch (error) {
              console.error('❌ Attempt submit failed:', error);
            }
          }
          setIsSubmittingAttempt(false);
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
    if (currentSectionIdx < sections.length - 1) {
      setCurrentSectionIdx((i) => i + 1);
      setCurrentQuestionIdx(0);
      setSectionDetail(null);
      setStatus(ExamStatus.IDLE);
      runningRef.current = false;
    } else {
      setStatus(ExamStatus.FINISHED);
    }
  }, [currentSectionIdx, sections.length]);

  // ================= FINISH (CUSTOM MODE) =================
  const handleFinishExam = useCallback(async () => {
    cleanupAll();
    if (attemptIdRef.current) {
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
  }, [cleanupAll, currentSectionId, submitSectionMutation, submitAttemptMutation, navigate]);

  // ================= START EXAM =================
  const handleStartExam = useCallback(async () => {
    if (!testId) return;

    try {
      const result = await startAttemptMutation({ testId, sectionId: undefined });
      setAttemptId(result.attemptId);
      attemptIdRef.current = result.attemptId;
      setIsStarted(true);
      console.log('✅ Attempt started:', result.attemptId);
    } catch (error) {
      console.error('❌ Failed to start attempt:', error);
      alert('Imtihonni boshlashda xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  }, [testId, startAttemptMutation]);

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
  }, [isStarted, currentQuestionIdx, currentSectionIdx, status, isSaving, isLoadingSection, sectionDetail]);

  // ================= MIC PERMISSION =================
  const requestMic = async () => {
    try {
      console.log('🎤 Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone access granted');

      micStreamRef.current = stream;
      setIsMicAllowed(true);

      // Expose for debugging
      (window as any).audioChunks = audioChunksRef.current;
    } catch (error) {
      console.error('❌ Microphone access denied:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Microphone access failed: ${errorMessage}. Microphone access is required for the speaking exam.`);
    }
  };

  const getTimerColor = (p: number) => {
    if (p > 0.6) return '#22c55e';
    if (p > 0.3) return '#facc15';
    return '#ef4444';
  };

  // ================= LOADING / ERROR STATES =================
  if (isLoadingTest) {
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

  if (isTestError || !testDetail) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-black" />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
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
    return (
      <StartExamScreen
        testTitle={testDetail.title}
        cefrLevel={testDetail.cefrLevel}
        sectionCount={sections.length}
        instructions={testDetail.instructions}
        onStart={handleStartExam}
        onBack={() => navigate('/mock-exam')}
      />
    );
  }

  if (status === ExamStatus.FINISHED) {
    return (
      <FinishedScreen
        onGoToResults={() => navigate('/history')}
        attempt={attemptDetail}
        isSubmitting={isSubmittingAttempt}
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
    <div className="relative min-h-screen pt-24 sm:pt-28 md:pt-32 px-4 md:px-10 pb-4 md:pb-10 flex items-center justify-center overflow-hidden">
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
          totalSections={sections.length}
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
        />
      </div>
    </div>
  );
};

export default ExamFlow;
