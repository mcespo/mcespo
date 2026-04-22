import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  /* Picks up both .md and .mdx — use .mdx when a post needs inline components */
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    /** Display category shown in the post list and kicker, e.g. "Essay", "Note", "Code" */
    category: z.string().default('Essay'),
    /** Estimated reading time in minutes — shown in the kicker and post list */
    readingTime: z.number().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** Optional hero image shown at the top of the post and used for OG */
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
  }),
});

export const collections = { blog };
