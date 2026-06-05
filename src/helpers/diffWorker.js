import { diffStructural, diffLines } from './jsonUtils'

self.onmessage = (e) => {
  const { original, changed } = e.data
  let a, b
  try {
    a = JSON.parse(original)
  } catch (err) {
    self.postMessage({ error: `Original: ${err.message}` })
    return
  }
  try {
    b = JSON.parse(changed)
  } catch (err) {
    self.postMessage({ error: `Changed: ${err.message}` })
    return
  }
  self.postMessage({
    diff: {
      structural: diffStructural(a, b),
      lines: diffLines(JSON.stringify(a, null, 2), JSON.stringify(b, null, 2)),
    },
  })
}
