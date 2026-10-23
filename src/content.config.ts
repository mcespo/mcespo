import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    category: z.string().default('Essay'),
    /** Minutes; estimated from word count when omitted. */
    readingTime: z.number().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
  }).refine((d) => !d.heroImage || d.heroImageAlt, {
    message: 'heroImageAlt is required when heroImage is set',
    path: ['heroImageAlt'],
  }),
});

// Untitled short posts for the stream; no page of their own.
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    publishDate: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, notes };
