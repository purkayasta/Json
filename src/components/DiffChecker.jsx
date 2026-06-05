import { useState, useRef } from 'react'
import Viewer from './Viewer'

const MAX_STRUCTURAL_ROWS = 2000
const MAX_DIFF_LINES = 5000

function formatValue(value) {
  // avoid stringifying huge subtrees just to truncate the preview
  if (Array.isArray(value)) return `[… ${value.length} items]`
  if (value !== null && typeof value === 'object') return `{… ${Object.keys(value).length} keys}`
  if (typeof value === 'string' && value.length > 57) return JSON.stringify(value.slice(0, 57)) + '...'
  const str = JSON.stringify(value)
  return str.length > 60 ? str.slice(0, 57) + '...' : str
}

// Fixed-size chunks with stable props (array identity + start offset), so "show
// more" only renders the newly revealed chunk — earlier chunks bail out.
function StructuralChunk({ structural, start }) {
  return structural.slice(start, start + MAX_STRUCTURAL_ROWS).map((d, i) => (
    <div key={i} className="font-mono text-xs leading-5 flex gap-2">
      {d.type === 'changed' && (
        <>
          <span className="text-yellow-600 dark:text-yellow-400 shrink-0">~</span>
          <span className="text-gray-900 dark:text-gray-300 shrink-0">{d.path}</span>
          <span className="text-red-600 dark:text-red-400">{formatValue(d.before)}</span>
          <span className="text-gray-400 dark:text-gray-500">→</span>
          <span className="text-green-600 dark:text-green-400">{formatValue(d.after)}</span>
        </>
      )}
      {d.type === 'added' && (
        <>
          <span className="text-green-600 dark:text-green-400 shrink-0">+</span>
          <span className="text-gray-900 dark:text-gray-300 shrink-0">{d.path}</span>
          <span className="text-green-600 dark:text-green-400">{formatValue(d.after)}</span>
        </>
      )}
      {d.type === 'removed' && (
        <>
          <span className="text-red-600 dark:text-red-400 shrink-0">-</span>
          <span className="text-gray-900 dark:text-gray-300 shrink-0">{d.path}</span>
          <span className="text-red-600 dark:text-red-400">{formatValue(d.before)}</span>
        </>
      )}
    </div>
  ))
}

function LinesChunk({ lines, start }) {
  return lines.slice(start, start + MAX_DIFF_LINES).map((l, i) => (
    l.type === 'skip' ? (
      <div key={i} className="text-gray-400 dark:text-gray-500 select-none">
        {`  ⋯ ${l.count.toLocaleString()} unchanged lines ⋯`}
      </div>
    ) : (
      <div
        key={i}
        className={
          l.type === 'add'
            ? 'text-green-700 dark:text-green-400 bg-green-500/10'
            : l.type === 'del'
              ? 'text-red-600 dark:text-red-400 bg-red-500/10'
              : 'text-gray-500 dark:text-gray-400'
        }
      >
        {l.type === 'add' ? '+ ' : l.type === 'del' ? '- ' : '  '}
        {l.text}
      </div>
    )
  ))
}

