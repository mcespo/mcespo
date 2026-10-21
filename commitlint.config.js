/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
    'type-case': [2, 'always', 'lower-case'],
    'body-max-line-length': [2, 'always', 120],
  },
};
