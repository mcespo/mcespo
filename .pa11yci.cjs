// Accessibility check (WCAG 2 AA, axe rules) for every page in the sitemap.
// THEME=dark starts the browser in system dark mode, so the site's Auto theme renders dark from the first paint.
// Reduced motion keeps the blur-in from leaving half-faded text for the contrast check to measure.
const dark = process.env.THEME === 'dark';

module.exports = {
  defaults: {
    standard: 'WCAG2AA',
    runners: ['axe'],
    timeout: 30000,
    chromeLaunchConfig: {
      args: [
        '--no-sandbox',
        '--force-prefers-reduced-motion',
        `--blink-settings=preferredColorScheme=${dark ? 0 : 1}`,
      ],
    },
  },
};
