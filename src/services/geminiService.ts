import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * ⚠️ SECURITY WARNING: Client-side API key usage is NOT recommended for production
 * See SECURITY.md for proper backend proxy implementation
 */
const getApiKey = (): string => {
  // Client-side: window dan olish (Vite define qilingan)
  if (typeof window !== 'undefined' && window.__VITE_GEMINI_API_KEY__) {
    return window.__VITE_GEMINI_API_KEY__;
  }
  // Fallback: Environment variable
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  console.error(
    '⚠️ SECURITY: VITE_GEMINI_API_KEY not configured. ' +
    'For production, use a backend proxy instead of client-side API keys. ' +
    'See SECURITY.md for details.'
  );
  return '';
};

const apiKey = getApiKey();
const genAI = new GoogleGenerativeAI(apiKey);

// Global AudioContext va oscillator tracking
let audioCtx: AudioContext | null = null;
let currentOscillator: OscillatorNode | null = null;
let beepTimeoutId: NodeJS.Timeout | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      throw new Error('AudioContext is not supported in this browser');
    }
    audioCtx = new AudioContextConstructor();
  }
  return audioCtx;
};

export const playTTS = async (text: string): Promise<void> => {
  // To'g'ridan-to'g'ri brauzerning ovoziga o'tish (Gemini API kvotasi tugagan)
  return playNativeTTS(text);
};

// Brauzerning o'zining bepul va tezkor TTS xizmati
const playNativeTTS = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    // Avvalgi o'qishlarni to'xtatish
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Ingliz tili uchun
    utterance.rate = 0.9; // Biroz sekinroq va tushunarli

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
};

export const playBeep = async (): Promise<void> => {
  // Avvalgi beep'ni to'xtatish
  stopBeep();

  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, ctx.currentTime);
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);

  currentOscillator = oscillator;
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.3);

  return new Promise((resolve) => {
    beepTimeoutId = setTimeout(() => {
      currentOscillator = null;
      beepTimeoutId = null;
      resolve();
    }, 400);
  });
};

// Beep'ni to'xtatish funksiyasi
export const stopBeep = (): void => {
  try {

    if (beepTimeoutId) {
      clearTimeout(beepTimeoutId);
      beepTimeoutId = null;
    }

    if (currentOscillator) {
      try {
        currentOscillator.stop();
      } catch (e) {
      }
      currentOscillator = null;
    }
  } catch (error) {
    console.warn('⚠️ Error stopping beep:', error);
  }
};

// Barcha audio resurslarni to'xtatish
export const stopAllAudio = (): void => {
  try {

    // TTS ni to'xtatish
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Beep'ni to'xtatish
    stopBeep();

    // AudioContext'ni suspend qilish va close qilish
    if (audioCtx) {
      try {
        if (audioCtx.state === 'running') {
          audioCtx.suspend();
        }
        if (audioCtx.state !== 'closed') {
          audioCtx.close();
        }
      } catch (e) {
        console.warn('  - Error with AudioContext:', (e as Error).message);
      }
      audioCtx = null;
    }

  } catch (error) {
    console.warn('⚠️ Error stopping all audio:', error);
  }
};

