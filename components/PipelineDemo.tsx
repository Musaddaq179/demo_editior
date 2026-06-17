'use client'

import { useMemo, useState } from 'react'
import { layoutEngine } from '@/lib/layoutEngine'
import { buildSampleTemplate, SAMPLE_LAYER_META, type LayerMeta } from '@/lib/pipelineData'
import { mergeRuns } from '@/lib/mergeRuns'
import type { Template, TextLayer } from '@/lib/types'

const FONT_OPTIONS = ['Montserrat', 'DM Sans', 'Inter', 'Roboto', 'Poppins', 'Playfair Display']

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function tok(color: string, text: string) {
  return `<span style="color:${color}">${esc(text)}</span>`
}

function buildJsonHtml(runs: { text: string; style: { fill: string } }[]): string {
  const C = { punct: '#6b6b80', key: '#a78bfa', str: '#86efac', teal: '#1ABCB2' }
  const lines: string[] = [
    tok(C.punct, '{'),
    `  ${tok(C.key, '"id"')}${tok(C.punct, ': ')}${tok(C.str, '"title"')}${tok(C.punct, ',')}`,
    `  ${tok(C.key, '"runs"')}${tok(C.punct, ': [')}`,
  ]
  runs.forEach((run, i) => {
    const isTeal = run.style.fill.toUpperCase() === '#1ABCB2'
    const color = isTeal ? C.teal : C.str
    const comma = i < runs.length - 1 ? tok(C.punct, ',') : ''
    lines.push(`    ${tok(C.punct, '{')}`)
    lines.push(`      ${tok(C.key, '"text"')}${tok(C.punct, ': ')}${tok(color, `"${run.text}"`)}${tok(C.punct, ',')}`)
    lines.push(`      ${tok(C.key, '"fill"')}${tok(C.punct, ': ')}${tok(color, `"${run.style.fill}"`)}`)
    lines.push(`    ${tok(C.punct, '}')}${comma}`)
  })
  lines.push(`  ${tok(C.punct, ']')}`)
  lines.push(tok(C.punct, '}'))
  return lines.join('\n')
}

function buildDetectionSvg(): string {
  const W = 1016, H = 1280
  const items = [
    { tag: 'heading', pct: 100, x: 0.887, y: 0.027, w: 0.059, h: 0.040, hex: 'e8e8f0' },
    { tag: 'body',    pct: 45,  x: 0.311, y: 0.534, w: 0.363, h: 0.040, hex: '4f6ef7' },
    { tag: 'title',   pct: 77,  x: 0.079, y: 0.616, w: 0.850, h: 0.298, hex: '1ABCB2' },
    { tag: 'cta',     pct: 78,  x: 0.419, y: 0.931, w: 0.132, h: 0.040, hex: 'f5c518' },
  ]
  const shapes = items.map(({ tag, pct, x, y, w, h, hex }) => {
    const [rx, ry, rw, rh] = [x * W, y * H, w * W, h * H].map(Math.round)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const color = `#${hex}`
    const pillText = `${tag} ${pct}%`
    const pillW = pillText.length * 7 + 10
    const pillH = 18
    const pillY = ry > pillH + 6 ? ry - pillH - 4 : ry + rh + 4
    const textFill = hex === 'e8e8f0' ? '#111214' : '#000000'
    return [
      `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="rgba(${r},${g},${b},0.12)" stroke="${color}" stroke-width="1.5" rx="2"/>`,
      `<rect x="${rx}" y="${pillY}" width="${pillW}" height="${pillH}" fill="${color}" rx="3"/>`,
      `<text x="${rx + 5}" y="${pillY + 13}" font-family="'Courier New',monospace" font-size="11" fill="${textFill}">${pillText}</text>`,
    ].join('')
  })
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">`,
    `<defs><linearGradient id="det-bg" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="#111214"/><stop offset="100%" stop-color="#0a0a0c"/>`,
    `</linearGradient></defs>`,
    `<rect width="${W}" height="${H}" fill="url(#det-bg)"/>`,
    ...shapes,
    `</svg>`,
  ].join('')
}

const DETECTION_SVG = buildDetectionSvg()

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color = confidence >= 0.8 ? '#22c55e' : confidence >= 0.5 ? '#f59e0b' : '#ef4444'
  const label = confidence >= 0.8 ? 'High' : confidence >= 0.5 ? 'Medium' : 'Low'
  return (
    <span className="flex items-center gap-1.5">
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      <span className="text-xs font-medium" style={{ color }}>{(confidence * 100).toFixed(0)}% {label}</span>
    </span>
  )
}

