'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Template, FormatId } from '@/lib/types'
import { FORMATS } from '@/lib/brands'
import { layoutEngine } from '@/lib/layoutEngine'

interface Props {
  template: Template
  formatId: FormatId
}

function encodeTemplate(template: Template): string {
  return Buffer.from(JSON.stringify(template)).toString('base64url')
}

export default function ServerPreview({ template, formatId }: Props) {
  const [pngSrc, setPngSrc] = useState<string | null>(null)
  const [renderMs, setRenderMs] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [pngReady, setPngReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const prevSrcRef = useRef<string | null>(null)

  // Instant SVG placeholder — shows something while PNG loads
  const svgDataUri = useMemo(() => {
    const fmt = FORMATS.find((f) => f.id === formatId)
    const svg = layoutEngine(template, fmt?.width, fmt?.height, 'preview')
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }, [template, formatId])

  useEffect(() => {
    setPngReady(false)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const encoded = encodeTemplate(template)
      const url = `/api/render?template=${encoded}&format=${formatId}`
      setLoading(true)
      const t0 = performance.now()
      try {
        const res = await fetch(url)
        const blob = await res.blob()
        const elapsed = Math.round(performance.now() - t0)
        const objUrl = URL.createObjectURL(blob)
        if (prevSrcRef.current) URL.revokeObjectURL(prevSrcRef.current)
        prevSrcRef.current = objUrl
        setPngSrc(objUrl)
        setRenderMs(elapsed)
        setPngReady(true)
      } catch {
        // silently fall back to SVG preview
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(debounceRef.current)
  }, [template, formatId])

  const handleCopy = () => {
    const encoded = encodeTemplate(template)
    const url = `${window.location.origin}/api/render?template=${encoded}&format=${formatId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden"
      style={{ background: '#16161f', border: '1px solid #2a2a3a' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid #2a2a3a' }}
      >
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full ${loading ? '' : 'pulse-dot'}`}
            style={{
              width: 8,
              height: 8,
              background: pngReady ? '#22c55e' : loading ? '#f59e0b' : '#22c55e',
              display: 'block',
              transition: 'background 0.3s ease',
            }}
          />
          <span className="text-xs font-medium" style={{ color: '#e8e8f0' }}>
            {loading ? 'Rendering…' : 'Server render · resvg'}
          </span>
        </div>
        {renderMs !== null && (
          <span className="text-xs" style={{ color: '#6b6b80' }}>
            {renderMs}ms
          </span>
        )}
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center p-4" style={{ minHeight: 200 }}>
        {compareMode && pngReady && pngSrc ? (
          /* Side-by-side compare mode */
          <div className="w-full">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <span
                  className="text-center text-xs font-medium rounded py-0.5"
                  style={{ background: '#4f6ef720', color: '#4f6ef7', border: '1px solid #4f6ef740' }}
                >
                  Browser SVG
                </span>
                <img
                  src={svgDataUri}
                  alt="Browser SVG"
                  className="w-full rounded-lg object-contain"
                  style={{ maxHeight: 200, boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span
                  className="text-center text-xs font-medium rounded py-0.5"
                  style={{ background: '#22c55e20', color: '#22c55e', border: '1px solid #22c55e40' }}
                >
                  Server PNG · resvg
                </span>
                <img
                  src={pngSrc}
                  alt="Server PNG"
                  className="w-full rounded-lg object-contain"
                  style={{ maxHeight: 200, boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
                />
              </div>
            </div>
            <p className="text-center text-xs mt-2" style={{ color: '#6b6b80' }}>
              Same layout engine → identical positioning, font sizes, and color runs
            </p>
          </div>
        ) : (
          /* Normal mode: SVG placeholder → PNG */
          <div className="relative w-full flex items-center justify-center">
            <img
              src={svgDataUri}
              alt="SVG preview"
              className="max-w-full max-h-72 rounded-lg object-contain"
              style={{
                opacity: pngReady ? 0 : 1,
                transition: 'opacity 0.25s ease',
                position: pngReady ? 'absolute' : 'relative',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
              }}
            />
            {pngSrc && (
              <img
                src={pngSrc}
                alt="Server render PNG"
                className="max-w-full max-h-72 rounded-lg object-contain"
                style={{
                  opacity: pngReady ? 1 : 0,
                  transition: 'opacity 0.25s ease',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                }}
              />
            )}
            {loading && (
              <div
                className="absolute inset-0 rounded-lg flex items-end justify-center pb-2"
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  server rendering…
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        {/* Proof 3: Diff check button */}
        <button
          type="button"
          onClick={() => setCompareMode((v) => !v)}
          disabled={!pngReady}
          className="w-full rounded-lg py-2 text-xs font-medium transition-all"
          style={{
            background: compareMode ? '#4f6ef720' : '#0a0a0f',
            border: `1px solid ${compareMode ? '#4f6ef7' : '#2a2a3a'}`,
            color: compareMode ? '#4f6ef7' : pngReady ? '#e8e8f0' : '#3d3d50',
            cursor: pngReady ? 'pointer' : 'default',
          }}
        >
          {compareMode ? '✕ Close compare' : '⇔ Diff check — SVG vs PNG'}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="w-full rounded-lg py-2 text-xs font-medium transition-all"
          style={{
            background: copied ? '#22c55e22' : '#0a0a0f',
            border: `1px solid ${copied ? '#22c55e' : '#2a2a3a'}`,
            color: copied ? '#22c55e' : '#6b6b80',
          }}
        >
          {copied ? '✓ Copied!' : 'Copy render URL'}
        </button>
      </div>
    </div>
  )
}
