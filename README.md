<div align="center">

```
{ "JSON Formatter" }
```

### A fast, beautiful JSON formatter built for developers

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://purkayasta.github.io/Json/)
[![Deploy](https://img.shields.io/badge/GitHub%20Pages-live-22c55e?style=flat-square&logo=github&logoColor=white)](https://purkayasta.github.io/Json/)

**[Live Demo →](https://purkayasta.github.io/Json/)**

</div>

---

## Features

| Feature | Description |
|---|---|
| **Beautify** | Format messy JSON with configurable indent — 2, 3, or 4 spaces |
| **Minify** | Strip all whitespace into a single compact line |
| **Compress** | Shorten keys using smart abbreviation — `firstName` → `fn`, `createdAt` → `ca` |
| **Key Map** | Collapsible reference showing every compressed key → original key |
| **Line Numbers** | Real-time line numbers on both input and output panels, scroll-synced |
| **Copy to Clipboard** | One-click copy of the output with visual confirmation |
| **Dark / Light Mode** | Toggle between themes, applied instantly with no flash |
| **PWA + Offline** | Installable on any device, works fully offline after first visit |
| **Error Display** | Parse errors shown inline with the exact position reported by the browser |

---

## Tech Stack

- **[React 19](https://react.dev)** with the new **React Compiler** — automatic memoization, zero manual `useMemo`/`useCallback`
- **[Vite 8](https://vite.dev)** — sub-second HMR and optimized production builds
- **[Tailwind CSS v4](https://tailwindcss.com)** — utility-first styling, zero custom CSS
- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)** — Workbox-powered service worker and Web App Manifest

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io)

### Installation

```bash
# Clone the repo
git clone https://github.com/purkayasta/Json.git
cd Json

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage

1. **Paste** your JSON into the left panel
2. **Choose** an action from the middle panel:
   - `Beautify` — formats with the selected tab size
   - `Minify` — collapses to a single line
   - `Compress` — shortens all keys to save bytes
3. **Copy** the result from the output panel with the copy button
4. If you used **Compress**, expand the **Key Map** footer to see what each short key means

---

## Project Structure

```
src/
├── components/
│   ├── JsonFormatter.jsx   # Main layout and state — orchestrator only
│   └── Viewer.jsx          # Read-only / editable panel with line numbers
├── helpers/
│   └── jsonUtils.js        # Pure functions: countLines, abbreviateKey, compressKeys
├── App.jsx
├── main.jsx
└── index.css
```

---

## Deploy to GitHub Pages

```bash
pnpm deploy
```

This runs `pnpm build` first, then pushes the `dist/` folder to the `gh-pages` branch. The live site updates at **[purkayasta.github.io/Json](https://purkayasta.github.io/Json/)** within a minute.

---

## PWA Installation

The app is installable on desktop and mobile. After visiting the live URL, look for the **install** prompt in your browser's address bar (Chrome/Edge) or use **Add to Home Screen** on iOS/Android.

Once installed, the app works **completely offline** — all assets are precached by the Workbox service worker on first load.

---

## Performance Notes

- Formatting runs **on demand** (button click only) — zero processing per keystroke
- **React Compiler** handles all memoization automatically
- Line numbers use a **single text node** (`nums.join('\n')`) — no per-line DOM elements
- `countLines` uses a **char-code loop** instead of `.split('\n')` to avoid array allocation
- Minified output uses `whitespace-pre-wrap break-all` — wraps at panel boundary instead of expanding layout

---

## License

MIT

---

<div align="center">

made with **React** + **Tailwind** + **Vite** + **Claude** ❤️

by [pritom](https://bd.linkedin.com/in/purkayasta)

</div>
