import type { Template, TextLayer, TextRun } from './types'

const CANVAS_BASE = 1080

interface StyledChar {
  char: string
  fill: string
  bold: boolean
  italic: boolean
  sizeMult: number
}

interface LineSpan {
  text: string
  fill: string
  bold: boolean
  italic: boolean
  sizeMult: number
}

type Line = LineSpan[]

function spanStylesMatch(a: StyledChar, b: StyledChar): boolean {
  return a.fill === b.fill && a.bold === b.bold && a.italic === b.italic && a.sizeMult === b.sizeMult
}

function runsToChars(runs: TextRun[]): StyledChar[] {
  return runs.flatMap((run) =>
    run.text.split('').map((char) => ({
      char,
      fill: run.style.fill,
      bold: run.style.bold ?? false,
      italic: run.style.italic ?? false,
      sizeMult: run.style.fontSize ?? 1,
    }))
  )
}

function charsToSpans(chars: StyledChar[]): Line {
  const spans: LineSpan[] = []
  for (const c of chars) {
    const last = spans[spans.length - 1]
    if (last && spanStylesMatch({ char: '', fill: last.fill, bold: last.bold, italic: last.italic, sizeMult: last.sizeMult }, c)) {
      last.text += c.char
    } else {
      spans.push({ text: c.char, fill: c.fill, bold: c.bold, italic: c.italic, sizeMult: c.sizeMult })
    }
  }
  return spans
}

function estimateCharWidth(char: string, fontSize: number, bold: boolean): number {
  const b = bold ? 1.1 : 1
  if (char === ' ') return fontSize * 0.28 * b
  if ('iIl1|!.,;:'.includes(char)) return fontSize * 0.33 * b
  if ('mwMW@'.includes(char)) return fontSize * 0.72 * b
  if ('frtj'.includes(char)) return fontSize * 0.42 * b
  return fontSize * 0.56 * b
}

function wrapText(runs: TextRun[], maxWidth: number, baseFontSize: number): Line[] {
  const chars = runsToChars(runs)

  // Build words (including trailing space with the word)
  const words: StyledChar[][] = []
  let current: StyledChar[] = []

  for (const c of chars) {
    if (c.char === '\n') {
      if (current.length) { words.push(current); current = [] }
      words.push([{ char: '\n', fill: '', bold: false, italic: false, sizeMult: 1 }])
    } else if (c.char === ' ') {
      current.push(c)
      words.push(current)
      current = []
    } else {
      current.push(c)
    }
  }
  if (current.length) words.push(current)

  const lines: Line[] = []
  let lineChars: StyledChar[] = []
  let lineWidth = 0

  const flushLine = () => {
    // Trim trailing spaces
    while (lineChars.length && lineChars[lineChars.length - 1].char === ' ') lineChars.pop()
    if (lineChars.length) lines.push(charsToSpans(lineChars))
    lineChars = []
    lineWidth = 0
  }

  for (const word of words) {
    if (word[0].char === '\n') { flushLine(); continue }

    let wordW = 0
    for (const c of word) {
      wordW += estimateCharWidth(c.char, baseFontSize * c.sizeMult, c.bold)
    }

    if (lineWidth + wordW > maxWidth && lineChars.length > 0) flushLine()

    lineChars.push(...word)
    lineWidth += wordW
  }
  flushLine()

  return lines
}

function escX(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function gradientCoords(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  const x2 = 50 + 50 * Math.cos(rad)
  const y2 = 50 + 50 * Math.sin(rad)
  return { x1: `${100 - x2}%`, y1: `${100 - y2}%`, x2: `${x2}%`, y2: `${y2}%` }
}

function fitFontSize(
  runs: TextRun[],
  bw: number,
  bh: number,
  maxFs: number,
  lineHeight: number
): number {
  // Binary search: find largest fontSize where all wrapped lines fit inside bh
  let lo = 8, hi = maxFs, best = Math.min(maxFs, 8)
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2
    const lines = wrapText(runs, bw, mid)
    if (lines.length * mid * lineHeight <= bh) {
      best = mid
      lo = mid
    } else {
      hi = mid
    }
  }
  return best
}

