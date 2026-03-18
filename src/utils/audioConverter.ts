/**
 * Audio Converter — WebM → MP3
 * AudioContext (native) orqali decode + lamejs Worker orqali encode.
 * FFmpeg kerak emas. 1 daqiqalik audio ~1-2s ichida tayyor.
 */

async function decodeToPcm(blobs: Blob[]): Promise<{
  channelData: Float32Array[];
  sampleRate: number;
  numChannels: number;
}> {
  const ctx = new AudioContext();

  const buffers = await Promise.all(
    blobs.map(async (blob) => {
      const ab = await blob.arrayBuffer();
      return ctx.decodeAudioData(ab);
    }),
  );

  await ctx.close();

  if (buffers.length === 1) {
    const b = buffers[0];
    const channelData: Float32Array[] = [];
    for (let i = 0; i < b.numberOfChannels; i++) channelData.push(b.getChannelData(i));
    return { channelData, sampleRate: b.sampleRate, numChannels: b.numberOfChannels };
  }

  // Ko'p buffer — OfflineAudioContext da birlashtirish
  const totalLength = buffers.reduce((s, b) => s + b.length, 0);
  const { sampleRate, numberOfChannels } = buffers[0];
  const offline = new OfflineAudioContext(numberOfChannels, totalLength, sampleRate);

  let startSample = 0;
  for (const buf of buffers) {
    const src = offline.createBufferSource();
    src.buffer = buf;
    src.connect(offline.destination);
    src.start(startSample / sampleRate);
    startSample += buf.length;
  }

  const rendered = await offline.startRendering();
  const channelData: Float32Array[] = [];
  for (let i = 0; i < rendered.numberOfChannels; i++) channelData.push(rendered.getChannelData(i));
  return { channelData, sampleRate, numChannels: numberOfChannels };
}

function encodeMp3InWorker(
  channelData: Float32Array[],
  sampleRate: number,
  numChannels: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./mp3Encoder.worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (e: MessageEvent) => {
      const { mp3Data } = e.data as { mp3Data: Uint8Array[] };
      worker.terminate();
      resolve(new Blob(mp3Data, { type: 'audio/mpeg' }));
    };

    worker.onerror = (err) => {
      worker.terminate();
      reject(err);
    };

    // Transferable objects orqali — copy yo'q, tez
    const transfers = channelData.map((ch) => ch.buffer);
    worker.postMessage({ channelData, sampleRate, numChannels }, transfers);
  });
}

export const combineAudioToMp3 = async (blobs: Blob[]): Promise<Blob> => {
  if (blobs.length === 0) throw new Error('No audio blobs');
  const { channelData, sampleRate, numChannels } = await decodeToPcm(blobs);
  return encodeMp3InWorker(channelData, sampleRate, numChannels);
};

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
