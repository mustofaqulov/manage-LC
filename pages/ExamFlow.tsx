import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  const [currentPartIdx, setCurrentPartIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [status, setStatus] = useState<'IDLE' | 'READING' | 'PREPARING' | 'RECORDING' | 'FINISHED'>(
    'IDLE',
  );
  const [displayTime, setDisplayTime] = useState(0);
  const [parts, setParts] = useState<ExamPart[]>([]);
  const [isMicrophoneAllowed, setIsMicrophoneAllowed] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(false);

  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(null);
  const isExecutingRef = useRef(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const [timeProgress, setTimeProgress] = useState(1);

  const getTimerColor = (p: number) => {
    if (p > 0.6) return '#22c55e';
    if (p > 0.3) return '#facc15';
    return '#ef4444';
  };

  useEffect(() => {
    if (mode === ExamMode.FULL) {
      setParts([ExamPart.PART_1_1, ExamPart.PART_1_2, ExamPart.PART_2, ExamPart.PART_3]);
    } else if (mode === ExamMode.RANDOM) {
      setParts([ExamPart.PART_1_1, ExamPart.PART_1_2]);
    }
  }, [mode]);

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      setIsMicrophoneAllowed(true);
    } catch (err) {
      console.error('Mic Error:', err);
      alert('Microphone access is mandatory for the speaking exam.');
    }
  };

  const currentPart = parts[currentPartIdx];
  const questionsInPart = currentPart ? MOCK_QUESTIONS[currentPart] : [];
  const currentQuestion: Question | undefined = questionsInPart[currentQuestionIdx];

  const startExamTimer = (seconds: number): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const durationMs = seconds * 1000;

      const update = (now: number) => {
        const elapsed = now - startTime;
        const remainingMs = Math.max(0, durationMs - elapsed);

        const progress = remainingMs / durationMs; // 1.0 dan 0.0 gacha
        const secondsLeft = Math.ceil(remainingMs / 1000);

        setTimeProgress(progress);
        setDisplayTime(secondsLeft);

        if (remainingMs > 0) {
          animationFrameRef.current = requestAnimationFrame(update);
        } else {
          resolve();
        }
      };

      animationFrameRef.current = requestAnimationFrame(update);
    });
  };

  const drawWaveform = useCallback(() => {
    if (!waveformCanvasRef.current || !analyserRef.current) return;

    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (status !== 'RECORDING') return;

      analyserRef.current!.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height * 0.8);
        ctx.fillStyle = '#ff7300';
        const radius = barWidth / 2;
        const yStart = (canvas.height - barHeight) / 2;
        ctx.beginPath();
        ctx.roundRect(x, yStart, barWidth, barHeight, [radius]);
        ctx.fill();
        x += barWidth + 2;
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  }, [status]);

  useEffect(() => {
    if (status === 'RECORDING') {
      drawWaveform();
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [status, drawWaveform]);

  const runQuestionCycle = useCallback(
    async (q: Question) => {
      if (isExecutingRef.current) return;
      isExecutingRef.current = true;

      try {
        // 1. READING STATUS
        setStatus('READING');
        let prompt = `${q.topic}. ${q.text || ''}`;

        // TTS ni chaqiramiz (endi izohda emas)
        await playTTS(prompt);
        await playBeep();

        // 2. PREPARING STATUS
        if (q.prepTime > 0) {
          setStatus('PREPARING');
          await startExamTimer(q.prepTime);
          await playBeep();
        }

        // 3. RECORDING STATUS
        setStatus('RECORDING');
        await startExamTimer(q.recordTime);
        await playBeep();

        // Navbatdagi savolga o'tish
        isExecutingRef.current = false;
        if (currentQuestionIdx < questionsInPart.length - 1) {
          setCurrentQuestionIdx((prev) => prev + 1);
        } else {
          // Part tugadi, foydalanuvchi "Next Part"ni bosishini kutamiz
          setStatus('IDLE');
        }
      } catch (error) {
        console.error('Exam cycle error:', error);
        isExecutingRef.current = false;
      }
    },
    [currentQuestionIdx, questionsInPart.length],
  );

  useEffect(() => {
    if (!isExamStarted || !currentQuestion || isExecutingRef.current || status === 'FINISHED')
      return;

    // Faqat IDLE holatda yoki yangi savolga o'tganda boshlash
    if (status === 'IDLE' || (currentQuestionIdx >= 0 && !isExecutingRef.current)) {
      // Agar part tugagan bo'lsa (IDLE va oxirgi savol), boshlamaslik kerak
      if (
        !(
          status === 'IDLE' &&
          currentQuestionIdx === questionsInPart.length - 1 &&
          currentQuestionIdx !== 0
        )
      ) {
        runQuestionCycle(currentQuestion);
      }
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    isExamStarted,
    currentQuestionIdx,
    currentPartIdx,
    status,
    currentQuestion,
    runQuestionCycle,
    questionsInPart.length,
  ]);

  const handleStartExam = () => {
    // Audio kontekstni uyg'otish
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctx.resume();
    setIsExamStarted(true);
  };

  const handleNextPart = () => {
    if (currentPartIdx < parts.length - 1) {
      setCurrentPartIdx((prev) => prev + 1);
      setCurrentQuestionIdx(0);
      setStatus('IDLE');
      isExecutingRef.current = false;
    } else {
      setStatus('FINISHED');
    }
  };

  const handleExit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExamStarted && status !== 'FINISHED') {
      if (window.confirm('Are you sure you want to exit the exam? All progress will be lost.')) {
        navigate('/mock-exam');
      }
    } else {
      navigate('/mock-exam');
    }
  };

  if (!isMicrophoneAllowed) {
    return (
      <MicPermissionScreen
        onEnableMicrophone={requestMicPermission}
        onCancel={() => navigate('/mock-exam')}
      />
    );
  }

  if (!isExamStarted) {
    return (
      <StartExamScreen
        mode={mode}
        partsCount={parts.length}
        onStart={handleStartExam}
        onBack={() => navigate('/mock-exam')}
      />
    );
  }

  if (status === 'FINISHED') {
    return <FinishedScreen onGoToResults={() => navigate('/history')} />;
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-10 flex items-center justify-center overflow-hidden">
      <div className="max-w-5xl w-full flex flex-col gap-10">
        <ExamHeader
          currentPartIdx={currentPartIdx}
          currentQuestionIdx={currentQuestionIdx}
          questionsCount={questionsInPart.length}
          currentPart={currentPart}
          status={status}
          displayTime={displayTime}
          timeProgress={timeProgress}
          getTimerColor={getTimerColor}
          onExit={handleExit}
        />

        <ExamBody
          status={status}
          currentQuestion={currentQuestion}
          currentPart={currentPart}
          waveformCanvasRef={waveformCanvasRef}
          onNextPart={handleNextPart}
        />

        <div className="text-center px-10">
          <p className="text-zinc-400 font-bold text-sm tracking-tight leading-relaxed max-w-2xl mx-auto">
            Please speak clearly into the microphone. Ensure you are in a quiet environment for the
            best evaluation results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamFlow;
