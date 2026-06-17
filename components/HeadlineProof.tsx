'use client'

import { useMemo, useState } from 'react'
import { layoutEngine, computeFontSize, makeDefaultTemplate } from '@/lib/layoutEngine'
import { BRANDS, FORMATS } from '@/lib/brands'
import type { TextLayer } from '@/lib/types'

const DEMO_FORMATS = ['ig-square', 'linkedin', 'ig-story']
const BRAND = BRANDS[0]
const TEXT_COLOR = BRAND.textColor
const ACCENT_COLOR = BRAND.accentColor

export default function HeadlineProof() {
  const [part1, setPart1] = useState('Your skin,')
  const [part2, setPart2] = useState(' decoded')

  const base = useMemo(
    () => makeDefaultTemplate(TEXT_COLOR, ACCENT_COLOR, BRAND.background),
    []
  )

  const template = useMemo(
    () => ({
      ...base,
      layers: base.layers.map((l) =>
        l.id === 'headline'
          ? {
              ...l,
              runs: [
                { text: part1, style: { fill: TEXT_COLOR } },
                { text: part2, style: { fill: ACCENT_COLOR } },
              ],
            }
          : l
      ),
    }),
    [part1, part2, base]
  )

  const fmtData = useMemo(
    () =>
      FORMATS.filter((f) => DEMO_FORMATS.includes(f.id)).map((fmt) => {
        const svg = layoutEngine(template, fmt.width, fmt.height, `proof-${fmt.id}`)
        const headlineLayer = template.layers.find((l) => l.id === 'headline') as TextLayer
        const fs = computeFontSize(headlineLayer, fmt.width, fmt.height)
        return { ...fmt, svg, fs: Math.round(fs) }
      }),
    [template]
  )

  return (
    <section
      className="rounded-xl p-6 mb-8"
      style={{ background: '#16161f', border: '1px solid #2a2a3a' }}
    >
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-semibold rounded px-2 py-0.5"
            style={{ background: '#4f6ef720', color: '#4f6ef7', border: '1px solid #4f6ef740' }}
          >
            PROOF 1 + 2
          </span>
          <h3 className="text-sm font-semibold" style={{ color: '#e8e8f0' }}>
            One-unit reflow · Auto-fit font sizing
          </h3>
        </div>
        <p className="text-xs" style={{ color: '#6b6b80' }}>
          Two differently-colored runs always flow as one paragraph. Font auto-fits the bounding box via binary search — type more text and watch it shrink.
        </p>
      </div>

      {/* Inputs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex flex-col gap-1 flex-1 min-w-32">
          <label className="text-xs font-medium" style={{ color: '#6b6b80' }}>
            Run 1 — base color
          </label>
          <input
            value={part1}
            onChange={(e) => setPart1(e.target.value)}
            title="Run 1 text"
            placeholder="Run 1 text…"
            className="rounded-lg px-3 py-2 text-sm outline-none w-full"
            style={{
              background: '#0a0a0f',
              border: '1px solid #2a2a3a',
              color: TEXT_COLOR,
              fontFamily: 'DM Sans, sans-serif',
            }}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-32">
          <label className="text-xs font-medium" style={{ color: ACCENT_COLOR }}>
            Run 2 — accent color
          </label>
          <input
            value={part2}
            onChange={(e) => setPart2(e.target.value)}
            title="Run 2 accent text"
            placeholder="Run 2 accent…"
            className="rounded-lg px-3 py-2 text-sm outline-none w-full"
            style={{
              background: '#0a0a0f',
              border: `1px solid ${ACCENT_COLOR}60`,
              color: ACCENT_COLOR,
              fontFamily: 'DM Sans, sans-serif',
            }}
          />
        </div>
      </div>

      {/* Format previews */}
      <div className="grid grid-cols-3 gap-4">
        {fmtData.map((fmt) => {
            return (
            <div key={fmt.id} className="flex flex-col gap-2">
              <div
                className="relative overflow-hidden rounded-lg w-full"
                style={{
                  height: 180,
                  background: '#0d0d14',
                  border: '1px solid #2a2a3a',
                }}
              >
                <div
                  className="absolute inset-0 [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: fmt.svg }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#6b6b80' }}>
                  {fmt.label}
                </span>
                <span
                  className="text-xs font-mono rounded px-1.5 py-0.5"
                  style={{ background: '#4f6ef720', color: '#4f6ef7' }}
                >
                  {fmt.fs}px
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-xs" style={{ color: '#3d3d50' }}>
        The gold accent in Run 2 always follows its text regardless of line breaks — both runs are one continuous paragraph in the SVG output.
      </p>
    </section>
  )
}
