import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExamMode, ExamPart, Question, ExamStatus } from '../types';
import { MOCK_QUESTIONS } from '../constants';
import { playTTS, playBeep, stopAllAudio } from '../services/geminiService';
import MicPermissionScreen from '../components/examflow/MicPermissionScreen';
import StartExamScreen from '../components/examflow/StartExamScreen';
import FinishedScreen from '../components/examflow/FinishedScreen';
import ExamHeader from '../components/examflow/ExamHeader';
import ExamBody from '../components/examflow/ExamBody';

const ExamFlow: React.FC = () => {
  const { mode } = useParams<{ mode: ExamMode }>();
  const navigate = useNavigate();

  const [parts, setParts] = useState<ExamPart[]>([]);
  const [currentPartIdx, setCurrentPartIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const [status, setStatus] = useState<ExamStatus>(ExamStatus.IDLE);
  const [displayTime, setDisplayTime] = useState(0);
  const [timeProgress, setTimeProgress] = useState(1);

  const [isMicAllowed, setIsMicAllowed] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cleanup barcha audio va resurslarni
  const cleanupAll = () => {
    try {
      console.log('🧹 Starting cleanup...');

      // Gemini service'dan barcha audio'ni to'xtatish (TTS + Beep)
      stopAllAudio();

      // MediaRecorder ni to'xtatish
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        console.log('  - Stopped MediaRecorder');
      }

      // Microphone stream tracklarini to'xtatish
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        micStreamRef.current = null;
        console.log('  - Stopped microphone stream');
      }

      // RAF timerni bekor qilish
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        console.log('  - Cancelled RAF timer');
      }

      runningRef.current = false;

      console.log('✅ All audio and resources cleaned up');
    } catch (error) {
      console.warn('⚠️ Cleanup error:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAll();
    };
  }, []);

  // Parts
  useEffect(() => {
    if (mode === ExamMode.FULL) {
      setParts([ExamPart.PART_1_1, ExamPart.PART_1_2, ExamPart.PART_2, ExamPart.PART_3]);
    } else if (mode === ExamMode.RANDOM) {
      // Random mode: har qismdan random savollar
      const allParts = [ExamPart.PART_1_1, ExamPart.PART_1_2, ExamPart.PART_2, ExamPart.PART_3];
      setParts(allParts);
    } else {
      setParts([ExamPart.PART_1_1, ExamPart.PART_1_2]);
    }
  }, [mode]);

  const currentPart = parts[currentPartIdx];
  const allQuestions = currentPart ? MOCK_QUESTIONS[currentPart] : [];

  // Random mode uchun savollarni aralashtirish
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (mode === ExamMode.RANDOM && allQuestions.length > 0) {
      // Savollarni random tartibda aralashtirish
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      setShuffledQuestions(shuffled.slice(0, Math.min(3, shuffled.length))); // Max 3 savol
    } else {
      setShuffledQuestions(allQuestions);
    }
  }, [allQuestions, mode]);

  const questions = mode === ExamMode.RANDOM ? shuffledQuestions : allQuestions;
  const currentQuestion = questions[currentQuestionIdx];

  // ---------------- TIMER ENGINE ----------------
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

  // ---------------- QUESTION FLOW ----------------
  const runQuestion = async (q: Question) => {
    if (runningRef.current) return;
    runningRef.current = true;

    try {
      // READING phase
      setStatus('READING');
      try {
        await playTTS(`${q.topic}. ${q.text || ''}`);
      } catch (error) {
        console.error('TTS Error:', error);
        alert('Failed to play audio. Please check your audio settings.');
      }
      await playBeep();

      // PREPARING phase
      if (q.prepTime > 0) {
        setStatus('PREPARING');
        await startTimer(q.prepTime);
        await playBeep();
      }

      // RECORDING phase - Start MediaRecorder
      setStatus('RECORDING');
      audioChunksRef.current = []; // Reset chunks for new recording

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        try {
          mediaRecorderRef.current.start();
          console.log('🎙️ Recording started');
        } catch (error) {
          console.error('Failed to start recording:', error);
        }
      }

      await startTimer(q.recordTime);
      await playBeep();

      // Stop MediaRecorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
          console.log('🎙️ Recording stopped');
        } catch (error) {
          console.error('Failed to stop recording:', error);
        }
      }

      // Move to next question or next part
      if (currentQuestionIdx < questions.length - 1) {
        // More questions in current part
        setCurrentQuestionIdx((i) => i + 1);
        setStatus('IDLE');
      } else {
        // Finished all questions in this part
        const nextPart = parts[currentPartIdx + 1];

        if (currentPartIdx < parts.length - 1) {
          console.log(`✅ Part ${currentPart} completed, next part: ${nextPart}`);

          // Check if we need to show "Continue" button
          // PART_1_1 → PART_1_2: automatic
          // PART_1_2 → PART_2: show Continue button
          // PART_2 → PART_3: show Continue button
          if (currentPart === ExamPart.PART_1_1 && nextPart === ExamPart.PART_1_2) {
            // Automatically move to PART_1_2
            setStatus('IDLE');
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setCurrentPartIdx((i) => i + 1);
            setCurrentQuestionIdx(0);
          } else {
            // Show "Section Complete" screen with Continue button
            setStatus('SECTION_COMPLETE');
          }
        } else {
          // All parts completed - mark as FINISHED
          console.log('🎉 All parts completed!');
          setStatus('FINISHED');
        }
      }
    } catch (error) {
      console.error('Question flow error:', error);
      alert('An error occurred during the exam. Please try again.');
      setStatus('IDLE');
    } finally {
      runningRef.current = false;
    }
  };

  // ---------------- WAVEFORM ANIMATION ----------------
  useEffect(() => {
    if (status !== 'RECORDING' || !waveformCanvasRef.current) return;

    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bars = 60;
    const barWidth = canvas.width / bars;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ef4444';

      for (let i = 0; i < bars; i++) {
        const height = Math.random() * canvas.height * 0.8;
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;

        ctx.fillRect(x, y, barWidth - 2, height);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [status]);

  // ---------------- NEXT PART HANDLER ----------------
  const handleNextPart = () => {
    if (currentPartIdx < parts.length - 1) {
      setCurrentPartIdx((i) => i + 1);
      setCurrentQuestionIdx(0);
      setStatus('IDLE');
      runningRef.current = false;
    } else {
      setStatus('FINISHED');
    }
  };

  // ---------------- TRIGGER ----------------
  useEffect(() => {
    if (!isStarted) return;
    if (!currentQuestion) return;
    if (status !== 'IDLE') return;
    if (runningRef.current) return;

    runQuestion(currentQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarted, currentQuestionIdx, currentPartIdx, status]);

  // ---------------- MIC ----------------
  const requestMic = async () => {
    try {
      console.log('🎤 Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone access granted');
      console.log('📊 Stream info:', {
        tracks: stream.getTracks().length,
        track: stream.getAudioTracks()[0]?.getSettings(),
        enabled: stream.getAudioTracks()[0]?.enabled,
      });

      // Stream'ni ref'da saqlash
      micStreamRef.current = stream;
      setIsMicAllowed(true);

      // Recordingni boshlash uchun
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('🎙️ Recording data chunk:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('🔊 Recording completed:', {
          size: audioBlob.size,
          type: audioBlob.type,
          chunks: audioChunksRef.current.length,
        });

        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('🔗 Audio URL:', audioUrl);

        // TODO: Send audioBlob to scoring service
      };

      mediaRecorderRef.current = mediaRecorder;
      (window as any).mediaRecorder = mediaRecorder;
      (window as any).audioChunks = audioChunksRef.current;

      console.log('🎬 MediaRecorder initialized:', mediaRecorder.state);
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

  if (!isMicAllowed)
    return (
      <MicPermissionScreen
        onEnableMicrophone={requestMic}
        onCancel={() => navigate('/mock-exam')}
      />
    );
  if (!isStarted)
    return (
      <StartExamScreen
        mode={mode}
        partsCount={parts.length}
        onStart={() => setIsStarted(true)}
        onBack={() => navigate('/mock-exam')}
      />
    );
  if (status === 'FINISHED') return <FinishedScreen onGoToResults={() => navigate('/history')} />;

  return (
    <div className="relative min-h-screen p-4 md:p-10 flex items-center justify-center overflow-hidden">
      {/* Dark immersive background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,140,0,0.10),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(239,68,68,0.08),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.06),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />

      <div className="relative z-10 max-w-5xl w-full flex flex-col gap-8">
        <ExamHeader
          currentPartIdx={currentPartIdx}
          currentQuestionIdx={currentQuestionIdx}
          questionsCount={questions.length}
          currentPart={currentPart}
          status={status}
          displayTime={displayTime}
          timeProgress={timeProgress}
          getTimerColor={getTimerColor}
          onExit={() => {
            cleanupAll();
            navigate('/mock-exam');
          }}
        />

        <ExamBody
          status={status}
          currentQuestion={currentQuestion}
          currentPart={currentPart}
          waveformCanvasRef={waveformCanvasRef}
          onNextPart={handleNextPart}
        />
      </div>
    </div>
  );
};

export default ExamFlow;
