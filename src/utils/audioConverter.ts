/**
 * Audio Converter Utility
 * Bir nechta audio blob'larni birlashtirish va yuklab olish
 */

/**
 * Bir nechta audio blob'larni birlashtirish
 */
export const combineAudioToMp3 = async (
  blobs: Blob[],
  onProgress?: (progress: number) => void,
): Promise<Blob> => {
  if (blobs.length === 0) {
    throw new Error('No audio blobs provided');
  }

  if (onProgress) onProgress(0.5);

  const mimeType = blobs[0].type || 'audio/webm';
  const combined = new Blob(blobs, { type: mimeType });

  if (onProgress) onProgress(1);

  return combined;
};

/**
 * Audio faylni yuklab olish
 */
export const downloadMp3 = (blob: Blob, filename: string) => {
  const webmFilename = filename.replace(/\.mp3$/, '.webm');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = webmFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
