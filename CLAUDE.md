# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server at localhost:5173
npm run build     # production build (outputs to dist/)
npm run preview   # preview the production build locally
npm run lint      # run ESLint across all js/jsx files
npm run deploy    # build then push dist/ to gh-pages branch
```

No test suite is configured. There is no `npm test` command.

## Architecture

`App.jsx` owns the shell: header (title, Formatter/Diff tabs, dark-mode toggle), footer, `mode`, and `isDark`. Both tool components stay mounted at all times — the inactive one gets a `hidden` prop (Tailwind `hidden` class) so each keeps its state across tab switches. `Viewer.jsx` and `jsonUtils.js` are stateless.

**`src/App.jsx`** — owns `mode` (`'formatter' | 'diff'`) and `isDark`. Dark mode is applied by toggling `.dark` on `document.documentElement` via `useLayoutEffect` (not `useEffect` — avoids flash on load).

**`src/components/JsonFormatter.jsx`** — owns `input`, `output`, `error`, `keyMap`, `tabSize`, `copied`. All three action handlers (`handleBeautify`, `handleMinify`, `handleCompress`) call through `processJson` or operate directly.

**`src/components/DiffChecker.jsx`** — owns `original`, `changed`, `error`, `diff`, `view`, `visibleStructural`, `visibleLines`. Compare parses both sides (error message is prefixed with which side failed), then computes both the structural and line diffs at once; the `view` toggle just switches the rendering. The full diff lives in state, but rendering is chunked: each view slices to its visible count (initially `MAX_STRUCTURAL_ROWS` = 2000 / `MAX_DIFF_LINES` = 5000) and a "show more" button bumps the count by one chunk. Both counts reset on every Compare.

**`src/components/Viewer.jsx`** — single component used for both panels. Both panels render an editable `<textarea>` with the same background; the `editable` prop (default `false`) only switches the text color (input panel: green; output panel: emerald). Errors render in a `<pre>` instead. Manages its own `lineNumRef` and scroll sync internally — callers pass no refs. `LineNumbers` is a private sub-component inside this file, not exported.

**`src/helpers/jsonUtils.js`** — pure functions with no React dependency:
- `countLines(str)` — char-code loop, avoids `.split('\n')` array allocation
- `abbreviateKey(key, usedAbbrs)` — splits camelCase/snake_case/kebab-case into words, takes initials; keys ≤ 3 chars are kept as-is; collisions resolved by progressively taking more chars then appending a number
- `compressKeys(obj, keyMap, usedAbbrs)` — recursive, mutates the `keyMap` Map and `usedAbbrs` Set in place
- `diffStructural(a, b)` — recursive walk of two parsed values; returns `[{type: 'added'|'removed'|'changed', path, before, after}]` with dotted/bracketed paths
- `diffLines(aText, bText)` — LCS line diff with common prefix/suffix trimming; returns `[{type: 'same'|'add'|'del', text} | {type: 'skip', count}]`. Unchanged runs collapse git-style to 3 context lines plus a `skip` entry, so the result stays small for huge inputs. Falls back to plain del/add blocks when the LCS table would exceed 10M cells

## Styling

Tailwind v4 via `@tailwindcss/vite` plugin. No `tailwind.config.js` — configuration is done in `src/index.css`. Class-based dark mode is enabled with `@custom-variant dark (&:where(.dark, .dark *))` in `index.css`. Light theme is the base; `dark:` prefixes override to the dark palette.

The dark theme is OLED black: the entire `gray-*` scale is remapped in `@theme` (`index.css`) to pure neutrals with `gray-950: #000000` and `gray-900: #0a0a0a`. To re-skin the app, change those tokens — components only ever reference `gray-*`. The PWA `theme_color`/`background_color` and the icon backgrounds (`public/*.svg`) should match `gray-950`.

Three Google fonts (loaded in `index.html`): **Geist** is the default UI font (`html, body` rule), **Bebas Neue** is applied via the `.title` class (used once, on the header title), and **Cascadia Code** is wired through `@theme { --font-mono }` so every Tailwind `font-mono` utility uses it — viewers, diff results, key map, header braces. Don't add per-element font classes for code text; use `font-mono`.

## PWA & Deployment

`vite-plugin-pwa` generates a service worker (`generateSW` strategy) and `manifest.webmanifest` at build time. `base: '/Json/'` in `vite.config.js` is required for GitHub Pages — do not change it. The live URL is `https://purkayasta.github.io/Json/`.
