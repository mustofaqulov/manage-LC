import lamejs from '@breezystack/lamejs';

self.onmessage = (e: MessageEvent) => {
  const { channelData, sampleRate, numChannels } = e.data as {
    channelData: Float32Array[];
    sampleRate: number;
    numChannels: number;
  };

  const kbps = 128;
  const encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, kbps);
  const mp3Data: Uint8Array[] = [];
  const blockSize = 1152;

  const left = channelData[0];
  const right = numChannels > 1 ? channelData[1] : null;

  // Float32 → Int16
  const toInt16 = (float: Float32Array): Int16Array => {
    const int = new Int16Array(float.length);
    for (let i = 0; i < float.length; i++) {
      const s = Math.max(-1, Math.min(1, float[i]));
      int[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int;
  };

  const leftInt = toInt16(left);
  const rightInt = right ? toInt16(right) : null;

  for (let i = 0; i < left.length; i += blockSize) {
    const lChunk = leftInt.subarray(i, i + blockSize);
    const rChunk = rightInt ? rightInt.subarray(i, i + blockSize) : lChunk;
    const buf = rightInt
      ? encoder.encodeBuffer(lChunk, rChunk)
      : encoder.encodeBuffer(lChunk);
    if (buf.length > 0) mp3Data.push(new Uint8Array(buf));
  }

  const end = encoder.flush();
  if (end.length > 0) mp3Data.push(new Uint8Array(end));

  self.postMessage({ mp3Data });
};
