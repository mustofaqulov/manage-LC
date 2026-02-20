/**
 * Audio Converter Utility
 * Bir nechta WebM audio blob'larni decode qilib MP3 ga birlashtirish
 */

/**
 * Float32Array PCM ma'lumotlarini Int16Array ga aylantirish (lamejs uchun)
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
 * Bitta Blob'ni AudioContext orqali decode qilish
 */
const decodeBlob = async (blob: Blob, audioCtx: AudioContext): Promise<AudioBuffer> => {
  const arrayBuffer = await blob.arrayBuffer();
  return audioCtx.decodeAudioData(arrayBuffer);
};

/**
 * AudioBuffer'larni birlashtirish
 */
const mergeAudioBuffers = (buffers: AudioBuffer[], sampleRate: number): Float32Array[] => {
  const channels = Math.max(...buffers.map((b) => b.numberOfChannels));
  const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);

  const result: Float32Array[] = [];
  for (let c = 0; c < channels; c++) {
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
      const channelData = c < buf.numberOfChannels ? buf.getChannelData(c) : buf.getChannelData(0);
      merged.set(channelData, offset);
      offset += buf.length;
    }
    result.push(merged);
  }
  return result;
};

/**
 * Bir nechta WebM audio blob'larni bitta MP3 ga birlashtirish
 */
export const combineAudioToMp3 = async (
  blobs: Blob[],
  onProgress?: (progress: number) => void,
): Promise<Blob> => {
  if (blobs.length === 0) {
    throw new Error('No audio blobs provided');
  }

  const { Mp3Encoder } = await import('lamejs');

  if (onProgress) onProgress(0.05);

  // Barcha bloblarni decode qilish
  const audioCtx = new AudioContext();
  const audioBuffers: AudioBuffer[] = [];

  for (let i = 0; i < blobs.length; i++) {
    try {
      const buffer = await decodeBlob(blobs[i], audioCtx);
      audioBuffers.push(buffer);
    } catch {
      console.warn(`Audio blob ${i + 1} decode failed, skipping`);
    }
    if (onProgress) onProgress(0.05 + (i + 1) / blobs.length * 0.5);
  }

  await audioCtx.close();

  if (audioBuffers.length === 0) {
    throw new Error('No audio could be decoded');
  }

  const sampleRate = audioBuffers[0].sampleRate;
  const channelCount = Math.min(2, Math.max(...audioBuffers.map((b) => b.numberOfChannels)));

  // PCM ma'lumotlarini birlashtirish
  const mergedChannels = mergeAudioBuffers(audioBuffers, sampleRate);

  if (onProgress) onProgress(0.6);

  // MP3 encode qilish (128kbps)
  const encoder = new Mp3Encoder(channelCount, sampleRate, 128);
  const chunkSize = 1152;
  const mp3Chunks: Int8Array[] = [];

  const leftPcm = floatToInt16(mergedChannels[0]);
  const rightPcm = channelCount > 1 ? floatToInt16(mergedChannels[1]) : leftPcm;

  const totalSamples = leftPcm.length;
  for (let i = 0; i < totalSamples; i += chunkSize) {
    const left = leftPcm.subarray(i, i + chunkSize);
    const right = rightPcm.subarray(i, i + chunkSize);
    const encoded = encoder.encodeBuffer(left, right);
    if (encoded.length > 0) mp3Chunks.push(encoded);

    if (onProgress && i % (chunkSize * 100) === 0) {
      onProgress(0.6 + (i / totalSamples) * 0.38);
    }
  }

  const finalChunk = encoder.flush();
  if (finalChunk.length > 0) mp3Chunks.push(finalChunk);

  if (onProgress) onProgress(1);

  return new Blob(mp3Chunks, { type: 'audio/mpeg' });
};

/**
 * MP3 faylni yuklab olish
 */
export const downloadMp3 = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
