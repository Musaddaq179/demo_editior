import type { TextRun, TextStyle } from './types'

function stylesMatch(a: TextStyle, b: TextStyle): boolean {
  return (
    a.fill === b.fill &&
    Boolean(a.bold) === Boolean(b.bold) &&
    Boolean(a.italic) === Boolean(b.italic) &&
    (a.fontSize ?? 1) === (b.fontSize ?? 1)
  )
}

export function runsToString(runs: TextRun[]): string {
  return runs.map((r) => r.text).join('')
}

export function applyStyleToRange(
  runs: TextRun[],
  start: number,
  end: number,
  style: Partial<TextStyle>
): TextRun[] {
  if (start === end) return runs

  // Build flat char array
  type StyledChar = { char: string; style: TextStyle }
  const chars: StyledChar[] = runs.flatMap((run) =>
    run.text.split('').map((char) => ({ char, style: { ...run.style } }))
  )

  // Apply style to range
  for (let i = start; i < Math.min(end, chars.length); i++) {
    chars[i].style = { ...chars[i].style, ...style }
  }

  // Rebuild runs by coalescing adjacent same-style chars
  const newRuns: TextRun[] = []
  let current: TextRun | null = null
  for (const { char, style: s } of chars) {
    if (current && stylesMatch(current.style, s)) {
      current.text += char
    } else {
      current = { text: char, style: { ...s } }
      newRuns.push(current)
    }
  }

  return newRuns
}

export function getSelectionInContainer(container: HTMLElement): { start: number; end: number } | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return null
  const range = sel.getRangeAt(0)
  if (!container.contains(range.commonAncestorContainer)) return null
  if (range.collapsed) return null

  const getOffset = (targetNode: Node, targetOffset: number): number => {
    let count = 0
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
    let node: Node | null
    while ((node = walker.nextNode())) {
      if (node === targetNode) return count + targetOffset
      count += (node.textContent ?? '').length
    }
    return count
  }

  const start = getOffset(range.startContainer, range.startOffset)
  const end = getOffset(range.endContainer, range.endOffset)
  return start < end ? { start, end } : { start: end, end: start }
}
