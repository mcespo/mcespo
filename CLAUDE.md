# mcespo.com — Claude instructions

Personal portfolio site for Marvin Céspedes. Built with **Astro v5**, **Tailwind v4** (via `@tailwindcss/vite`), and **TypeScript strict**.

---

## Hard rules

### 1. Units — rems only, no pixels for sizing

All font sizes, spacing, padding, margin, gap, width, height, and layout lengths must use `rem`.

The **only** exceptions where bare `px` is acceptable:
- `1px`, `2px`, `3px` border widths (physical hairlines — rounding to rem would make them disappear or jump)
- `height: 1px` decorative rules (same reason)
- `height: 2px` progress bar (rendering artifact, not layout)

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

## Project conventions

### Design tokens
All tokens live in `src/styles/global.css` as CSS custom properties. Never hardcode a color or font stack inline in a component — always reference a token.

### Dark mode
Toggled via `.dark` on `<html>` (not `prefers-color-scheme`). The user can override their OS setting. Preference is stored in `localStorage` under the key `mcespo.tweaks`.

The inline `is:inline` script in `BaseLayout.astro` reads localStorage and applies `.dark` before first paint — this prevents a flash of the wrong theme. Never remove or defer it.

### Gutter column
The `.reading` two-column grid collapses at `≤50rem` (`@media (max-width: 50rem)`) and can be hidden at any width by `html.hide-gutter`.

### Animations
All animations and transitions must respect `prefers-reduced-motion`. See the pattern in `global.css`.

### Content collections (Astro v5)
- Config lives at `src/content.config.ts` (NOT `src/content/config.ts`)
- Use `render(post)` not `post.render()` (v5 API)
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
| `src/layouts/BaseLayout.astro` | HTML shell, SEO meta, JSON-LD slot, dark-mode init, fade-up IO |
| `src/components/SiteHeader.astro` | Brand mark, primary nav, dark mode toggle |
| `src/components/SiteFooter.astro` | Copyright + RSS/Colophon links |
| `src/components/Plate.astro` | `<figure>` with framed image + mono caption |
| `src/components/Note.astro` | Sticky-note callout aside |
| `src/content.config.ts` | Blog collection schema |
| `src/content/blog/*.md` | Blog posts (Markdown with frontmatter) |
| `src/pages/index.astro` | Home page |
| `src/pages/blog/index.astro` | Blog listing |
| `src/pages/blog/[...slug].astro` | Blog post template |
