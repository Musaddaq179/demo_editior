import type { TextRun } from './types'

export function mergeRuns(runs: TextRun[]): TextRun[] {
  const out: TextRun[] = []
  for (const run of runs) {
    const last = out[out.length - 1]
    if (
      last &&
      last.style.fill === run.style.fill &&
      (last.style.bold ?? false) === (run.style.bold ?? false) &&
      (last.style.italic ?? false) === (run.style.italic ?? false) &&
      (last.style.fontSize ?? 1) === (run.style.fontSize ?? 1)
    ) {
      out[out.length - 1] = { ...last, text: last.text + run.text }
    } else {
      out.push({ text: run.text, style: { ...run.style } })
    }
  }
  return out
}
