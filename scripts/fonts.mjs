// Builds the self-hosted fonts in src/assets/fonts/ from the official Google Fonts sources.
// Run after changing which weights the CSS uses: npm run fonts
import { mkdir, writeFile } from 'node:fs/promises';
import subsetFont from 'subset-font';

// Pinned so every run trims the exact same source files.
const source = 'https://raw.githubusercontent.com/google/fonts/45e3d5269e4a17d823f6d84470bc084dc5ae46f6/ofl';
const out = new URL('../src/assets/fonts/', import.meta.url);

// Google's "latin" subset, plus arrows for footnote back-links.
const latin = [
  [0x0000, 0x00ff], [0x0131, 0x0131], [0x0152, 0x0153], [0x02bb, 0x02bc], [0x02c6, 0x02c6],
  [0x02da, 0x02da], [0x02dc, 0x02dc], [0x0304, 0x0304], [0x0308, 0x0308], [0x0329, 0x0329],
  [0x2000, 0x206f], [0x20ac, 0x20ac], [0x2122, 0x2122], [0x2190, 0x21ff], [0x2212, 0x2212],
  [0x2215, 0x2215], [0xfeff, 0xfeff], [0xfffd, 0xfffd],
];
const text = latin.flatMap(([from, to]) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i))).join('');

// Weights match the CSS. SOFT and WONK are pinned to their defaults, as Google serves them.
const fraunces = { wght: { min: 350, max: 400 }, SOFT: 0, WONK: 1 };
const newsreader = { wght: { min: 400, max: 700 } };

const fonts = [
  { dir: 'fraunces', file: 'roman.woff2', src: 'fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf', axes: fraunces },
  { dir: 'fraunces', file: 'italic.woff2', src: 'fraunces/Fraunces-Italic[SOFT,WONK,opsz,wght].ttf', axes: fraunces },
  { dir: 'newsreader', file: 'roman.woff2', src: 'newsreader/Newsreader[opsz,wght].ttf', axes: newsreader },
  { dir: 'newsreader', file: 'italic.woff2', src: 'newsreader/Newsreader-Italic[opsz,wght].ttf', axes: newsreader },
  { dir: 'jetbrains-mono', file: 'roman.woff2', src: 'jetbrainsmono/JetBrainsMono[wght].ttf', axes: { wght: { min: 400, max: 500 } } },
];

async function download(path) {
  const response = await fetch(`${source}/${path.replace('[', '%5B').replace(']', '%5D')}`);
  if (!response.ok) throw new Error(`${response.status} fetching ${path}`);
  return Buffer.from(await response.arrayBuffer());
}

for (const { dir, file, src, axes } of fonts) {
  const folder = new URL(`${dir}/`, out);
  await mkdir(folder, { recursive: true });
  const original = await download(src);
  const trimmed = await subsetFont(original, text, { targetFormat: 'woff2', variationAxes: axes });
  await writeFile(new URL(file, folder), trimmed);
  console.log(`src/assets/fonts/${dir}/${file}  ${(trimmed.length / 1024).toFixed(1)} KB`);
}

// The OFL requires the license to ship with the fonts.
for (const [dir, family] of [['fraunces', 'fraunces'], ['newsreader', 'newsreader'], ['jetbrains-mono', 'jetbrainsmono']]) {
  await writeFile(new URL(`${dir}/OFL.txt`, out), await download(`${family}/OFL.txt`));
}
