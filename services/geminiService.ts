import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyDIxqm-fpuHi7GVhJY4i6-HSHpvvrbeGqw');

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
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.3);
  return new Promise((resolve) => setTimeout(resolve, 400));
};
