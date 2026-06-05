import { useState, useRef, useLayoutEffect } from 'react'
import { compressKeys } from '../helpers/jsonUtils'
import Viewer from './Viewer'

export default function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [tabSize, setTabSize] = useState(2)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [keyMap, setKeyMap] = useState(null)
  const [keyMapOpen, setKeyMapOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)

  const copyTimeoutRef = useRef(null)

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  function handleCopy() {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    })
  }

  function processJson(indent) {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      setKeyMap(null)
      return
    }
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
      setError(null)
      setKeyMap(null)
    } catch (e) {
      setError(e.message)
      setOutput('')
      setKeyMap(null)
    }
  }

  const handleBeautify = () => processJson(tabSize)
  const handleMinify = () => processJson(0)

  function handleCompress() {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      setKeyMap(null)
      return
    }
    try {
      const parsed = JSON.parse(input)
      const map = new Map()
      const used = new Set()
      const compressed = compressKeys(parsed, map, used)
      setOutput(JSON.stringify(compressed))
      setKeyMap(Object.fromEntries(map))
      setKeyMapOpen(false)
      setError(null)
    } catch (e) {
      setError(e.message)
      setOutput('')
      setKeyMap(null)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex items-baseline gap-3">
          <h1 className="font-mono text-lg font-semibold">
            <span className="text-blue-500 dark:text-blue-400">&#123;</span>
            <span className="text-yellow-500 dark:text-yellow-300 mx-1">"</span>
            <span className="text-gray-900 dark:text-white tracking-wide">JSON Formatter</span>
            <span className="text-yellow-500 dark:text-yellow-300 mx-1">"</span>
            <span className="text-blue-500 dark:text-blue-400">&#125;</span>
          </h1>
          <p className="font-mono text-xs text-gray-400 dark:text-gray-500">
            <span className="text-green-600 dark:text-green-500">// </span>
            undefined is not JSON serializable
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDark(d => !d)}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Left: Input Panel */}
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-800">
          <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shrink-0">
            Input
          </div>
          <Viewer
            editable
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
          />
        </div>

        {/* Middle: Controls */}
        <div className="flex flex-col items-center justify-center gap-3 px-4 w-44 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
          <button
            type="button"
            onClick={handleBeautify}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-md font-medium text-sm transition-colors cursor-pointer"
          >
            Beautify
          </button>
          <button
            type="button"
            onClick={handleMinify}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-800 dark:text-white rounded-md font-medium text-sm transition-colors cursor-pointer"
          >
            Minify
          </button>
          <button
            type="button"
            onClick={handleCompress}
            className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white dark:bg-violet-700 dark:hover:bg-violet-600 dark:active:bg-violet-800 rounded-md font-medium text-sm transition-colors cursor-pointer"
          >
            Compress
          </button>
          <div className="flex flex-col items-start gap-1 w-full pt-1 border-t border-gray-200 dark:border-gray-800">
            <label className="text-xs text-gray-500 dark:text-gray-400">Tab Size</label>
            <select
              value={tabSize}
              onChange={(e) => setTabSize(Number(e.target.value))}
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded px-2 py-1.5 text-sm outline-none cursor-pointer"
            >
              <option value={2}>2 spaces</option>
              <option value={3}>3 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>
        </div>

        {/* Right: Output Panel */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shrink-0">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Output</span>
            {output && !error && (
              <button
                type="button"
                onClick={handleCopy}
                title="Copy to clipboard"
                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          <Viewer value={output} error={error} />

          {/* Key Map footer */}
          {keyMap && (
            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shrink-0">
              <button
                type="button"
                onClick={() => setKeyMapOpen(o => !o)}
                className="flex items-center justify-between w-full px-4 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <span className="font-medium uppercase tracking-wider">Key Map</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12" height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${keyMapOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {keyMapOpen && (
                <div className="px-4 pb-3 max-h-36 overflow-auto">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {Object.entries(keyMap).map(([original, short]) => (
                      <span key={original} className="font-mono text-xs">
                        <span className="text-violet-600 dark:text-violet-400">{short}</span>
                        <span className="text-gray-400 dark:text-gray-500"> → </span>
                        <span className="text-gray-700 dark:text-gray-300">{original}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="flex items-center justify-center gap-1.5 px-6 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-500">made with</span>
        <span className="text-xs font-medium text-blue-500 dark:text-blue-400">React</span>
        <span className="text-xs text-gray-300 dark:text-gray-600">+</span>
        <span className="text-xs font-medium text-cyan-500 dark:text-cyan-400">Tailwind</span>
        <span className="text-xs text-gray-300 dark:text-gray-600">+</span>
        <span className="text-xs font-medium text-violet-500 dark:text-violet-400 flex items-center gap-0.5">
            <svg width="12" height="12" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"/>
            </svg>
            Vite
          </span>
        <span className="text-xs text-gray-300 dark:text-gray-600">+</span>
        <span className="text-xs font-medium text-orange-500 dark:text-orange-400">Claude</span>
        <span className="text-xs">❤️</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">by</span>
        <a
          href="https://bd.linkedin.com/in/purkayasta"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >pritom</a>
      </footer>
    </div>
  )
}
