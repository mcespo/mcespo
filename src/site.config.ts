/** Settings that change more often than the templates. */
export const site = {
  name: 'Marvin Céspedes',
  email: 'mcespo@gmail.com',

  /**
   * Header nav. Empty while the homepage is the only page; add entries as parked
   * sections in src/pages/_* come back, e.g. { href: '/posts', label: 'Writing', id: 'writing' }.
   */
  nav: [] as { href: string; label: string; id: 'writing' | 'projects' | 'contact' }[],

  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mcespo' },
    { label: 'GitHub', href: 'https://github.com/mcespo' },
    { label: 'CodePen', href: 'https://codepen.io/mcespo' },
    { label: 'dev.to', href: 'https://dev.to/mcespo' },
  ],

  /** Posts and notes per stream page. */
  pageSize: 5,

  /** Linked from the homepage intro, so their pages build even before a post uses them. */
  pinnedTags: ['css', 'process', 'learning'],
};
