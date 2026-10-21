/**
 * Site-wide settings that change more often than the templates do.
 */
export const site = {
  name: 'Marvin Céspedes',
  email: 'hi@mcespo.com',

  /** "Lately I'm designing at … and reading …" on the homepage */
  now: {
    company: '[Company]',
    book: '[Book Title]',
  },

  /** Entries (posts + notes) per page in the writing stream */
  pageSize: 5,

  /**
   * Tags linked from the homepage intro. Their pages are always
   * generated, even before a post uses them.
   */
  pinnedTags: ['css', 'process', 'learning'],
};
