/**
 * Generates public/marketing/hero-demo.webm from workspace-preview.webp (Ken Burns zoom).
 * Replace output with a real App screen recording when available.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = path.join(root, 'public/marketing/workspace-preview.webp');
const output = path.join(root, 'public/marketing/hero-demo.webm');

if (!fs.existsSync(input)) {
  console.error(`Missing input: ${input}`);
  process.exit(1);
}

const vf =
  "scale=1080:520:flags=lanczos,zoompan=z='min(zoom+0.0009,1.07)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=192:s=1080x520:fps=24";

const result = spawnSync(
  ffmpegInstaller.path,
  [
    '-y',
    '-loop',
    '1',
    '-i',
    input,
    '-vf',
    vf,
    '-t',
    '8',
    '-an',
    '-c:v',
    'libvpx-vp9',
    '-crf',
    '34',
    '-b:v',
    '0',
    output,
  ],
  { stdio: 'inherit' },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Wrote ${output}`);
