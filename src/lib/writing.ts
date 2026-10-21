/**
 * Helpers shared by the writing stream, post template and tag pages.
 */

import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type Note = CollectionEntry<'notes'>;
export type StreamItem =
  | { kind: 'post'; entry: Post }
  | { kind: 'note'; entry: Note };

const newestFirst = (a: { data: { publishDate: Date } }, b: { data: { publishDate: Date } }) =>
  b.data.publishDate.valueOf() - a.data.publishDate.valueOf();

/** Published posts, newest first */
export async function getPosts(): Promise<Post[]> {
  return (await getCollection('posts', ({ data }) => !data.draft)).sort(newestFirst);
}

/** Posts and notes interleaved, newest first */
export async function getStream(): Promise<StreamItem[]> {
  const notes = await getCollection('notes', ({ data }) => !data.draft);
  const items: StreamItem[] = [
    ...(await getPosts()).map((entry) => ({ kind: 'post' as const, entry })),
    ...notes.map((entry) => ({ kind: 'note' as const, entry })),
  ];
  return items.sort((a, b) => newestFirst(a.entry, b.entry));
}

/** URL-safe tag slug — categories share the same namespace as tags */
export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}

export function tagHref(tag: string): string {
  return `/tags/${tagSlug(tag)}`;
}

/** Every tag slug a post is filed under, including its category */
export function postTags(post: Post): string[] {
  return [post.data.category, ...post.data.tags].map(tagSlug);
}

/** Titles may use *asterisks* for italics — trusted author content */
export function titleHtml(title: string): string {
  return title.replace(/\*(.+?)\*/g, '<em>$1</em>');
}

export function titleText(title: string): string {
  return title.replace(/\*(.+?)\*/g, '$1');
}

/** The post's opening paragraph as plain text, for the stream excerpt */
export function excerpt(post: Post): string {
  const block = (post.body ?? '')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    // Skip headings, MDX imports, components, quotes, code, lists, images
    .find((b) => b && !/^(#|import\s|export\s|<(?!p[\s>])|>|```|[-*+]\s|\d+\.\s|!\[|\[\^)/.test(b));

  if (!block) return post.data.description;

  return block
    .replace(/<[^>]+>/g, '')                  // inline HTML tags
    .replace(/\[\^[^\]]+\]/g, '')             // footnote refs
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')  // links → text
    .replace(/(\*\*|\*|`)(.+?)\1/g, '$2')     // bold, italic, code
    .replace(/\s+/g, ' ')
    .trim();
}

/** Minutes to read — frontmatter wins, otherwise ~230 wpm */
export function readingMinutes(post: Post): number {
  if (post.data.readingTime) return post.data.readingTime;
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/*
 * Dates are parsed from YYYY-MM-DD frontmatter as UTC midnight,
 * so format in UTC or they slip a day west of Greenwich.
 */
export function longDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

/** "March 18" this year, "March 18, 2025" otherwise */
export function shortDate(d: Date): string {
  const sameYear = d.getUTCFullYear() === new Date().getUTCFullYear();
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
    timeZone: 'UTC',
  });
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Pagination for the stream — page 1 is the homepage */
export function pageHref(page: number): string {
  return page <= 1 ? '/' : `/page/${page}`;
}
