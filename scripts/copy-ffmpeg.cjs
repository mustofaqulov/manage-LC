const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../node_modules/@ffmpeg/core/dist/esm');
const dest = path.join(__dirname, '../public');

try {
  fs.copyFileSync(path.join(src, 'ffmpeg-core.js'), path.join(dest, 'ffmpeg-core.js'));
  fs.copyFileSync(path.join(src, 'ffmpeg-core.wasm'), path.join(dest, 'ffmpeg-core.wasm'));
  console.log('FFmpeg core files copied to public/');
} catch (e) {
  console.warn('Could not copy FFmpeg core files:', e.message);
}
