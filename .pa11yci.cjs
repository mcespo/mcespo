// WCAG 2 AA (axe) for every page in the sitemap. THEME=dark sets the system preference, so Auto renders dark.
// Reduced motion stops the blur-in from skewing contrast results.
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
