// Global AudioContext va beep tracking
let audioCtx: AudioContext | null = null;
const activeBeeps = new Map<OscillatorNode, GainNode>();
let beepTimeoutId: ReturnType<typeof setTimeout> | null = null;

const cleanupBeepNode = (oscillator: OscillatorNode): void => {
  const gainNode = activeBeeps.get(oscillator);
  if (!gainNode) return;

  try {
    oscillator.disconnect();
  } catch {}
  try {
    gainNode.disconnect();
  } catch {}

  activeBeeps.delete(oscillator);
};

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
  if (ctx.state === 'suspended') {
    await ctx.resume().catch(() => {});
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, ctx.currentTime);
  // Soft envelope to avoid audio clicks and stuck tone edge-cases
  gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.30);

  activeBeeps.set(oscillator, gainNode);

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (beepTimeoutId) {
        clearTimeout(beepTimeoutId);
        beepTimeoutId = null;
      }
      resolve();
    };

    oscillator.onended = () => {
      cleanupBeepNode(oscillator);
      finish();
    };

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.32);

    // Fallback in case `onended` is not fired by browser
    beepTimeoutId = setTimeout(() => {
      cleanupBeepNode(oscillator);
      finish();
    }, 600);
  });
};

// Beep'ni to'xtatish funksiyasi
export const stopBeep = (): void => {
  try {

    if (beepTimeoutId) {
      clearTimeout(beepTimeoutId);
      beepTimeoutId = null;
    }

    activeBeeps.forEach((gainNode, oscillator) => {
      try {
        oscillator.onended = null;
        oscillator.stop();
      } catch {}
      try {
        oscillator.disconnect();
      } catch {}
      try {
        gainNode.disconnect();
      } catch {}
    });
    activeBeeps.clear();
  } catch (error) {
    console.warn('⚠️ Error stopping beep:', error);
  }
};

// Barcha audio resurslarni to'xtatish
export const stopAllAudio = (): void => {
  try {

    // Beep'ni to'xtatish
    stopBeep();

    // TTS ni to'xtatish
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // AudioContext'ni close qilish
    const ctx = audioCtx;
    audioCtx = null;
    if (ctx) {
      try {
        if (ctx.state !== 'closed') {
          void ctx.close().catch(() => {});
        }
      } catch (e) {
        console.warn('  - Error with AudioContext:', (e as Error).message);
      }
    }

  } catch (error) {
    console.warn('⚠️ Error stopping all audio:', error);
  }
};

