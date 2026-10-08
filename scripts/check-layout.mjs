import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]);
const errors = [];
const source = files('src/app');
for (const file of source) {
  if (file.endsWith('.spec.ts')) errors.push(`${file}: tests belong in testing/app`);
  if (!file.endsWith('.ts')) continue;
  const text = readFileSync(file, 'utf8');
  if (/\binject\(HttpClient\)/.test(text) && !file.includes('/api/')) errors.push(`${file}: HTTP belongs in api`);
  if (/\binject\(MenuApiService\)/.test(text) && !file.includes('/state/')) errors.push(`${file}: API orchestration belongs in state`);
  if (!text.includes('@Component(')) continue;
  if (/templateUrl|styleUrls?\s*:/.test(text)) errors.push(`${file}: component views must be inline`);
  for (const match of text.matchAll(/class="([^"]+)"/g)) {
    for (const name of match[1].split(/\s+/)) {
      if (!/^(?:menu-[a-z-]+(?:__[a-z-]+)?(?:--[a-z-]+)?|mat-[\w-]+|cdk-[\w-]+)$/.test(name)) errors.push(`${file}: use BEM for ${name}`);
    }
  }
  const count = text.trimEnd().split('\n').length;
  if (count > 230) console.warn(`${file}: ${count} lines; review cohesion (soft target: 230)`);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('Layout checks passed: feature boundaries, inline component views, BEM and separate tests.');
