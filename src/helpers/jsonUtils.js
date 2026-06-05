export function countLines(str) {
  if (!str) return 1
  let n = 1
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === 10) n++
  }
  return n
}

export function abbreviateKey(key, usedAbbrs) {
  if (key.length <= 3 && !usedAbbrs.has(key)) return key
  const words = key
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .split(/[\s_\-]+/)
    .filter(Boolean)
  let abbr = words.length === 1
    ? key.slice(0, 2).toLowerCase()
    : words.map(w => w[0]).join('')
  if (!usedAbbrs.has(abbr)) return abbr
  for (let len = abbr.length + 1; len <= key.length; len++) {
    const candidate = key.slice(0, len).toLowerCase()
    if (!usedAbbrs.has(candidate)) return candidate
  }
  let i = 2
  while (usedAbbrs.has(abbr + i)) i++
  return abbr + i
}

export function diffStructural(a, b, path = '', out = []) {
  if (a === b) return out
  const aIsObj = a !== null && typeof a === 'object'
  const bIsObj = b !== null && typeof b === 'object'
  if (!aIsObj || !bIsObj || Array.isArray(a) !== Array.isArray(b)) {
    out.push({ type: 'changed', path: path || '(root)', before: a, after: b })
    return out
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    const childPath = Array.isArray(a) ? `${path}[${key}]` : path ? `${path}.${key}` : key
    if (!(key in a)) out.push({ type: 'added', path: childPath, after: b[key] })
    else if (!(key in b)) out.push({ type: 'removed', path: childPath, before: a[key] })
    else diffStructural(a[key], b[key], childPath, out)
  }
  return out
}

const DIFF_CONTEXT = 3

export function diffLines(aText, bText) {
  const a = aText.split('\n')
  const b = bText.split('\n')
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let endA = a.length
  let endB = b.length
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--
    endB--
  }
  const midA = a.slice(start, endA)
  const midB = b.slice(start, endB)
  const n = midA.length
  const m = midB.length

  const mid = []
  if (n * m > 10_000_000) {
    // LCS table too large — fall back to plain removed/added blocks
    for (const text of midA) mid.push({ type: 'del', text })
    for (const text of midB) mid.push({ type: 'add', text })
  } else {
    const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = midA[i] === midB[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
      }
    }
    let i = 0
    let j = 0
    while (i < n && j < m) {
      if (midA[i] === midB[j]) {
        mid.push({ type: 'same', text: midA[i] })
        i++
        j++
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        mid.push({ type: 'del', text: midA[i] })
        i++
      } else {
        mid.push({ type: 'add', text: midB[j] })
        j++
      }
    }
    while (i < n) mid.push({ type: 'del', text: midA[i++] })
    while (j < m) mid.push({ type: 'add', text: midB[j++] })
  }

  // Collapse unchanged runs to DIFF_CONTEXT lines around changes, git-style,
  // so the result stays small even when the inputs have millions of lines.
  const out = []
  if (start > DIFF_CONTEXT) out.push({ type: 'skip', count: start - DIFF_CONTEXT })
  for (let k = Math.max(0, start - DIFF_CONTEXT); k < start; k++) out.push({ type: 'same', text: a[k] })

  let i = 0
  while (i < mid.length) {
    if (mid[i].type !== 'same') {
      out.push(mid[i])
      i++
      continue
    }
    let j = i
    while (j < mid.length && mid[j].type === 'same') j++
    const runLen = j - i
    if (runLen > DIFF_CONTEXT * 2 + 1) {
      for (let k = i; k < i + DIFF_CONTEXT; k++) out.push(mid[k])
      out.push({ type: 'skip', count: runLen - DIFF_CONTEXT * 2 })
      for (let k = j - DIFF_CONTEXT; k < j; k++) out.push(mid[k])
    } else {
      for (let k = i; k < j; k++) out.push(mid[k])
    }
    i = j
  }

  const suffixCount = a.length - endA
  for (let k = endA; k < endA + Math.min(suffixCount, DIFF_CONTEXT); k++) out.push({ type: 'same', text: a[k] })
  if (suffixCount > DIFF_CONTEXT) out.push({ type: 'skip', count: suffixCount - DIFF_CONTEXT })
  return out
}

export function compressKeys(obj, keyMap, usedAbbrs) {
  if (Array.isArray(obj)) return obj.map(item => compressKeys(item, keyMap, usedAbbrs))
  if (obj !== null && typeof obj === 'object') {
    const result = {}
    for (const key of Object.keys(obj)) {
      if (!keyMap.has(key)) {
        const abbr = abbreviateKey(key, usedAbbrs)
        keyMap.set(key, abbr)
        usedAbbrs.add(abbr)
      }
      result[keyMap.get(key)] = compressKeys(obj[key], keyMap, usedAbbrs)
    }
    return result
  }
  return obj
}
