# mcespo.com — Claude instructions

Personal portfolio site for Marvin Céspedes. Built with **Astro v7**, **Tailwind v4** (via `@tailwindcss/vite`), and **TypeScript strict** (TS 6 — `@astrojs/check` doesn't support TS 7 yet). Requires Node ≥ 22.22.

Type-check with `npm run check` (`astro check`).

---

## Hard rules

### 1. Units — rems only, no pixels for sizing

All font sizes, spacing, padding, margin, gap, width, height, and layout lengths must use `rem`.

The **only** exceptions where bare `px` is acceptable:
- `1px`, `2px`, `3px` border widths (physical hairlines — rounding to rem would make them disappear or jump)
- `height: 1px` decorative rules (same reason)
- `text-decoration-thickness: 2px` on accent underlines (same reason)

**Conversion reference** (root = 16px browser default):

| px  | rem      | px   | rem     |
|-----|----------|------|---------|
| 6   | 0.375rem | 40   | 2.5rem  |
| 8   | 0.5rem   | 48   | 3rem    |
| 10  | 0.625rem | 56   | 3.5rem  |
| 11  | 0.6875rem| 64   | 4rem    |
| 12  | 0.75rem  | 72   | 4.5rem  |
| 13  | 0.8125rem| 80   | 5rem    |
| 14  | 0.875rem | 88   | 5.5rem  |
| 16  | 1rem     | 120  | 7.5rem  |
| 18  | 1.125rem | 140  | 8.75rem |
| 20  | 1.25rem  | 200  | 12.5rem |
| 22  | 1.375rem | 640  | 40rem   |
| 24  | 1.5rem   | 720  | 45rem   |
| 28  | 1.75rem  | 800  | 50rem   |
| 32  | 2rem     | 1000 | 62.5rem |

`clamp()` values follow the same rule: `clamp(24px, 5vw, 56px)` → `clamp(1.5rem, 5vw, 3.5rem)`.  
`vw`, `ch`, `%`, `em` units are fine as-is.  
Media queries also use rems: `@media (max-width: 50rem)`.

---

### 2. Colors — OKLCH only, no hex or hsl

All color values must be written in `oklch(L% C H)` syntax. No hex (`#…`), no `rgb()`, no `hsl()`, no `hsla()`.

**Why OKLCH:** perceptually uniform, predictable lightness, works natively across the P3 gamut. Supported in Chrome 111+, Firefox 113+, Safari 15.4+ (all 2023+). This site targets modern browsers — no fallback is needed.

```css
/* ✗ don't */
--accent: #6d4ac2;
--accent: hsl(263, 52%, 52%);

/* ✓ do */
--accent: oklch(47.3% 0.186 289);
```

When adding a new color:
1. Convert from the designer's hex using [oklch.com](https://oklch.com) or [Color.js](https://colorjs.io)
2. Document the source hex in a comment for traceability
3. Keep the same hue family as the existing palette (violet ~289°, orange ~51°)

**Current palette hue anchors:**
- Violet family (identity): H ≈ 289°
- Orange family (interaction only): H ≈ 51°
- Neutral-violet: H ≈ 292–296°

---

## Astro best practices

### General
- **Components for anything used twice.** If a pattern appears on more than one page, extract it.
- **Layouts for page shells.** `BaseLayout.astro` is the only HTML document shell — never write a second `<!doctype html>`. It also renders the skip link, header, `<main>` and footer, so pages pass `nav="writing" | "projects" | "contact"` and supply only their content.
- **Props are always typed** with a `interface Props {}` block at the top of the frontmatter.
- **No `client:*` directives** unless a component genuinely needs browser APIs or reactive state. When JS is needed, prefer Alpine (see Standards → JavaScript below).
- **`set:html` only for trusted content** — never for user-supplied strings.
- Prefer `<slot />` over prop-threading for content composition.

### Images
Use `<Image>` from `astro:assets` for any image that lives in the repo (`src/assets/`). It produces WebP, infers dimensions (prevents layout shift), and lazy-loads by default.

```astro
---
import { Image } from 'astro:assets';
import myPhoto from '../assets/photo.jpg';
---
<Image src={myPhoto} alt="Studio corner, overcast afternoon." />
```

For images embedded in blog posts, use the `Plate` component (adds a frame + caption) or plain Markdown image syntax for inline images. Remote images (hotlinked) use a regular `<img>` — add the domain to `image.domains` in `astro.config.mjs` if Astro complains.

### Content collections
- Config: `src/content.config.ts`; import `z` from `astro/zod` (the `astro:content` export is deprecated)
- All blog posts live in `src/content/posts/` — `.md` for plain prose, `.mdx` when a post needs inline components
- Short untitled notes live in `src/content/notes/` — they appear as sticky cards in the writing stream, with no detail page
- Use `render(post)` not `post.render()`
- Use `entry.id` not `entry.slug` for URL generation with the glob loader

### Syntax highlighting
Code blocks in `.md` and `.mdx` are syntax-highlighted automatically via Shiki (Astro's default). Specify the language on the fence:

````
```typescript
const greeting = 'hello';
```
````

No extra packages needed. Markdown is processed by Sätteri (Astro 7's default) — remark/rehype plugins would need `@astrojs/markdown-remark` and `markdown.processor: unified()`. Shiki uses the `css-variables` theme; token colors map to site tokens via `--astro-code-*` in `global.css`.

`compressHTML: true` is set deliberately: Astro 7's default JSX whitespace rules would drop spaces in prose that wraps across lines in templates.

---

## Blog authoring

This site is **80–90% blog.** When making changes, the blog post experience is the primary concern — everything else is supporting context.

### Creating a new post

1. Create `src/content/posts/my-post-title.md` (or `.mdx` if components are needed inline).
2. Add frontmatter — required fields are `title`, `description`, and `publishDate`.
3. Write in Markdown. Use `.mdx` only when you need a component inline — don't default to MDX for every post.

**Frontmatter reference:**
```yaml
---
title: "The title of the post"
description: "One or two sentence dek — shown under the title, and used for meta description and OG."
publishDate: 2025-06-01
category: Essay          # Essay · Code · Process — shown in the meta line, links to /tags/essay
readingTime: 8           # minutes — optional, estimated from word count when omitted
tags: [design, process]  # optional array — each gets a /tags/[tag] page
draft: false             # true = excluded from build
heroImage: /images/my-post-hero.jpg   # optional — OG image
heroImageAlt: "Alt text for the hero" # required if heroImage is set
---
```

The post's **first paragraph** is used as its excerpt in the writing stream, so make it a good one.

**Notes** — create `src/content/notes/some-slug.md` with just `publishDate` (and optional `draft`) in the frontmatter; the body is the note.

### Markdown patterns

**Drop cap:** automatic on the first paragraph of every post. The "— Marvin" sign-off is added by the template.

**Pull quote:** any Markdown blockquote renders as a centered pull quote that breaks out of the column:
```md
> The notebook isn't a record of what I knew. It's a record of how I found out.
```
Add an attribution with HTML: `<blockquote>…<cite>— someone</cite></blockquote>`.

**Footnotes:** use GFM footnotes — they're styled and placed after the sign-off automatically:
```md
Something worth a footnote.[^1]

[^1]: The footnote text.
```

**Inline note/callout (prose only):**
```html
<aside class="note">
  <div class="label">A note</div>
  <p>Something worth calling out in the margin.</p>
</aside>
```

### Using components in MDX posts

Rename the file to `.mdx`, then import at the top of the frontmatter block:

```mdx
---
title: My Post
publishDate: 2025-06-01
description: A post with rich embeds.
---

import YouTubeEmbed from '../../components/YouTubeEmbed.astro';
import VideoPlayer from '../../components/VideoPlayer.astro';
import Plate from '../../components/Plate.astro';
import Note from '../../components/Note.astro';

Regular Markdown prose continues here.

<YouTubeEmbed id="dQw4w9WgXcQ" title="Video title for screen readers" />

<VideoPlayer src="/video/demo.mp4" caption="App walkthrough, 90 seconds." />

<Plate src="/images/screenshot.jpg" alt="The interface" num="Fig. 01" caption="Final comp, 2025." />

<Note label="Heads up">Something worth flagging inline.</Note>
```

### Component reference

| Component | Use for | Key props |
|-----------|---------|-----------|
| `Plate` | Image or striped placeholder with italic caption; breaks out of the column | `src`, `alt`, `caption`, `label`, `num`, `ratio` |
| `Note` | Sticky callout / aside | `label` |
| `YouTubeEmbed` | YouTube video (privacy-safe, no cookies) | `id`, `title`, `start`, `caption` |
| `VideoPlayer` | Self-hosted video | `src`, `poster`, `caption`, `ratio`, `autoplay`, `loop` |

---

## Standards

### HTML
Write semantic, accessible markup. Use the right element for the job before reaching for a `<div>`. Key expectations:
- Landmark elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`) over generic wrappers
- `<time datetime="…">` for all dates
- `aria-label` on landmarks that appear more than once per page
- `aria-hidden="true"` on purely decorative elements
- `alt` text on all meaningful images; `alt=""` on decorative ones
- Prefer native form elements over custom-built ones

### CSS
Lean on modern CSS before adding complexity:
- **Nesting** — always nest related rules rather than repeating selectors
- **Modern media queries** — `@media (width <= 50rem)` not `@media (max-width: 50rem)`
- **Container queries** — prefer `@container` over media queries for component-level layout shifts
- **`:has()`** — use for parent-state selection before adding JS
- **Logical properties** — `margin-inline`, `padding-block` etc. for i18n-friendly layouts
- **`text-wrap: balance` / `text-wrap: pretty`** — on headings and prose by default

### JavaScript
Keep JS minimal. The stack preference in order:

1. **No JS** — solve it with HTML/CSS first (`:has()`, `<details>`, `popover`, `dialog`)
2. **Vanilla JS** — for simple one-off interactions (the dark mode toggle is a good model)
3. **Alpine.js** — if component state becomes non-trivial (navigation open/close, tabs, accordions, form state). Add Alpine only when a vanilla solution would need to manage meaningful reactive state. Install via CDN to keep the bundle minimal: `<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>`
4. **Nothing heavier** — no React, Vue, or Svelte unless the requirement fundamentally changes

---

## Maintenance

### Packages — periodic check
**Remind the user to run `npm outdated` roughly once a month.** The command is aliased as `npm run check-updates`. Surfaces this as a gentle prompt at the start of a session if it seems like a while since packages were last touched.

Run the check:
```bash
npm run check-updates   # lists packages behind their latest version
npm update              # updates within the semver range in package.json
```
For major-version bumps, review the changelog before updating.

---

## Project conventions

### Design tokens
All tokens live in `src/styles/global.css` as CSS custom properties. Never hardcode a color or font stack inline in a component — always reference a token.

### Dark mode
Toggled via `.dark` on `<html>` (not `prefers-color-scheme`). The header's Auto / Light / Dark pill lets the user override their OS setting; Auto follows the system preference, then time of day. Preference is stored in `localStorage` under the key `mcespo.tweaks` (`darkMode: 'dark' | 'light'`, absent = auto).

The inline `is:inline` script in `BaseLayout.astro` reads localStorage and applies `.dark` before first paint — this prevents a flash of the wrong theme. Never remove or defer it.

### Layout
Every page is one `.col` column (`42.5rem` max) holding `SiteHeader`, `<main>` and `SiteFooter`. Post bodies render into `<article class="art">` (styles in `global.css`). Breakpoints: `56.25rem` (pull quotes and figures stop breaking out) and `37.5rem` (smaller type).

### Site config
`src/site.config.ts` holds the email, the homepage "Now" line (company, book), stream page size, and the pinned tags linked from the homepage intro.

### Animations
All animations and transitions must respect `prefers-reduced-motion`. See the pattern in `global.css`. Animate on a dedicated layer (like the `body::before` background) rather than on elements that contain content, so frames don't repaint the page.

### Fonts
Fraunces, Newsreader and JetBrains Mono are self-hosted with Astro's Fonts API (`fonts` in `astro.config.mjs`), exposed as `--font-display`, `--font-body` and `--font-mono`. Don't add a Google Fonts `<link>`. Fraunces must keep its `opsz` axis, since headings use `"opsz" 144` via `--dv`.

### Accessibility
- Text colors must meet WCAG AA (4.5:1) against the background. `--ink-3` is darker than the original design for this reason.
- Links inside running text need an underline (`.u`), not just a color change.
- `Plate` requires `alt` whenever it has `src`; `YouTubeEmbed` requires `title`; posts with `heroImage` require `heroImageAlt`.

### Favicons and app icons
Everything in `public/` except hand-added assets is generated from the seal in `LogoSprite.astro` by `npm run favicons` (`scripts/favicons.mjs`): `favicon.svg` (switches color in dark mode), `favicon.ico` (16/32/48), `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, and `site.webmanifest`. Rerun it after changing the logo or the accent/paper colors; never edit the outputs by hand. Colors are defined in OKLCH in the script and converted to sRGB only for the PNGs and manifest, which can't use OKLCH.

### Comments
Keep comments light: one or two sentences that explain *why*, never a restatement of what the code does.

### Content collections
- Config lives at `src/content.config.ts` (NOT `src/content/config.ts`)
- Use `render(post)` not `post.render()`
- Use `entry.id` not `entry.slug` for URL generation (glob loader)

---

## Commit convention

Commits are linted on `git commit` via commitlint + husky. Use Conventional Commits format:

```
type(optional-scope): short description
```

| Type | Use for |
|------|---------|
| `feat` | New feature or visible content addition |
| `fix` | Bug or visual defect correction |
| `style` | CSS / visual change with no logic change |
| `refactor` | Code restructure, no behavior change |
| `chore` | Deps, config, tooling, build |
| `docs` | Comments, copy, content edits |
| `perf` | Performance improvement |
| `revert` | Reverts a prior commit |

Scopes are optional but encouraged for clarity: `feat(blog): add reading time`, `fix(header): dark toggle flicker`.

The hook rejects any commit that doesn't match this format.

### New machine setup

Hooks are wired automatically — no manual step needed:

```bash
git clone <repo>
npm install   # triggers "prepare": "husky" → installs .git/hooks/commit-msg
```

Everything required is committed: `.husky/commit-msg`, `commitlint.config.js`, and the `prepare` script in `package.json`.

---

## File map

| File | Owns |
|------|------|
| `src/styles/global.css` | All design tokens + site-wide patterns (reading grid, prose, animations) |
| `src/layouts/BaseLayout.astro` | HTML shell, SEO meta, fonts, JSON-LD, dark-mode init, page chrome |
| `src/site.config.ts` | Email, "Now" line, page size, pinned tags |
| `src/lib/writing.ts` | Stream/post queries, excerpt, reading time, date + tag helpers |
| `src/components/SiteHeader.astro` | Brand mark, primary nav, Auto/Light/Dark theme pill |
| `src/components/SiteFooter.astro` | Seal + sign-off with RSS/email links |
| `src/components/Stream.astro` | Post entries, note cards, pagination row |
| `src/components/ChicagoStars.astro` | Four-star ornament under post headers |
| `src/components/LogoSprite.astro` | The seal's paths as an SVG `<symbol>`, rendered once per page |
| `src/components/LogoIcon.astro` | `<use>` reference to the seal, in `currentColor` |
| `scripts/favicons.mjs` | Generates favicons, app icons and the web manifest into `public/` |
| `src/components/Plate.astro` | Image or striped placeholder with italic caption |
| `src/components/Note.astro` | Sticky-note callout aside |
| `src/components/YouTubeEmbed.astro` | Privacy-safe YouTube iframe with caption |
| `src/components/VideoPlayer.astro` | Native `<video>` with poster + caption |
| `src/content.config.ts` | Blog collection schema |
| `src/content/posts/*.md` | Plain Markdown blog posts |
| `src/content/posts/*.mdx` | Blog posts that need inline components |
| `src/content/notes/*.md` | Short untitled notes |
| `src/pages/index.astro` | Home: intro + page 1 of the stream |
| `src/pages/page/[page].astro` | Stream pages 2+ |
| `src/pages/posts/index.astro` | Full archive |
| `src/pages/posts/[...slug].astro` | Blog post template |
| `src/pages/tags/[tag].astro` | Posts by tag or category |
