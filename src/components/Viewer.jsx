import { useRef, useMemo } from 'react'
import { countLines } from '../helpers/jsonUtils'

const MAX_LINE_NUMBERS = 100_000

function LineNumbers({ count, elRef }) {
  const text = useMemo(() => {
    const nums = []
    for (let i = 1; i <= Math.max(Math.min(count, MAX_LINE_NUMBERS), 1); i++) nums.push(i)
    if (count > MAX_LINE_NUMBERS) nums.push('⋯')
    return nums.join('\n')
  }, [count])
  return (
    <div
      ref={elRef}
      className="overflow-hidden shrink-0 select-none border-r border-gray-200 dark:border-gray-700"
    >
      <pre className="font-mono text-sm leading-5 text-right text-gray-400 dark:text-gray-500 px-2 pt-4 pb-4 min-w-[2.75rem]">
        {text}
      </pre>
    </div>
  )
}

export default function Viewer({ value, error, editable = false, onChange, placeholder }) {
  const lineNumRef = useRef(null)

  function handleScroll(e) {
    if (lineNumRef.current) {
      lineNumRef.current.scrollTop = e.currentTarget.scrollTop
    }
  }

  const lines = useMemo(() => (error ? 1 : countLines(value)), [value, error])

  return (
    <div className="flex flex-1 overflow-hidden bg-white dark:bg-gray-900">
      <LineNumbers count={lines} elRef={lineNumRef} />
      {error ? (
        <div className="flex-1 overflow-auto pt-4 pb-4 pl-2 pr-4" onScroll={handleScroll}>
          <p className="text-red-600 dark:text-red-400 font-mono text-sm leading-5">{error}</p>
        </div>
      ) : (
        <textarea
          className={`flex-1 resize-none bg-transparent ${editable ? 'text-green-700 dark:text-green-400' : 'text-emerald-700 dark:text-emerald-300'} font-mono text-sm leading-5 pl-2 pt-4 pb-4 pr-4 outline-none placeholder-gray-400 dark:placeholder-gray-600`}
          value={value}
          onChange={onChange}
          onScroll={handleScroll}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      )}
    </div>
  )
}
