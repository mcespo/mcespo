import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  /* Picks up both .md and .mdx — use .mdx when a post needs inline components */
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    /** Dek under the post title + meta description and OG */
    description: z.string(),
    publishDate: z.coerce.date(),
    /** Display category shown in the meta line, e.g. "Essay", "Code", "Process" */
    category: z.string().default('Essay'),
    /** Reading time in minutes — estimated from word count when omitted */
    readingTime: z.number().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** Optional OG image */
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
  }),
});

/* Short, untitled posts — shown as sticky cards in the writing stream, no detail page */
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    publishDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, notes };
