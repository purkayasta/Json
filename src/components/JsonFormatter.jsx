import { useState, useRef } from 'react'
import { compressKeys } from '../helpers/jsonUtils'
import Viewer from './Viewer'

export default function JsonFormatter({ hidden = false }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [tabSize, setTabSize] = useState(2)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [keyMap, setKeyMap] = useState(null)
  const [keyMapOpen, setKeyMapOpen] = useState(false)

  const copyTimeoutRef = useRef(null)

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
    <main className={`flex-col md:flex-row flex-1 overflow-hidden ${hidden ? 'hidden' : 'flex'}`}>
      {/* Left: Input Panel */}
      <div className="flex-1 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
        <div className="px-4 py-2 text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shrink-0">
          Paste here
        </div>
        <Viewer
          editable
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your JSON here..."
        />
      </div>

      {/* Middle: Controls — 2-col grid strip on mobile, vertical sidebar on md+ */}
      <div className="grid grid-cols-2 md:flex md:flex-col items-center justify-center gap-3 px-4 py-3 md:py-0 w-full md:w-44 shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
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
        <div className="flex flex-col items-start gap-1 w-full md:pt-1 md:border-t border-gray-200 dark:border-gray-800">
          <label className="text-xs text-gray-900 dark:text-gray-400">Tab Size</label>
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
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shrink-0">
          <span className="text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">Magic here</span>
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

        <Viewer value={output} error={error} onChange={(e) => setOutput(e.target.value)} />

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
                      <span className="text-gray-900 dark:text-gray-300">{original}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