function LayerSidebar({
  meta, fontOverrides, onOverride,
}: {
  meta: LayerMeta[]
  fontOverrides: Record<string, string>
  onOverride: (id: string, font: string) => void
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#16161f', border: '1px solid #2a2a3a' }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #2a2a3a' }}>
        <p className="text-xs font-semibold" style={{ color: '#e8e8f0' }}>Layer Detection</p>
        <p className="text-xs mt-0.5" style={{ color: '#6b6b80' }}>Font confidence per layer — override if needed</p>
      </div>
      {meta.map((m, i) => (
        <div key={m.layerId} className="px-4 py-3" style={{ borderBottom: i < meta.length - 1 ? '1px solid #1e1e2e' : 'none' }}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#e8e8f0' }}>{m.label}</p>
              <ConfidenceBadge confidence={m.confidence} />
            </div>
            <span
              className="w-5 h-5 rounded flex-shrink-0"
              title={m.colorHex}
              style={{ background: m.colorHex, boxShadow: '0 0 0 1px rgba(255,255,255,0.2),0 0 0 2px rgba(0,0,0,0.5)' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs whitespace-nowrap" style={{ color: '#6b6b80' }}>Font:</span>
            <select
              value={fontOverrides[m.layerId] ?? m.detectedFont}
              onChange={(e) => onOverride(m.layerId, e.target.value)}
              title={`Font for ${m.label}`}
              className="flex-1 rounded px-2 py-1 text-xs outline-none"
              style={{ background: '#0a0a0f', border: '1px solid #2a2a3a', color: '#e8e8f0' }}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  )
}

function JsonPanel({ template }: { template: Template }) {
  const { html, runCount } = useMemo(() => {
    const layers = template.layers.map((l) => {
      if (l.type !== 'text') return l
      return { ...(l as TextLayer), runs: mergeRuns((l as TextLayer).runs) }
    })
    const title = layers.find((l) => l.id === 'title') as TextLayer | undefined
    if (!title) return { html: '', runCount: 0 }
    return { html: buildJsonHtml(title.runs), runCount: title.runs.length }
  }, [template])

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#16161f', border: '1px solid #2a2a3a' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #2a2a3a' }}>
        <p className="text-xs font-semibold" style={{ color: '#e8e8f0' }}>Template JSON</p>
        <span className="text-xs rounded px-2 py-0.5" style={{ background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e40' }}>
          {runCount} runs merged
        </span>
      </div>
      <div className="p-4">
        <pre
          className="text-xs leading-relaxed font-mono"
          style={{ color: '#6b6b80', maxHeight: 320, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="mt-3 rounded-lg px-3 py-2 flex items-start gap-2" style={{ background: '#1ABCB215', border: '1px solid #1ABCB235' }}>
          <span style={{ color: '#1ABCB2', flexShrink: 0 }}>&#10003;</span>
          <p className="text-xs leading-relaxed" style={{ color: '#1ABCB2' }}>
            <strong>&quot;AI NEWS YOU MIGHT&apos;VE&quot;</strong> captured as a distinct teal run (#1ABCB2) — adjacent same-style runs are automatically merged.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PipelineDemo() {
  const [state, setState] = useState<'idle' | 'importing' | 'done'>('idle')
  const [template, setTemplate] = useState<Template | null>(null)
  const [fontOverrides, setFontOverrides] = useState<Record<string, string>>({})

  const handleImport = () => {
    setState('importing')
    setTimeout(() => {
      setTemplate(buildSampleTemplate())
      setState('done')
    }, 900)
  }

  const handleOverride = (layerId: string, font: string) => {
    setFontOverrides((prev) => ({ ...prev, [layerId]: font }))
    if (!template) return
    setTemplate({
      ...template,
      layers: template.layers.map((l) =>
        l.id === layerId
          ? { ...l, defaultStyle: { ...(l as TextLayer).defaultStyle, fontFamily: `${font}, sans-serif` } }
          : l
      ),
    })
  }

  const previewSvg = useMemo(() => {
    if (!template) return null
    return layoutEngine(template, template.width, template.height, 'pipeline-preview')
  }, [template])

  return (
    <section className="mt-16">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-semibold rounded px-2 py-0.5"
            style={{ background: '#1ABCB215', color: '#1ABCB2', border: '1px solid #1ABCB235' }}
          >
            PROOF 4 + 5 + 6
          </span>
          <h3 className="text-sm font-semibold" style={{ color: '#e8e8f0' }}>
            Pipeline import &middot; Font confidence &middot; Merged runs
          </h3>
        </div>
        <p className="text-xs" style={{ color: '#6b6b80' }}>
          Import a detection image &#8594; extract template with teal accent preserved &#8594; inspect per-layer confidence &#8594; view merged JSON.
        </p>
      </div>

      {state !== 'done' ? (
        <div className="rounded-xl overflow-hidden" style={{ background: '#16161f', border: '1px solid #2a2a3a' }}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Detection image */}
            <div className="relative" style={{ borderRight: '1px solid #2a2a3a' }}>
              <div className="relative w-full" style={{ paddingBottom: `${(1280 / 1016) * 100}%` }}>
                <div
                  className="absolute inset-0 [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: DETECTION_SVG }}
                />
                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{ height: '30%', background: 'linear-gradient(to top, rgba(10,10,15,0.95), transparent)' }}
                />
                <div className="absolute bottom-3 left-4">
                  <p className="text-xs font-medium" style={{ color: '#e8e8f0' }}>layout-detection.svg</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b6b80' }}>1016 x 1280 &middot; 4 elements detected</p>
                </div>
              </div>
            </div>

            {/* Import action */}
            <div className="flex flex-col justify-center p-8 gap-5">
              <div>
                <p className="text-sm font-semibold mb-1.5" style={{ color: '#e8e8f0' }}>
                  Extract template from pipeline output
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#6b6b80' }}>
                  elements.json + semantics.json &#8594; typed Template. Teal accent on &quot;AI NEWS YOU MIGHT&#39;VE&quot; preserved exactly.
                </p>
              </div>

              <div className="rounded-lg p-3" style={{ background: '#0a0a0f', border: '1px solid #1e1e2e' }}>
                <p className="text-xs font-medium mb-2" style={{ color: '#6b6b80' }}>Detected layers</p>
                {SAMPLE_LAYER_META.map((m) => (
                  <div key={m.layerId} className="flex items-center justify-between py-1">
                    <span className="text-xs truncate" style={{ color: '#e8e8f0' }}>{m.label}</span>
                    <span
                      className="text-xs ml-2 flex-shrink-0 font-medium"
                      style={{ color: m.confidence >= 0.8 ? '#22c55e' : m.confidence >= 0.5 ? '#f59e0b' : '#ef4444' }}
                    >
                      {(m.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleImport}
                disabled={state === 'importing'}
                className="w-full rounded-xl py-3 text-sm font-semibold transition-all"
                style={{
                  background: state === 'importing' ? '#1ABCB240' : '#1ABCB2',
                  color: state === 'importing' ? '#1ABCB2' : '#000',
                  border: 'none',
                  cursor: state === 'importing' ? 'default' : 'pointer',
                }}
              >
                {state === 'importing' ? 'Extracting template…' : 'Import Sample Image →'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Top: source vs extracted */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl overflow-hidden" style={{ background: '#16161f', border: '1px solid #2a2a3a' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #2a2a3a' }}>
                <p className="text-xs font-semibold" style={{ color: '#6b6b80' }}>Source image</p>
              </div>
              <div
                className="[&>svg]:w-full [&>svg]:h-full overflow-hidden"
                style={{ height: 320 }}
                dangerouslySetInnerHTML={{ __html: DETECTION_SVG }}
              />
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: '#16161f', border: '1px solid #2a2a3a' }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #2a2a3a' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#22c55e' }} />
                  <p className="text-xs font-semibold" style={{ color: '#e8e8f0' }}>Extracted template</p>
                </div>
                <span className="text-xs rounded px-2 py-0.5" style={{ background: '#1ABCB215', color: '#1ABCB2', border: '1px solid #1ABCB235' }}>
                  #1ABCB2 preserved
                </span>
              </div>
              <div style={{ height: 320, overflow: 'hidden', background: '#0d0d14' }}>
                {previewSvg && (
                  <div
                    className="w-full [&>svg]:w-full [&>svg]:h-full"
                    style={{ height: 320 }}
                    dangerouslySetInnerHTML={{ __html: previewSvg }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bottom: layer sidebar + JSON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LayerSidebar meta={SAMPLE_LAYER_META} fontOverrides={fontOverrides} onOverride={handleOverride} />
            {template && <JsonPanel template={template} />}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { setState('idle'); setTemplate(null); setFontOverrides({}) }}
              className="text-xs rounded-lg px-4 py-2"
              style={{ background: '#0a0a0f', border: '1px solid #2a2a3a', color: '#6b6b80', cursor: 'pointer' }}
            >
              &#8592; Reset demo
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
