'use client'

import { useMemo } from 'react'
import { DESIGN_PRESETS, type DesignPreset } from '@/lib/designPresets'
import { layoutEngine } from '@/lib/layoutEngine'
import { layerDefToTemplateLayer } from '@/lib/editor'
import type { Template } from '@/lib/types'

interface Props {
  onSelect: (preset: DesignPreset) => void
  onClose: () => void
}

function PresetCard({ preset, onSelect }: { preset: DesignPreset; onSelect: () => void }) {
  const svgHtml = useMemo(() => {
    const template: Template = {
      width: 1080,
      height: 1080,
      background: {
        type: 'gradient',
        angle: preset.bg.angle,
        stops: [
          { offset: '0%', color: preset.bg.color1 },
          { offset: '100%', color: preset.bg.color2 },
        ],
      },
      layers: preset.layers.map(layerDefToTemplateLayer),
    }
    return layoutEngine(template, 400, 400, `preset-${preset.id}`)
  }, [preset])

  return (
    <div
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid #2a2a3a',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = '#4f6ef7'
        ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = '#2a2a3a'
        ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
      }}
    >
      {/* Mini preview */}
      <div
        style={{ position: 'relative', width: '100%', paddingBottom: '100%', background: '#0d0d14' }}
      >
        <div
          className="absolute inset-0 [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      </div>
      {/* Label */}
      <div
        style={{
          padding: '8px 10px',
          background: '#16161f',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontSize: 14 }}>{preset.emoji}</span>
        <span style={{ color: '#e8e8f0', fontSize: 12, fontWeight: 500 }}>{preset.name}</span>
      </div>
    </div>
  )
}

export default function DesignLibrary({ onSelect, onClose }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#0f0f18',
          border: '1px solid #2a2a3a',
          borderRadius: 16,
          width: '100%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #2a2a3a',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <p style={{ color: '#e8e8f0', fontSize: 14, fontWeight: 600, margin: 0 }}>Design Library</p>
            <p style={{ color: '#6b6b80', fontSize: 12, margin: 0 }}>Click any design to apply it instantly</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#6b6b80', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Grid */}
        <div
          style={{
            padding: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            overflowY: 'auto',
          }}
        >
          {DESIGN_PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              onSelect={() => { onSelect(preset); onClose() }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
