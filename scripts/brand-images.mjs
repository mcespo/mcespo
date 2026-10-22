// Generates every favicon, app icon and the social share card in public/ from the seal in LogoSprite.astro.
// Run after changing the logo or brand colors: npm run brand-images
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const out = new URL('../public/', import.meta.url);

const colors = {
  accent:     [47.3, 0.186, 289],
  accentDark: [76,   0.12,  292],
  paper:      [97.5, 0.004, 295],
  washA:      [94,   0.028, 296],
  washB:      [95.5, 0.025, 60],
};

const sprite = await readFile(new URL('../src/components/LogoSprite.astro', import.meta.url), 'utf8');
const paths = [...sprite.matchAll(/<path d="([^"]+)"/g)].map(([, d]) => d);

// The seal's viewBox is 528.3 × 512.9; pad it to a square so it centers in every icon.
const viewBox = '0 -7.7 528.3 528.3';
const oklch = ([l, c, h]) => `oklch(${l}% ${c} ${h})`;
const pathMarkup = (fill = '') => paths.map((d) => `<path${fill} d="${d}"/>`).join('');

// Browser tabs: the browser applies its own light/dark scheme, so the SVG carries both colors.
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
<style>path{fill:${oklch(colors.accent)}}@media (prefers-color-scheme:dark){path{fill:${oklch(colors.accentDark)}}}</style>
${pathMarkup()}
</svg>
`;

// Sharp's SVG renderer doesn't parse OKLCH, so raster icons get the sRGB equivalent.
function hex([l, c, h]) {
  const L = l / 100;
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const lms = [
    L + 0.3963377774 * a + 0.2158037573 * b,
    L - 0.1055613458 * a - 0.0638541728 * b,
    L - 0.0894841775 * a - 1.291485548 * b,
  ].map((v) => v ** 3);
  const linear = [
    4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
    -1.2684380046 * lms[0] + 2.6097574011 * lms[1] - 0.3413193965 * lms[2],
    -0.0041960863 * lms[0] - 0.7034186147 * lms[1] + 1.707614701 * lms[2],
  ];
  return `#${linear
    .map((v) => Math.min(1, Math.max(0, v)))
    .map((v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055))
    .map((v) => Math.round(v * 255).toString(16).padStart(2, '0'))
    .join('')}`;
}

const sealSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${pathMarkup(` fill="${hex(colors.accent)}"`)}</svg>`);

/** The seal at `scale` of the canvas, on paper or transparent. */
async function png(size, { scale = 1, background = false } = {}) {
  const inner = Math.round(size * scale);
  const seal = await sharp(sealSvg, { density: 1200 }).resize(inner, inner).png().toBuffer();
  if (!background && scale === 1) return seal;
  return sharp({
    create: { width: size, height: size, channels: 4, background: background ? hex(colors.paper) : '#0000' },
  })
    .composite([{ input: seal, gravity: 'center' }])
    .png()
    .toBuffer();
}

// Social card at the 1.91:1 size every major platform crops to, on the same wash as the site background.
async function ogCard() {
  const [width, height, seal] = [1200, 630, 400];
  const wash = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<defs><linearGradient id="w" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${hex(colors.washA)}"/><stop offset="0.5" stop-color="${hex(colors.paper)}"/><stop offset="1" stop-color="${hex(colors.washB)}"/>
</linearGradient></defs><rect width="100%" height="100%" fill="url(#w)"/></svg>`);
  return sharp(wash)
    .composite([{ input: await png(seal), gravity: 'center' }])
    .png()
    .toBuffer();
}

// ICO is a small header in front of PNGs; sharp can't write it, but every browser since IE11 reads PNG entries.
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(size % 256, entry);
    header.writeUInt8(size % 256, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map(({ data }) => data)]);
}

const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(icoSizes.map(async (size) => ({ size, data: await png(size) })));

// Home-screen icons sit on paper with breathing room, since iOS fills transparency with black.
// The maskable icon keeps the seal inside the 80% safe zone Android may crop to a circle.
const files = {
  'favicon.svg': faviconSvg,
  'favicon.ico': ico(icoImages),
  'apple-touch-icon.png': await png(180, { scale: 0.8, background: true }),
  'icon-192.png': await png(192, { scale: 0.8, background: true }),
  'icon-512.png': await png(512, { scale: 0.8, background: true }),
  'icon-maskable-512.png': await png(512, { scale: 0.64, background: true }),
  'og.png': await ogCard(),
  // JSON isn't CSS, and not every manifest consumer parses OKLCH, so colors are converted.
  'site.webmanifest': `${JSON.stringify(
    {
      name: 'Marvin Céspedes',
      short_name: 'Marvin',
      start_url: '/',
      display: 'browser',
      background_color: hex(colors.paper),
      theme_color: hex(colors.paper),
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2,
  )}\n`,
};

for (const [name, data] of Object.entries(files)) {
  await writeFile(new URL(name, out), data);
  console.log(`public/${name}`);
}
