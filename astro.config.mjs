// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://mcespo.com',

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    // Token colors come from --astro-code-* in global.css, so code follows the site palette + dark mode
    shikiConfig: { theme: 'css-variables' },
  },

  integrations: [mdx()],
});
