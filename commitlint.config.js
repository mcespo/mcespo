/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Keep subject lines readable — 100 chars is generous but bounded
    'header-max-length': [2, 'always', 100],
    // Lowercase type required (feat, fix, chore…)
    'type-case': [2, 'always', 'lower-case'],
    // Body and footer lines wrap at 120 chars
    'body-max-line-length': [2, 'always', 120],
  },
};
