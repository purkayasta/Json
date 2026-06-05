import { useState, useLayoutEffect } from 'react'
import JsonFormatter from './components/JsonFormatter'
import DiffChecker from './components/DiffChecker'

const MODES = [
  { id: 'formatter', label: 'Formatter' },
  { id: 'diff', label: 'Diff' },
]

export default function App() {
  const [mode, setMode] = useState('formatter')
  const [isDark, setIsDark] = useState(true)

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex items-baseline gap-3">
          <h1 className="font-mono text-lg font-semibold">
            <span className="text-blue-500 dark:text-blue-400">&#123;</span>
            <span className="text-yellow-500 dark:text-yellow-300 mx-1">"</span>
            <span className="text-gray-500 dark:text-white tracking-wide title">JSON Tools</span>
            <span className="text-yellow-500 dark:text-yellow-300 mx-1">"</span>
            <span className="text-blue-500 dark:text-blue-400">&#125;</span>
          </h1>
          <p className="font-mono text-xs text-gray-900 dark:text-gray-500">
            <span className="text-green-600 dark:text-green-500">// </span>
            where strings become objects
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            {MODES.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  mode === m.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
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
        </div>
      </header>

      {/* Both stay mounted so each tool keeps its state when switching tabs */}
      <JsonFormatter hidden={mode !== 'formatter'} />
      <DiffChecker hidden={mode !== 'diff'} />

      <footer className="flex items-center justify-center gap-1.5 px-6 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shrink-0">
        <span className="text-xs text-gray-900 dark:text-gray-500">made with</span>
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
        <span className="text-xs text-gray-900 dark:text-gray-500">by</span>
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
