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
