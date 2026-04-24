#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'web-ext-artifacts');
const out = resolve(outDir, 'source.zip');

// Exclusions kept in sync with .github/workflows/release.yml so local source
// archives are identical to the one uploaded to AMO during signed releases.
const excludes = [
  'node_modules/*',
  'dist/*',
  'web-ext-artifacts/*',
  '.git/*',
  '.github/*',
  '.claude/*',
  '*.DS_Store',
];

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
if (existsSync(out)) rmSync(out);

execFileSync('zip', ['-r', out, '.', '-x', ...excludes], {
  cwd: root,
  stdio: 'inherit',
});

console.log('[source-zip] done →', out);
