# mcespo.com — Claude instructions

Personal portfolio site for Marvin Céspedes.

> **Current state: homepage only.** The blog, notes stream, tags, pagination, projects and contact pages are built and styled but *parked* until there's real content. Astro skips `_`-prefixed files and folders in `src/pages/`, so they live at `src/pages/_posts/`, `_tags/`, `_page/`, `_projects.astro` and `_contact.astro`. To bring a section back: `git mv` it to drop the underscore, add it to `site.nav` in `src/site.config.ts`, and restore any homepage/footer links it needs (the stream on the homepage, RSS once a feed exists). Parked pages still type-check, so keep them compiling. Built with **Astro v7**, **Tailwind v4** (via `@tailwindcss/vite`), and **TypeScript strict** (TS 6 — `@astrojs/check` doesn't support TS 7 yet). Requires Node ≥ 22.22.

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

**How the two accents are used:**
- **Orange is for interaction:** link underlines, hover, focus rings, and anything that tells the reader "this is clickable".
  - `--accent-2` (`oklch(63.6% 0.152 51)`) is for underlines and focus rings, which need 3:1. It's the design's orange nudged 1% darker to clear that.
  - `--accent-2-strong` (`oklch(53.7% 0.152 51)`) is for orange *text*, like hovered links or "Continue reading", which needs 4.5:1. In dark mode both tokens are the same orange, which already clears 7:1.
- **Violet is for identity:** the drop cap, note cards, text selection, footnote numbers and code highlighting. Don't use it for links.
- **Links keep the surrounding text color and get an orange underline** (`.u`, or automatically inside `.art`). Don't color link text orange at rest; one consistent link style avoids needing the darker orange.

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
Every page is one `.col` column holding `SiteHeader`, `<main>` and `SiteFooter`. It's `42.5rem` up to a 1280px viewport, then widens to `56rem` at 1920px so lines stay around 70 characters as the type grows. Post bodies render into `.art`, styled by `src/styles/prose.css`, which only the post template (and `Note.astro`) import so other pages don't ship it. The one remaining layout breakpoint is `56.25rem`, where pull quotes and figures stop breaking out of the column.

### Typography
Type is the centerpiece, so every font size comes from the fluid `--text-*` tokens in `global.css`: meta, ui, brand, excerpt, body, lede, sign, h3, h2, quote, entry, h1 and title. Each `clamp()` grows linearly from a 360px phone to a 1920px display, then holds, so there are no per-breakpoint font-size overrides. Rules for new sizes:
- Add a token rather than a one-off size. Pick a phone and a 1920px value and derive the clamp: slope = (max − min) / 97.5, giving `calc(min − slope × 22.5)rem + (slope × 100)vw`.
- Keep the max under 2.5× the min, and always include a rem term, so browser zoom keeps working (WCAG 1.4.4).
- Size things that belong to a piece of text in `em` (the drop cap, the logo, theme buttons, code), so they track their text.

### Site config
`src/site.config.ts` holds the email, header nav (empty while only the homepage is live), social links, stream page size, and the pinned tags for the parked tag pages.

### Performance
- CSS is inlined into each page (`build.inlineStylesheets: 'always'`): it's small, and inlining removes a render-blocking request. Keep page-specific CSS in the page or component that needs it (like `prose.css`) so it doesn't inflate every page.
- The header's script is inlined by Astro too; the page makes no JS requests. Keep it that way: no new client-side libraries for things CSS can do.
- `netlify.toml` gives hashed `/_astro/*` assets a one-year immutable cache, and sets baseline security headers (HSTS, nosniff, referrer policy, a Permissions-Policy, and a `frame-ancestors 'none'` CSP).
- Fonts are self-hosted and trimmed (see Fonts): about 218 KB in total, with 152 KB preloaded.
- Last measured with Lighthouse: 100 in every category on desktop, and 99 performance plus 100 elsewhere on mobile (LCP 2.3s on simulated slow 4G), with zero layout shift and zero blocking time.

