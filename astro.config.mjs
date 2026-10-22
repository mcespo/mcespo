// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://mcespo.com',

  // Astro 7's JSX whitespace rules would glue together prose that wraps across lines in templates.
  compressHTML: true,

  // Self-hosted at build time: no third-party request, and metric-matched fallbacks cut layout shift.
  fonts: [
    {
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      provider: fontProviders.google(),
      weights: ['300 900'],
      styles: ['normal', 'italic'],
      fallbacks: ['Georgia', 'serif'],
      // Headings use "opsz" 144, so the optical-size axis must be in the file.
      options: { experimental: { variableAxis: { opsz: [['9', '144']] } } },
    },
    {
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      provider: fontProviders.google(),
      weights: ['300 700'],
      styles: ['normal', 'italic'],
      fallbacks: ['Georgia', 'serif'],
      options: { experimental: { variableAxis: { opsz: [['6', '72']] } } },
    },
    {
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains',
      provider: fontProviders.google(),
      weights: ['400 500'],
      styles: ['normal'],
      fallbacks: ['monospace'],
    },
  ],

  markdown: {
    // Token colors map to --astro-code-* in global.css, so code follows the palette and dark mode.
    shikiConfig: { theme: 'css-variables' },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx(), sitemap()],
  adapter: netlify(),
});