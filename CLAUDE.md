# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start dev server at localhost:5173
pnpm build        # production build (outputs to dist/)
pnpm preview      # preview the production build locally
pnpm lint         # run ESLint across all js/jsx files
pnpm deploy       # build then push dist/ to gh-pages branch
```

No test suite is configured. There is no `pnpm test` command.

## Architecture

State lives entirely in `JsonFormatter.jsx`. `Viewer.jsx` and `jsonUtils.js` are stateless. Data flows one way: user types → `JsonFormatter` holds `input`; user clicks a button → `JsonFormatter` computes `output`/`error`/`keyMap` → passes down to `Viewer`.

**`src/components/JsonFormatter.jsx`** — the only stateful component. Owns `input`, `output`, `error`, `keyMap`, `tabSize`, `isDark`, `copied`. All three action handlers (`handleBeautify`, `handleMinify`, `handleCompress`) call through `processJson` or operate directly. Dark mode is applied by toggling `.dark` on `document.documentElement` via `useLayoutEffect` (not `useEffect` — avoids flash on load).

**`src/components/Viewer.jsx`** — single component used for both panels. `editable` prop (default `false`) switches between a `<textarea>` (input panel, green text) and a `<pre>` (output panel, emerald text). Manages its own `lineNumRef` and scroll sync internally — callers pass no refs. `LineNumbers` is a private sub-component inside this file, not exported.

**`src/helpers/jsonUtils.js`** — three pure functions with no React dependency:
- `countLines(str)` — char-code loop, avoids `.split('\n')` array allocation
- `abbreviateKey(key, usedAbbrs)` — splits camelCase/snake_case/kebab-case into words, takes initials; keys ≤ 3 chars are kept as-is; collisions resolved by progressively taking more chars then appending a number
- `compressKeys(obj, keyMap, usedAbbrs)` — recursive, mutates the `keyMap` Map and `usedAbbrs` Set in place

## Styling

Tailwind v4 via `@tailwindcss/vite` plugin. No `tailwind.config.js` — configuration is done in `src/index.css`. Class-based dark mode is enabled with `@custom-variant dark (&:where(.dark, .dark *))` in `index.css`. Light theme is the base; `dark:` prefixes override to the dark palette. No custom CSS beyond this one directive and the font declaration.

## PWA & Deployment

`vite-plugin-pwa` generates a service worker (`generateSW` strategy) and `manifest.webmanifest` at build time. `base: '/Json/'` in `vite.config.js` is required for GitHub Pages — do not change it. The live URL is `https://purkayasta.github.io/Json/`.
