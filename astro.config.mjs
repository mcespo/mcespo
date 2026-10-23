// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mcespo.com',

  // Astro 7's JSX whitespace rules would drop spaces in wrapped template prose.
  compressHTML: true,

  // Small stylesheet: inlining saves a render-blocking request.
  build: { inlineStylesheets: 'always' },

  // Fingerprints every script and style so the browser refuses anything injected. Style attributes are allowed
  // because Astro can't hash them (the logo, Shiki); they can't run code. Framing rules live in netlify.toml.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        'frame-src https://www.youtube-nocookie.com',
      ],
      styleDirective: {
        resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }],
      },
    },
  },

  // Committed, trimmed fonts from `npm run fonts`; Astro still generates matched fallbacks.
  fonts: [
    {
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      provider: fontProviders.local(),
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/fraunces/roman.woff2'], weight: '350 400', style: 'normal' },
          { src: ['./src/assets/fonts/fraunces/italic.woff2'], weight: '350 400', style: 'italic' },
        ],
      },
    },
    {
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      provider: fontProviders.local(),
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/newsreader/roman.woff2'], weight: '400 700', style: 'normal' },
          { src: ['./src/assets/fonts/newsreader/italic.woff2'], weight: '400 700', style: 'italic' },
        ],
      },
    },
    {
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains',
      provider: fontProviders.local(),
      fallbacks: ['monospace'],
      options: {
        variants: [{ src: ['./src/assets/fonts/jetbrains-mono/roman.woff2'], weight: '400 500', style: 'normal' }],
      },
    },
  ],

  markdown: {
    // Token colors come from --astro-code-* in prose.css.
    shikiConfig: { theme: 'css-variables' },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx(), sitemap()],
});