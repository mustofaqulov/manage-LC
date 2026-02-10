/**
 * Global type declarations for window object extensions and build-time injected variables
 */

// Vite build-time injected variables
declare global {
  interface Window {
    /**
     * Gemini API key injected at build time via vite.config.ts
     * Used by geminiService
     */
    __VITE_GEMINI_API_KEY__?: string;

    /**
     * MediaRecorder instance for debugging audio recording
     * Exposed by ExamFlow component for development debugging
     */
    mediaRecorder?: MediaRecorder;

    /**
     * Audio chunks array for debugging
     * Contains recorded audio Blob chunks
     */
    audioChunks?: Blob[];

    /**
     * Webkit-prefixed AudioContext for Safari compatibility
     */
    webkitAudioContext?: typeof AudioContext;
  }
}

export {};
