import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExamMode, ExamPart, Question } from '../types';
import { MOCK_QUESTIONS } from '../constants';
import { playTTS, playBeep } from '../services/geminiService';
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

  const [status, setStatus] = useState<'IDLE' | 'READING' | 'PREPARING' | 'RECORDING' | 'FINISHED'>(
    'IDLE',
  );
  const [displayTime, setDisplayTime] = useState(0);
  const [timeProgress, setTimeProgress] = useState(1);

  const [isMicAllowed, setIsMicAllowed] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  // Parts
  useEffect(() => {
    if (mode === ExamMode.FULL) {
      setParts([ExamPart.PART_1_1, ExamPart.PART_1_2, ExamPart.PART_2, ExamPart.PART_3]);
    } else {
      setParts([ExamPart.PART_1_1, ExamPart.PART_1_2]);
    }
  }, [mode]);

  const currentPart = parts[currentPartIdx];
  const questions = currentPart ? MOCK_QUESTIONS[currentPart] : [];
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
      await playTTS(`${q.topic}. ${q.text || ''}`);
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
    await navigator.mediaDevices.getUserMedia({ audio: true });
    setIsMicAllowed(true);
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
    <div className="min-h-screen bg-[#f3f4f6] p-10 flex justify-center">
      <div className="max-w-5xl w-full space-y-10">
        <ExamHeader
          currentPartIdx={currentPartIdx}
          currentQuestionIdx={currentQuestionIdx}
          questionsCount={questions.length}
          currentPart={currentPart}
          status={status}
          displayTime={displayTime}
          timeProgress={timeProgress}
          getTimerColor={getTimerColor}
          onExit={() => navigate('/mock-exam')}
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
