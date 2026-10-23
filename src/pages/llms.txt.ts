// A plain-Markdown summary for AI tools (llmstxt.org), built from site.config so it stays in sync.
import type { APIRoute } from 'astro';
import { site } from '../site.config';

const { person } = site;

// Mirrors the homepage bio; update both together.
const experience = [
  ['Kin', 'https://www.kin.com/', 'Maintains the main marketing site, built on Content.One (current)'],
  ['3Z Brands', 'https://www.3zbrands.com/', 'Software engineer'],
  ['Benchmark Analytics', 'https://www.benchmarkanalytics.com/', 'Software engineer'],
  ['Grainger', 'https://www.grainger.com/', 'Software engineer'],
  ['Epsilon (formerly Conversant Media)', null, 'Internal design system'],
  ['Vox Media', 'https://concert.io/', 'Frontend developer, Concert ad units'],
  ['Office of the Chicago City Clerk', 'https://www.chicityclerk.com/', 'Frontend developer and graphic designer'],
] as const;

const link = (label: string, href: string | null) => (href ? `[${label}](${href})` : label);

const body = `# ${site.name}

> ${site.description}

${site.name} is a ${person.jobTitle.toLowerCase()} and designer based in ${person.location}, working across the full stack with a focus on frontend engineering and accessibility. This is Marvin's personal homepage; a blog is planned.

## Experience

${experience.map(([name, href, role]) => `- ${link(name, href)}: ${role}`).join('\n')}

## Volunteering and teaching

- [Artists for the Humanities](https://a4th.org/): Designer and webmaster (past)
- [Intersection](https://intersectionchicago.org/): Designer and webmaster (past)
- [Girl Develop It Chicago](https://girldevelopit.com/): Instructor and TA (past)

## Areas of focus

${person.knowsAbout.map((topic) => `- ${topic}`).join('\n')}

## Contact and profiles

- Email: ${site.email}
${site.social.map(({ label, href }) => `- [${label}](${href})`).join('\n')}

## Optional

- [Homepage](${new URL('/', import.meta.env.SITE).href}): The same information as a web page
`;

export const GET: APIRoute = () =>
  new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