### Links
External links open in the same tab: no `target="_blank"`, so no `rel="noopener"` is needed, and visitors keep control of new tabs. Social profile links carry `rel="me"`. Use the final `https` URL for every link; the link check flags redirects.

### Animations
All animations and transitions must respect `prefers-reduced-motion`. See the pattern in `global.css`. Animate on a dedicated layer (like the `body::before` background) rather than on elements that contain content, so frames don't repaint the page.

Entrance animations use the shared blur-in in `global.css`: add `reveal` to one element, or `reveal-group` to a parent to stagger its children, and set `--reveal-offset` on the element to sequence it after earlier content. Theme changes cross-fade through the View Transitions API (`SiteHeader`). Both are skipped under reduced motion; color-only hover transitions stay, since they aren't motion.

### Fonts
Fraunces, Newsreader and JetBrains Mono are committed as trimmed variable `.woff2` files in `src/assets/fonts/` (each folder includes the font's SIL Open Font License, which must stay with the files). Astro's Fonts API serves them through the local provider (`fonts` in `astro.config.mjs`) as `--font-display`, `--font-body` and `--font-mono`, preloads the two roman cuts, and generates metric-matched fallbacks so the swap from fallback to real font causes no layout shift. Don't add a Google Fonts `<link>` or switch back to the Google provider: builds would depend on Google again, and its files are about 25% larger.

`npm run fonts` (`scripts/fonts.mjs`) regenerates the files from the official sources in the google/fonts repo, pinned to one commit. It trims each font to:
- **Weights the CSS uses:** Fraunces 350–400, Newsreader 400–700, JetBrains Mono 400–500. Using a weight outside these ranges means widening them in the script and in `astro.config.mjs`, then rerunning.
- **The Latin character set Google serves,** plus arrows.
- **Fraunces' `opsz` axis is kept,** since headings use `"opsz" 144` via `--dv`.
- **SOFT and WONK are pinned to their defaults (0 and 1),** exactly as Google served them. The `"SOFT" 50, "WONK" 0` in `--dv` is the design's intent, but it has never rendered. To adopt it, pin `SOFT: 50, WONK: 0` in the script instead; the file size is unchanged.

### Accessibility
- Text colors must meet WCAG AA (4.5:1) against the background. `--ink-3` is darker than the original design for this reason.
- Links inside running text need an underline (`.u`), not just a color change. Orange is the link color; see the accent rules under Colors.
- `Plate` requires `alt` whenever it has `src`; `YouTubeEmbed` requires `title`; posts with `heroImage` require `heroImageAlt`.

### Head, social cards and schema
`BaseLayout` writes every head tag from a few props: `title` (page name only; the layout appends " — Marvin Céspedes", omit it on the homepage), `description` (defaults to `site.description`), `image` (defaults to `site.ogImage`), `article` (adds `og:type=article` and `article:*` tags), `pageType` and `schema`. Pages never write `<meta>` tags themselves.

Structured data lives in `src/lib/schema.ts`: every page emits one `@graph` with the shared `WebSite`, `Person` and a `WebPage` node, linked by `@id`. Pages add their own nodes through the `schema` prop. The homepage is a `ProfilePage`; the parked blog already uses `blog()` and `blogPosting()`, so its structured data works as soon as it's unparked. Validate changes with https://validator.schema.org.

`@astrojs/sitemap` generates `sitemap-index.xml`, referenced from `public/robots.txt` and the head.

### Favicons, app icons and the social card
Everything in `public/` except `robots.txt` and other hand-added assets is generated from the seal in `LogoSprite.astro` by `npm run brand-images` (`scripts/brand-images.mjs`): `favicon.svg` (switches color in dark mode), `favicon.ico` (16/32/48), `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `og.png` (1200×630 share card), and `site.webmanifest`. Rerun it after changing the logo or the accent/paper colors; never edit the outputs by hand. Colors are defined in OKLCH in the script and converted to sRGB only for the PNGs and manifest, which can't use OKLCH.

### Comments
Keep comments light: one or two sentences that explain *why*, never a restatement of what the code does.

### Content collections
- Config lives at `src/content.config.ts` (NOT `src/content/config.ts`)
- Use `render(post)` not `post.render()`
- Use `entry.id` not `entry.slug` for URL generation (glob loader)

---

## Testing

Three checks, all with plain-language output:

| Check | Tool | When it runs | Locally |
|---|---|---|---|
| Type-check | `astro check` | Every build, including Netlify deploys (`build` runs it first, so a type error stops the deploy) | `npm run build` |
| Accessibility | pa11y-ci with axe rules, WCAG 2 AA | GitHub Actions on every push to `main` and every PR (`.github/workflows/ci.yml`) | `npm run build`, then `npm run serve:dist` in one terminal and `npm run test:a11y` in another |
| Links | lychee | GitHub Actions on the 1st of each month or on demand; opens an issue if anything's broken (`.github/workflows/links.yml`) | `npm run build && npm run test:links` (needs `brew install lychee`) |

- **Accessibility** tests every page in the sitemap, in light and dark (`THEME=dark`). It runs with reduced motion forced on so the blur-in animation doesn't leave half-faded text for the contrast check to measure, and it sets dark mode through the system preference rather than clicking the toggle, which would measure mid-fade colors. Config: `.pa11yci.cjs`. pa11y-ci runs via `npx` rather than as a dev dependency because it downloads its own Chrome, which would slow every Netlify install.
- **Links** are checked against the built HTML. LinkedIn (which answers bots with status 999) and the site's own production URLs are excluded; only 2xx responses pass. Config: `lychee.toml`. When lychee reports a redirect, update the link to the final URL.
- Automated accessibility checks catch roughly a third of real issues. Keyboard and screen-reader passes are still worth doing by hand after layout changes.

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
| `src/site.config.ts` | Name, email, description, share image, Person details, nav, socials, page size |
| `src/lib/writing.ts` | Stream/post queries, excerpt, reading time, date + tag helpers |
| `src/components/SiteHeader.astro` | Brand mark, primary nav, Auto/Light/Dark theme pill |
| `src/components/SiteFooter.astro` | Seal, sign-off, social links, copyright |
| `src/components/Stream.astro` | Post entries, note cards, pagination row |
| `src/components/ChicagoStars.astro` | Four-star ornament under post headers |
| `src/components/LogoSprite.astro` | The seal's paths as an SVG `<symbol>`, rendered once per page |
| `src/components/LogoIcon.astro` | `<use>` reference to the seal, in `currentColor` |
| `scripts/fonts.mjs` | Downloads and trims the self-hosted fonts into `src/assets/fonts/` |
| `src/assets/fonts/*/` | Trimmed `.woff2` fonts plus each font's OFL license |
| `scripts/brand-images.mjs` | Generates favicons, app icons, the share card and web manifest into `public/` |
| `src/lib/schema.ts` | Schema.org graph builders: WebSite, Person, WebPage, Blog, BlogPosting |
| `src/components/Plate.astro` | Image or striped placeholder with italic caption |
| `src/components/Note.astro` | Sticky-note callout aside |
| `src/components/YouTubeEmbed.astro` | Privacy-safe YouTube iframe with caption |
| `src/components/VideoPlayer.astro` | Native `<video>` with poster + caption |
| `src/content.config.ts` | Blog collection schema |
| `src/content/posts/*.md` | Plain Markdown blog posts |
| `src/content/posts/*.mdx` | Blog posts that need inline components |
| `src/content/notes/*.md` | Short untitled notes |
| `src/pages/index.astro` | Home: intro + bio (the only live page) |
| `src/pages/_page/[page].astro` | *Parked* — stream pages 2+ |
| `src/pages/_posts/index.astro` | *Parked* — full archive |
| `src/pages/_posts/[...slug].astro` | *Parked* — blog post template |
| `src/pages/_tags/[tag].astro` | *Parked* — posts by tag or category |
| `src/pages/_projects.astro`, `_contact.astro` | *Parked* — stubs |
