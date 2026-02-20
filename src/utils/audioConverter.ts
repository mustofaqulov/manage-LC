/**
 * Audio Converter Utility
 * Bir nechta WebM audio blob'larni decode qilib MP3 ga birlashtirish
 */
import { Mp3Encoder } from 'lamejs';

/**
 * Float32Array PCM ma'lumotlarini Int16Array ga aylantirish
 */
const floatToInt16 = (float32: Float32Array): Int16Array => {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = clamped < 0 ? clamped * 32768 : clamped * 32767;
  }
  return int16;
};

/**
 * Bir nechta WebM audio blob'larni bitta MP3 ga birlashtirish.
 * Agar MP3 conversion ishlamasa, WebM blob'lar birlashtiriladi (fallback).
 */
export const combineAudioToMp3 = async (
  blobs: Blob[],
  onProgress?: (progress: number) => void,
): Promise<Blob> => {
  if (blobs.length === 0) {
    throw new Error('No audio blobs provided');
  }

  if (onProgress) onProgress(0.05);

  let audioCtx: AudioContext | null = null;

  try {
    audioCtx = new AudioContext();
    const audioBuffers: AudioBuffer[] = [];

    for (let i = 0; i < blobs.length; i++) {
      try {
        const arrayBuffer = await blobs[i].arrayBuffer();
        if (arrayBuffer.byteLength === 0) {
          console.warn(`Blob ${i + 1} is empty, skipping`);
          continue;
        }
        // slice(0) creates a copy — decodeAudioData consumes the buffer
        const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
        audioBuffers.push(decoded);
      } catch (err) {
        console.warn(`Blob ${i + 1} decode failed, skipping:`, err);
      }
      if (onProgress) onProgress(0.05 + ((i + 1) / blobs.length) * 0.55);
    }

    if (audioBuffers.length === 0) {
      throw new Error('No audio buffers could be decoded');
    }

    const sampleRate = audioBuffers[0].sampleRate;
    const channelCount = Math.min(2, Math.max(...audioBuffers.map((b) => b.numberOfChannels)));

    // Barcha audio'larni birlashtirish
    const totalLength = audioBuffers.reduce((sum, b) => sum + b.length, 0);
    const leftPcmRaw = new Float32Array(totalLength);
    const rightPcmRaw = new Float32Array(totalLength);
    let offset = 0;
    for (const buf of audioBuffers) {
      leftPcmRaw.set(buf.getChannelData(0), offset);
      rightPcmRaw.set(channelCount > 1 ? buf.getChannelData(1) : buf.getChannelData(0), offset);
      offset += buf.length;
    }

    await audioCtx.close();
    audioCtx = null;

    if (onProgress) onProgress(0.65);

    // MP3 encode (128kbps)
    const encoder = new Mp3Encoder(channelCount, sampleRate, 128);
    const chunkSize = 1152;
    const mp3Chunks: Int8Array[] = [];
    const leftPcm = floatToInt16(leftPcmRaw);
    const rightPcm = floatToInt16(rightPcmRaw);

    for (let i = 0; i < leftPcm.length; i += chunkSize) {
      const left = leftPcm.subarray(i, i + chunkSize);
      const right = rightPcm.subarray(i, i + chunkSize);
      const encoded = encoder.encodeBuffer(left, right);
      if (encoded.length > 0) mp3Chunks.push(encoded);

      if (onProgress && i % (chunkSize * 50) === 0) {
        onProgress(0.65 + (i / leftPcm.length) * 0.33);
      }
    }

    const flushed = encoder.flush();
    if (flushed.length > 0) mp3Chunks.push(flushed);

    if (onProgress) onProgress(1);

    return new Blob(mp3Chunks, { type: 'audio/mpeg' });
  } catch (err) {
    if (audioCtx) {
      try { await audioCtx.close(); } catch { /* ignore */ }
    }
    // Fallback: WebM blob'larni birlashtirish
    console.warn('MP3 conversion failed, falling back to WebM concat:', err);
    const mimeType = blobs.find((b) => b.type)?.type || 'audio/webm';
    if (onProgress) onProgress(1);
    return new Blob(blobs, { type: mimeType });
  }
};

/**
 * Audio faylni yuklab olish
 */
export const downloadMp3 = (blob: Blob, filename: string) => {
  // Agar fallback WebM bo'lsa, extension'ni o'zgartirish
  const finalFilename =
    blob.type === 'audio/mpeg' ? filename : filename.replace(/\.mp3$/, '.webm');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
