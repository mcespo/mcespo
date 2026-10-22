/**
 * Schema.org JSON-LD. Every page emits one @graph whose nodes point at each other by @id,
 * so the WebSite, the Person and later the Blog are each described once and referenced everywhere.
 */
import { site } from '../site.config';
import type { Post } from './writing';
import { titleText } from './writing';

type Node = Record<string, unknown>;

const origin = import.meta.env.SITE.replace(/\/$/, '');
const ref = (id: string) => ({ '@id': id });

export const ids = {
  website: `${origin}/#website`,
  person: `${origin}/#person`,
  blog: `${origin}/posts/#blog`,
};

export function person(): Node {
  return {
    '@type': 'Person',
    '@id': ids.person,
    name: site.name,
    url: `${origin}/`,
    email: `mailto:${site.email}`,
    jobTitle: site.person.jobTitle,
    worksFor: { '@type': 'Organization', ...site.person.worksFor },
    homeLocation: { '@type': 'Place', name: site.person.location },
    knowsAbout: site.person.knowsAbout,
    sameAs: site.social.map(({ href }) => href),
  };
}

export function website(): Node {
  return {
    '@type': 'WebSite',
    '@id': ids.website,
    url: `${origin}/`,
    name: site.name,
    description: site.description,
    inLanguage: 'en-US',
    publisher: ref(ids.person),
  };
}

export type PageType = 'WebPage' | 'ProfilePage' | 'CollectionPage';

export function webPage(opts: { url: string; title: string; description: string; image: string; type?: PageType }): Node {
  const { url, title, description, image, type = 'WebPage' } = opts;
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'en-US',
    isPartOf: ref(ids.website),
    primaryImageOfPage: { '@type': 'ImageObject', url: image },
    // A profile page is about its subject; every other page is about the site's author.
    ...(type === 'ProfilePage' ? { mainEntity: ref(ids.person) } : { about: ref(ids.person) }),
  };
}

/** For the posts archive, once the blog is live. */
export function blog(): Node {
  return {
    '@type': 'Blog',
    '@id': ids.blog,
    url: `${origin}/posts/`,
    name: `${site.name} — Writing`,
    inLanguage: 'en-US',
    isPartOf: ref(ids.website),
    author: ref(ids.person),
    publisher: ref(ids.person),
  };
}

export function blogPosting(post: Post, url: string, image: string): Node {
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: titleText(post.data.title),
    description: post.data.description,
    datePublished: post.data.publishDate.toISOString(),
    image,
    articleSection: post.data.category,
    keywords: post.data.tags,
    inLanguage: 'en-US',
    author: ref(ids.person),
    publisher: ref(ids.person),
    isPartOf: ref(ids.blog),
    mainEntityOfPage: ref(`${url}#webpage`),
  };
}

export function graph(nodes: Node[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
