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
      setStatus('READING');
      try {
        await playTTS(`${q.topic}. ${q.text || ''}`);
      } catch (error) {
        console.error('TTS Error:', error);
        alert('Failed to play audio. Please check your audio settings.');
      }
      await playBeep();

      if (q.prepTime > 0) {
        setStatus('PREPARING');
        await startTimer(q.prepTime);
        await playBeep();
      }

      setStatus('RECORDING');
      await startTimer(q.recordTime);
      await playBeep();

      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx((i) => i + 1);
        setStatus('IDLE');
      } else {
        setStatus('IDLE');
      }
    } catch (error) {
      console.error('Question flow error:', error);
      alert('An error occurred during the exam. Please try again.');
      setStatus('IDLE');
    } finally {
      runningRef.current = false;
    }
  };

  // ---------------- TRIGGER ----------------
  useEffect(() => {
    if (!isStarted) return;
    if (!currentQuestion) return;
    if (status !== 'IDLE') return;
    if (runningRef.current) return;

    runQuestion(currentQuestion);
  }, [isStarted, currentQuestionIdx, currentPartIdx]);

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
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          console.log('🎙️ Recording data chunk:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        console.log('🔊 Recording completed:', {
          size: audioBlob.size,
          type: audioBlob.type,
          duration: 'calculating...',
        });

        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('🔗 Audio URL:', audioUrl);
      };

      mediaRecorderRef.current = mediaRecorder;
      (window as any).mediaRecorder = mediaRecorder;
      (window as any).audioChunks = audioChunks;

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
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-10 flex items-center justify-center overflow-hidden relative">
      {/* Enhanced Back Button */}
      <button
        onClick={() => {
          cleanupAll();
          navigate(-1);
        }}
        className="absolute top-6 left-6 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-4 rounded-full shadow-xl transition-all z-10 group flex items-center gap-2">
        <svg
          className="w-6 h-6 group-hover:-translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back</span>
      </button>

      <div className="max-w-5xl w-full flex flex-col gap-10">
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
          waveformCanvasRef={null}
          onNextPart={() => setCurrentPartIdx((i) => i + 1)}
        />
      </div>
    </div>
  );
};

export default ExamFlow;
