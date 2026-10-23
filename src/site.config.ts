export const site = {
  name: 'Marvin Céspedes',
  email: 'mcespo@gmail.com',

  /** Meta and schema description; keep it under ~160 characters. */
  description:
    'Software engineer and designer in (mostly chilly) Chicago, with a soft spot for the frontend and accessibility. Pretty heckin’ good at the code.',

  /** Default share image, from `npm run brand-images`. */
  ogImage: {
    src: '/og.png',
    alt: 'The Marvin Céspedes seal in violet on a soft violet-to-peach wash.',
    width: 1200,
    height: 630,
  },

  /** Person schema details. */
  person: {
    jobTitle: 'Software Engineer',
    worksFor: { name: 'Kin', url: 'https://www.kin.com/' },
    location: 'Chicago, Illinois',
    knowsAbout: ['Frontend engineering', 'Web accessibility', 'Design systems', 'UX/UI design', 'Content management systems'],
  },

  /** Empty while only the homepage is live; add parked sections as they return. */
  nav: [] as { href: string; label: string; id: 'writing' | 'projects' | 'contact' }[],

  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mcespo' },
    { label: 'GitHub', href: 'https://github.com/mcespo' },
    { label: 'CodePen', href: 'https://codepen.io/mcespo' },
    { label: 'dev.to', href: 'https://dev.to/mcespo' },
  ],

  /** Posts and notes per stream page. */
  pageSize: 5,

  /** Tag pages that build even before a post uses them. */
  pinnedTags: ['css', 'process', 'learning'],
};
