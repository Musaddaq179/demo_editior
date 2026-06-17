'use client'

import { useState } from 'react'
import type { Template } from '@/lib/types'
import { BRANDS } from '@/lib/brands'

interface Props {
  template: Template
  onBrandChange: (template: Template) => void
  currentBrandId: string
}

export default function BrandSwitcher({ template, onBrandChange, currentBrandId }: Props) {
  const [toast, setToast] = useState(false)

  const handleBrand = (brandId: string) => {
    const brand = BRANDS.find((b) => b.id === brandId)
    if (!brand) return

    const newLayers = template.layers.map((layer) => {
      if (layer.type !== 'text') return layer
      const isAccentRole = layer.role === 'cta'
      const newFill = isAccentRole ? brand.accentColor : brand.textColor
      return {
        ...layer,
        defaultStyle: { ...layer.defaultStyle, fill: newFill },
        runs: layer.runs.map((run, i) => {
          // For headline: first run = text color, rest = accent
          if (layer.role === 'headline') {
            return {
              ...run,
              style: { ...run.style, fill: i === 0 ? brand.textColor : brand.accentColor },
            }
          }
          return { ...run, style: { ...run.style, fill: newFill } }
        }),
      }
    })

    onBrandChange({
      ...template,
      background: brand.background,
      layers: newLayers,
    })

    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  return (
    <section className="mt-20">
      <div className="mb-6 text-center">
        <h2
          className="text-xl font-semibold tracking-tight"
          style={{ color: '#e8e8f0' }}
        >
          Brand presets
        </h2>
        <p className="mt-1 text-sm" style={{ color: '#6b6b80' }}>
          Switch themes — all formats update instantly.
        </p>
      </div>

      <div className="flex justify-center gap-3 flex-wrap">
        {BRANDS.map((brand) => {
          const isActive = brand.id === currentBrandId
          const firstStop = brand.background.stops[0].color
          const lastStop = brand.background.stops[brand.background.stops.length - 1].color

          return (
            <button
              key={brand.id}
              onClick={() => handleBrand(brand.id)}
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"
              style={{
                background: isActive ? '#1e1e3a' : '#16161f',
                border: `1px solid ${isActive ? '#4f6ef7' : '#2a2a3a'}`,
                color: isActive ? '#e8e8f0' : '#6b6b80',
                boxShadow: isActive ? '0 0 0 1px #4f6ef7' : 'none',
              }}
            >
              {/* Gradient swatch */}
              <span
                className="rounded-full shrink-0"
                style={{
                  width: 20,
                  height: 20,
                  background: `linear-gradient(135deg, ${firstStop}, ${lastStop})`,
                  border: '1.5px solid rgba(255,255,255,0.15)',
                }}
              />
              <span>{brand.name}</span>
              {/* Accent dot */}
              <span
                className="rounded-full shrink-0"
                style={{ width: 8, height: 8, background: brand.accentColor }}
              />
            </button>
          )
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium fade-in-up"
          style={{
            background: '#1e1e2e',
            border: '1px solid #2a2a3a',
            color: '#e8e8f0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            zIndex: 100,
          }}
        >
          Brand updated
        </div>
      )}
    </section>
  )
}
