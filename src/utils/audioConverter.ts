/**
 * Audio Converter Utility
 * WebM → MP3 konvertatsiya va bir nechta audio'ni birlashtirish
 */

import lamejs from 'lamejs';

/**
 * Audio blob'ni WAV formatga decode qilish
 */
const decodeAudioBlob = async (blob: Blob): Promise<AudioBuffer> => {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new AudioContext();
  return await audioContext.decodeAudioData(arrayBuffer);
};

/**
 * AudioBuffer'ni MP3 ga encode qilish
 */
const encodeToMp3 = (audioBuffer: AudioBuffer): Blob => {
  const sampleRate = audioBuffer.sampleRate;
  const channels = audioBuffer.numberOfChannels;

  // Mono yoki stereo
  const leftChannel = audioBuffer.getChannelData(0);
  const rightChannel = channels > 1 ? audioBuffer.getChannelData(1) : null;

  // Float32Array'ni Int16Array'ga convert qilish
  const left = new Int16Array(leftChannel.length);
  const right = rightChannel ? new Int16Array(rightChannel.length) : null;

  for (let i = 0; i < leftChannel.length; i++) {
    left[i] = Math.max(-32768, Math.min(32767, leftChannel[i] * 32768));
    if (right && rightChannel) {
      right[i] = Math.max(-32768, Math.min(32767, rightChannel[i] * 32768));
    }
  }

  // MP3 encoder (128 kbps)
  const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
  const mp3Data: Int8Array[] = [];

  const sampleBlockSize = 1152; // MP3 frame size
  for (let i = 0; i < left.length; i += sampleBlockSize) {
    const leftChunk = left.subarray(i, i + sampleBlockSize);
    const rightChunk = right ? right.subarray(i, i + sampleBlockSize) : null;

    const mp3buf = rightChunk
      ? mp3encoder.encodeBuffer(leftChunk, rightChunk)
      : mp3encoder.encodeBuffer(leftChunk);

    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }

  // Flush remaining data
  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  // Combine all MP3 chunks
  const totalLength = mp3Data.reduce((acc, buf) => acc + buf.length, 0);
  const mp3Buffer = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of mp3Data) {
    mp3Buffer.set(buf, offset);
    offset += buf.length;
  }

  return new Blob([mp3Buffer], { type: 'audio/mpeg' });
};

/**
 * Bir nechta audio blob'larni MP3 formatda birlashtirish
 */
export const combineAudioToMp3 = async (
  blobs: Blob[],
  onProgress?: (progress: number) => void,
): Promise<Blob> => {

  if (blobs.length === 0) {
    throw new Error('No audio blobs provided');
  }

  // Har bir blob'ni decode qilish
  const audioBuffers: AudioBuffer[] = [];
  for (let i = 0; i < blobs.length; i++) {
    const buffer = await decodeAudioBlob(blobs[i]);
    audioBuffers.push(buffer);
    if (onProgress) {
      onProgress((i + 1) / (blobs.length + 1)); // +1 for encoding step
    }
  }

  // Barcha audio'larni birlashtirish
  const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.length, 0);
  const sampleRate = audioBuffers[0].sampleRate;
  const channels = audioBuffers[0].numberOfChannels;

  const audioContext = new AudioContext();
  const combinedBuffer = audioContext.createBuffer(channels, totalLength, sampleRate);

  let offset = 0;
  for (const buffer of audioBuffers) {
    for (let channel = 0; channel < channels; channel++) {
      const channelData = buffer.getChannelData(channel);
      combinedBuffer.getChannelData(channel).set(channelData, offset);
    }
    offset += buffer.length;
  }

  // MP3 ga encode qilish
  const mp3Blob = encodeToMp3(combinedBuffer);

  if (onProgress) {
    onProgress(1);
  }

  return mp3Blob;
};

/**
 * MP3 faylni yuklab olish
 */
export const downloadMp3 = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