function renderTextLayer(layer: TextLayer, cw: number, ch: number): string {
  const bx = layer.boundingBox.x * cw
  const by = layer.boundingBox.y * ch
  const bw = layer.boundingBox.width * cw
  const bh = layer.boundingBox.height * ch

  const { fontSize, fontFamily, lineHeight, textAlign, fill } = layer.defaultStyle

  // Scale font size by canvas width, then clamp to fit bounding box height.
  // Landscape formats (LinkedIn 1200×627, Twitter 1600×900) have much less
  // vertical space than the 1080×1080 design baseline, so without clamping
  // the text overflows into adjacent layers.
  const widthScaled = fontSize * (cw / CANVAS_BASE)
  const fs = fitFontSize(layer.runs, bw, bh, widthScaled, lineHeight)

  const lines = wrapText(layer.runs, bw, fs)
  const lineH = fs * lineHeight
  const totalH = lines.length * lineH

  // Vertical center within bounding box
  const startY = by + Math.max(0, (bh - totalH) / 2) + fs * 0.82

  const textEls = lines
    .map((line, li) => {
      const y = startY + li * lineH

      let lineW = 0
      for (const span of line) {
        for (const ch2 of span.text) {
          lineW += estimateCharWidth(ch2, fs * span.sizeMult, span.bold)
        }
      }

      let x = bx
      if (textAlign === 'center') x = bx + (bw - lineW) / 2
      else if (textAlign === 'right') x = bx + bw - lineW

      const tspans = line.map((span) => {
        const fw = span.bold ? 'bold' : 'normal'
        const fst = span.italic ? 'italic' : 'normal'
        const spanFs = fs * span.sizeMult
        return `<tspan fill="${escX(span.fill)}" font-weight="${fw}" font-style="${fst}" font-size="${spanFs.toFixed(2)}">${escX(span.text)}</tspan>`
      })

      return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" font-family="${escX(fontFamily)}" font-size="${fs.toFixed(2)}" fill="${escX(fill)}">${tspans.join('')}</text>`
    })
    .join('\n')

  return `<g id="layer-${layer.id}">\n${textEls}\n</g>`
}

export function layoutEngine(
  template: Template,
  formatWidth?: number,
  formatHeight?: number,
  instanceId = 'main',
  skipLayerIds: string[] = []
): string {
  const W = formatWidth ?? template.width
  const H = formatHeight ?? template.height
  const { background, layers } = template

  // Unique gradient ID per SVG instance — avoids id="bg" conflicts when
  // multiple inline SVGs share the same document namespace.
  const gradId = `grad-${instanceId}`

  const grad = gradientCoords(background.angle)
  const stops = background.stops
    .map((s) => `<stop offset="${s.offset}" stop-color="${escX(s.color)}"/>`)
    .join('')

  const textLayers = layers
    .filter((l): l is TextLayer => l.type === 'text' && !skipLayerIds.includes(l.id))
    .map((l) => renderTextLayer(l, W, H))
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <linearGradient id="${gradId}" x1="${grad.x1}" y1="${grad.y1}" x2="${grad.x2}" y2="${grad.y2}">
    ${stops}
  </linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#${gradId})"/>${background.imageUrl ? `\n<image href="${escX(background.imageUrl)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>` : ''}
${textLayers}
</svg>`
}

export function computeFontSize(layer: import('./types').TextLayer, cw: number, ch: number): number {
  const bw = layer.boundingBox.width * cw
  const bh = layer.boundingBox.height * ch
  const widthScaled = layer.defaultStyle.fontSize * (cw / CANVAS_BASE)
  return fitFontSize(layer.runs, bw, bh, widthScaled, layer.defaultStyle.lineHeight)
}

export function makeDefaultTemplate(
  textColor: string,
  accentColor: string,
  background: Template['background']
): Template {
  return {
    width: 1080,
    height: 1080,
    background,
    layers: [
      {
        id: 'headline',
        type: 'text',
        runs: [
          { text: 'Your skin,', style: { fill: textColor } },
          { text: ' decoded', style: { fill: accentColor } },
        ],
        boundingBox: { x: 0.08, y: 0.25, width: 0.84, height: 0.25 },
        defaultStyle: {
          fill: textColor,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 108,
          lineHeight: 1.1,
          textAlign: 'left',
        },
        role: 'headline',
      },
      {
        id: 'body',
        type: 'text',
        runs: [
          {
            text: 'Personalized skincare backed by AI analysis. Built for your biology.',
            style: { fill: textColor },
          },
        ],
        boundingBox: { x: 0.08, y: 0.54, width: 0.75, height: 0.2 },
        defaultStyle: {
          fill: textColor,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 40,
          lineHeight: 1.5,
          textAlign: 'left',
        },
        role: 'body',
      },
      {
        id: 'cta',
        type: 'text',
        runs: [{ text: 'Discover your routine →', style: { fill: accentColor } }],
        boundingBox: { x: 0.08, y: 0.77, width: 0.5, height: 0.1 },
        defaultStyle: {
          fill: accentColor,
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 36,
          lineHeight: 1.4,
          textAlign: 'left',
        },
        role: 'cta',
      },
    ],
  }
}
