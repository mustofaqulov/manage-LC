/**
 * Audio Converter — FFmpeg.wasm orqali WebM → MP3
 * Core WASM CDN'dan yuklanadi (birinchi marta ~25MB, keyin brauzer cache'da)
 */
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const CORE_BASE = 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/esm';

let ffInstance: FFmpeg | null = null;

const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffInstance?.loaded) return ffInstance;
  const ff = new FFmpeg();
  await ff.load({
    coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  ffInstance = ff;
  return ff;
};

/**
 * Bir nechta WebM blob'larni bitta MP3 ga birlashtirish
 */
export const combineAudioToMp3 = async (
  blobs: Blob[],
  onProgress?: (progress: number) => void,
): Promise<Blob> => {
  if (blobs.length === 0) throw new Error('No audio blobs provided');

  if (onProgress) onProgress(0.05);

  const ff = await loadFFmpeg();

  if (onProgress) onProgress(0.3);

  // Input fayllarni yozish
  for (let i = 0; i < blobs.length; i++) {
    await ff.writeFile(`in${i}.webm`, await fetchFile(blobs[i]));
  }

  if (onProgress) onProgress(0.5);

  if (blobs.length === 1) {
    await ff.exec(['-i', 'in0.webm', '-codec:a', 'libmp3lame', '-q:a', '2', 'out.mp3']);
  } else {
    // Concat demuxer — bir nechta WebM'ni ketma-ket birlashtirish
    const list = blobs.map((_, i) => `file 'in${i}.webm'`).join('\n');
    await ff.writeFile('list.txt', list);
    await ff.exec([
      '-f', 'concat', '-safe', '0', '-i', 'list.txt',
      '-codec:a', 'libmp3lame', '-q:a', '2',
      'out.mp3',
    ]);
    ff.deleteFile('list.txt').catch(() => {});
  }

  if (onProgress) onProgress(0.9);

  const data = await ff.readFile('out.mp3') as Uint8Array;

  // Cleanup
  for (let i = 0; i < blobs.length; i++) ff.deleteFile(`in${i}.webm`).catch(() => {});
  ff.deleteFile('out.mp3').catch(() => {});

  if (onProgress) onProgress(1);

  return new Blob([data], { type: 'audio/mpeg' });
};

/**
 * MP3 faylni yuklab olish
 */
export const downloadMp3 = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