export default function DiffChecker({ hidden = false }) {
  const [original, setOriginal] = useState('')
  const [changed, setChanged] = useState('')
  const [error, setError] = useState(null)
  const [diff, setDiff] = useState(null)
  const [view, setView] = useState('lines')
  const [visibleStructural, setVisibleStructural] = useState(MAX_STRUCTURAL_ROWS)
  const [visibleLines, setVisibleLines] = useState(MAX_DIFF_LINES)
  const [loading, setLoading] = useState(false)
  const [resultHeight, setResultHeight] = useState(null) // null = auto (shrink to fit, capped by max-h)

  const resizeRef = useRef(null)
  const contentRef = useRef(null)
  const workerRef = useRef(null)

  function startResize(e) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    resizeRef.current = { startY: e.clientY, startHeight: resultHeight ?? contentRef.current.offsetHeight }
  }

  function moveResize(e) {
    if (!resizeRef.current) return
    const { startY, startHeight } = resizeRef.current
    const next = startHeight + (startY - e.clientY)
    setResultHeight(Math.min(Math.max(next, 64), window.innerHeight - 200))
  }

  function endResize() {
    resizeRef.current = null
  }

  function handleCompare() {
    if (!original.trim() || !changed.trim()) {
      setDiff(null)
      setError(null)
      return
    }
    setLoading(true)
    if (!workerRef.current) {
      // created lazily on first compare; parse + diff run off the main thread
      workerRef.current = new Worker(new URL('../helpers/diffWorker.js', import.meta.url), { type: 'module' })
      workerRef.current.onmessage = (e) => {
        setLoading(false)
        if (e.data.error) {
          setError(e.data.error)
          setDiff(null)
          return
        }
        setError(null)
        setVisibleStructural(MAX_STRUCTURAL_ROWS)
        setVisibleLines(MAX_DIFF_LINES)
        setDiff(e.data.diff)
      }
    }
    workerRef.current.postMessage({ original, changed })
  }

  return (
    <div className={`flex-1 flex-col overflow-hidden ${hidden ? 'hidden' : 'flex'}`}>
      <main className="flex flex-1 overflow-hidden">
        {/* Left: Original */}
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-800">
          <div className="px-4 py-2 text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shrink-0">
            Original
          </div>
          <Viewer
            editable
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste original JSON here..."
          />
        </div>

        {/* Middle: Controls */}
        <div className="flex flex-col items-center justify-center gap-3 px-4 w-44 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
          <button
            type="button"
            onClick={handleCompare}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-md font-medium text-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-default"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Comparing
              </span>
            ) : 'Compare'}
          </button>
        </div>

        {/* Right: Changed */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2 text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shrink-0">
            Changed
          </div>
          <Viewer
            editable
            value={changed}
            onChange={(e) => setChanged(e.target.value)}
            placeholder="Paste changed JSON here..."
          />
        </div>
      </main>

      {/* Results footer */}
      {(error || diff) && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shrink-0">
          <div
            onPointerDown={startResize}
            onPointerMove={moveResize}
            onPointerUp={endResize}
            className="h-1.5 -mt-1 cursor-row-resize touch-none hover:bg-blue-500/40 active:bg-blue-500/40 transition-colors"
          />
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-medium text-gray-900 dark:text-gray-400 uppercase tracking-wider">
              {error ? 'Error' : `Differences (${diff.structural.length})`}
            </span>
            {diff && (
              <div className="flex gap-1">
                {['structural', 'lines'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className={`px-2 py-0.5 rounded text-xs font-medium capitalize transition-colors cursor-pointer ${view === v
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            ref={contentRef}
            className={`px-4 pb-3 overflow-auto ${resultHeight === null ? 'max-h-56' : ''}`}
            style={resultHeight === null ? undefined : { height: resultHeight }}
          >
            {error ? (
              <p className="text-red-600 dark:text-red-400 font-mono text-xs leading-5">{error}</p>
            ) : diff.structural.length === 0 ? (
              <p className="text-gray-900 dark:text-gray-400 font-mono text-xs leading-5">No differences — both documents are identical.</p>
            ) : view === 'structural' ? (
              <div className="flex flex-col gap-0.5">
                {Array.from(
                  { length: Math.ceil(Math.min(visibleStructural, diff.structural.length) / MAX_STRUCTURAL_ROWS) },
                  (_, c) => <StructuralChunk key={c} structural={diff.structural} start={c * MAX_STRUCTURAL_ROWS} />
                )}
                {diff.structural.length > visibleStructural && (
                  <button
                    type="button"
                    onClick={() => setVisibleStructural(c => c + MAX_STRUCTURAL_ROWS)}
                    className="font-mono text-xs leading-5 text-left text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    ⋯ show {Math.min(MAX_STRUCTURAL_ROWS, diff.structural.length - visibleStructural).toLocaleString()} more ({(diff.structural.length - visibleStructural).toLocaleString()} hidden)
                  </button>
                )}
              </div>
            ) : (
              <pre className="font-mono text-xs leading-5">
                {Array.from(
                  { length: Math.ceil(Math.min(visibleLines, diff.lines.length) / MAX_DIFF_LINES) },
                  (_, c) => <LinesChunk key={c} lines={diff.lines} start={c * MAX_DIFF_LINES} />
                )}
                {diff.lines.length > visibleLines && (
                  <button
                    type="button"
                    onClick={() => setVisibleLines(c => c + MAX_DIFF_LINES)}
                    className="block text-left text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {`  ⋯ show ${Math.min(MAX_DIFF_LINES, diff.lines.length - visibleLines).toLocaleString()} more (${(diff.lines.length - visibleLines).toLocaleString()} hidden)`}
                  </button>
                )}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
