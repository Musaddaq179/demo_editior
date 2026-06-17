'use client'

import { useState, useMemo, useEffect } from 'react'
import { layoutEngine } from '@/lib/layoutEngine'
import { FORMATS } from '@/lib/brands'
import { DEFAULT_LAYERS, layerDefToTemplateLayer, type LayerDef } from '@/lib/editor'
import type { DesignPreset } from '@/lib/designPresets'
import type { Template, FormatId } from '@/lib/types'
import DraggableCanvas from '@/components/DraggableCanvas'
import DesignLibrary from '@/components/DesignLibrary'
import ImageGallery from '@/components/ImageGallery'
import AIAssistant from '@/components/AIAssistant'
import OnboardingTour from '@/components/OnboardingTour'

const FONT_OPTIONS = [
  'DM Sans', 'Inter', 'Montserrat', 'Roboto', 'Poppins',
  'Playfair Display', 'Georgia', 'Lato', 'Open Sans',
]

function encodeTemplate(t: Template): string {
  const json = JSON.stringify(t)
  const bytes = new TextEncoder().encode(json)
  const binStr = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
  return btoa(binStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ── Reusable UI atoms ──────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: 6,
  padding: '5px 8px', color: '#e8e8f0', fontSize: 13, outline: 'none', width: '100%',
}
const numInputStyle: React.CSSProperties = {
  background: '#0a0a0f', border: '1px solid #2a2a3a', borderRadius: 6,
  padding: '4px 6px', color: '#e8e8f0', fontSize: 12, outline: 'none',
  width: 52, textAlign: 'center',
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <input
        type="color" value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: 24, height: 24, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0 }}
      />
      <input
        value={value}
        onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value) }}
        style={{ ...numInputStyle, width: 74, fontFamily: 'monospace' }}
      />
    </div>
  )
}

function NumInput({ value, onChange, min, max, suffix = '' }: {
  value: number; onChange: (v: number) => void; min: number; max: number; suffix?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <input
        type="number" value={value} min={min} max={max}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
        style={numInputStyle}
      />
      {suffix && <span style={{ color: '#6b6b80', fontSize: 11 }}>{suffix}</span>}
    </div>
  )
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ color: '#6b6b80', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
          {title}
        </p>
        {action}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

// ── Layer card ──────────────────────────────────────────────────────────────

function LayerCard({ ld, index, onChange, onDelete }: {
  ld: LayerDef; index: number;
  onChange: (patch: Partial<LayerDef>) => void; onDelete: () => void
}) {
  const label = index === 0 ? 'Headline' : `Layer ${index + 1}`

  return (
    <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #2a2a3a' }}>
        <span style={{ color: '#e8e8f0', fontSize: 12, fontWeight: 600 }}>{label}</span>
        <button type="button" onClick={onDelete}
          style={{ background: 'none', border: 'none', color: '#6b6b80', fontSize: 16, cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>
          ×
        </button>
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ color: '#6b6b80', fontSize: 11 }}>Text</label>
          <textarea value={ld.mainText} onChange={(e) => onChange({ mainText: e.target.value })}
            rows={2} style={{ ...inputStyle, resize: 'vertical', fontSize: 12 }} />
          {index === 0 && (
            <input value={ld.accentText} onChange={(e) => onChange({ accentText: e.target.value })}
              placeholder="Accent text (optional)…"
              style={{ ...inputStyle, fontSize: 12, borderColor: `${ld.accentColor}60`, color: ld.accentColor }} />
          )}
        </div>

        {/* Position */}
        <div>
          <label style={{ color: '#6b6b80', fontSize: 11, display: 'block', marginBottom: 6 }}>
            Position &amp; Size <span style={{ color: '#3d3d50' }}>(% of canvas — or drag on preview)</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { label: 'X', val: ld.x, key: 'x' as const, min: 0, max: 99 },
              { label: 'Y', val: ld.y, key: 'y' as const, min: 0, max: 99 },
              { label: 'W', val: ld.w, key: 'w' as const, min: 1, max: 100 },
              { label: 'H', val: ld.h, key: 'h' as const, min: 1, max: 100 },
            ].map(({ label, val, key, min, max }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#6b6b80', fontSize: 11, width: 14 }}>{label}</span>
                <NumInput value={val} onChange={(v) => onChange({ [key]: v })} min={min} max={max} suffix="%" />
              </div>
            ))}
          </div>
        </div>

        {/* Font */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6, alignItems: 'end' }}>
          <div>
            <label style={{ color: '#6b6b80', fontSize: 11, display: 'block', marginBottom: 4 }}>Font</label>
            <select value={ld.fontFamily} onChange={(e) => onChange({ fontFamily: e.target.value })}
              style={{ ...inputStyle, fontSize: 12 }}>
              {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#6b6b80', fontSize: 11, display: 'block', marginBottom: 4 }}>Size</label>
            <NumInput value={ld.fontSize} onChange={(v) => onChange({ fontSize: v })} min={8} max={400} suffix="px" />
          </div>
        </div>

        {/* Colors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#6b6b80', fontSize: 11, width: 44 }}>Color</span>
            <ColorPicker value={ld.color} onChange={(v) => onChange({ color: v })} />
          </div>
          {(index === 0 || ld.accentText) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#6b6b80', fontSize: 11, width: 44 }}>Accent</span>
              <ColorPicker value={ld.accentColor} onChange={(v) => onChange({ accentColor: v })} />
            </div>
          )}
        </div>

        {/* Align */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#6b6b80', fontSize: 11 }}>Align</span>
          {(['left', 'center', 'right'] as const).map((a) => (
            <button key={a} type="button" onClick={() => onChange({ textAlign: a })}
              style={{
                padding: '3px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                border: `1px solid ${ld.textAlign === a ? '#4f6ef7' : '#2a2a3a'}`,
                background: ld.textAlign === a ? '#4f6ef720' : '#0a0a0f',
                color: ld.textAlign === a ? '#4f6ef7' : '#6b6b80',
              }}>
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [layers, setLayers] = useState<LayerDef[]>(DEFAULT_LAYERS)
  const [bgColor1, setBgColor1] = useState('#0a0a1a')
  const [bgColor2, setBgColor2] = useState('#1a1a3a')
  const [bgAngle, setBgAngle] = useState(135)
  const [bgImageUrl, setBgImageUrl] = useState('')
  const [formatId, setFormatId] = useState<FormatId>('ig-square')
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [showDesignLibrary, setShowDesignLibrary] = useState(false)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [showTour, setShowTour] = useState(false)

  // Show tour on first visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('tour-seen')
      if (!seen) setShowTour(true)
    }
  }, [])

  const completeTour = () => {
    setShowTour(false)
    localStorage.setItem('tour-seen', '1')
  }

  const updateLayer = (id: string, patch: Partial<LayerDef>) =>
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))

  const deleteLayer = (id: string) =>
    setLayers((prev) => prev.filter((l) => l.id !== id))

  const addLayer = () =>
    setLayers((prev) => [
      ...prev,
      {
        id: `layer-${Date.now()}`,
        mainText: 'New paragraph',
        accentText: '',
        color: '#ffffff',
        accentColor: '#f5c518',
        x: 8, y: 50, w: 84, h: 12,
        fontSize: 48,
        fontFamily: 'DM Sans',
        textAlign: 'left',
      },
    ])

  const applyPreset = (preset: DesignPreset) => {
    setBgColor1(preset.bg.color1)
    setBgColor2(preset.bg.color2)
    setBgAngle(preset.bg.angle)
    setBgImageUrl('')
    setLayers(preset.layers)
  }

  const template: Template = useMemo(
    () => ({
      width: 1080,
      height: 1080,
      background: {
        type: 'gradient',
        angle: bgAngle,
        stops: [{ offset: '0%', color: bgColor1 }, { offset: '100%', color: bgColor2 }],
        ...(bgImageUrl ? { imageUrl: bgImageUrl } : {}),
      },
      layers: layers.map(layerDefToTemplateLayer),
    }),
    [layers, bgColor1, bgColor2, bgAngle, bgImageUrl]
  )

  const selectedFormat = FORMATS.find((f) => f.id === formatId) ?? FORMATS[0]

  const svgHtml = useMemo(
    () => layoutEngine(template, selectedFormat.width, selectedFormat.height, 'preview'),
    [template, selectedFormat]
  )

  const handleDownload = async () => {
    setDownloading(true)
    setDownloaded(false)
    try {
      const W = selectedFormat.width
      const H = selectedFormat.height

      // 1. Fetch Inter font from public/fonts and convert to base64
      const fontRes = await fetch('/fonts/Inter.ttf')
      const fontBuf = await fontRes.arrayBuffer()
      const fontBytes = new Uint8Array(fontBuf)
      let binary = ''
      for (let i = 0; i < fontBytes.length; i += 8192) {
        binary += String.fromCharCode.apply(null, Array.from(fontBytes.subarray(i, i + 8192)))
      }
      const fontB64 = btoa(binary)

      // 2. Build @font-face rules for every font name used in layers
      //    so whatever font the user picked, Inter renders it
      const usedFonts = Array.from(new Set(layers.map((l) => l.fontFamily))).concat(['Inter', 'DM Sans', 'sans-serif'])
      const fontFaces = usedFonts
        .map((name) => `@font-face{font-family:'${name}';src:url('data:font/truetype;base64,${fontB64}')format('truetype');font-weight:100 900;}`)
        .join('')

      // 3. Inline background image if present (prevents canvas tainting)
      let tmpl = { ...template, background: { ...template.background } }
      if (tmpl.background.imageUrl) {
        try {
          const imgRes = await fetch(tmpl.background.imageUrl)
          if (imgRes.ok) {
            const imgBuf = await imgRes.arrayBuffer()
            const imgBytes2 = new Uint8Array(imgBuf)
            let imgBin = ''
            for (let i = 0; i < imgBytes2.length; i += 8192) {
              imgBin += String.fromCharCode.apply(null, Array.from(imgBytes2.subarray(i, i + 8192)))
            }
            const mime = imgRes.headers.get('content-type') ?? 'image/jpeg'
            tmpl = { ...tmpl, background: { ...tmpl.background, imageUrl: `data:${mime};base64,${btoa(imgBin)}` } }
          }
        } catch {
          tmpl = { ...tmpl, background: { ...tmpl.background, imageUrl: undefined } }
        }
      }

      // 4. Generate SVG and inject embedded font styles
      let svg = layoutEngine(tmpl, W, H, 'download')
      svg = svg.replace('<defs>', `<defs>\n<style>${fontFaces}</style>`)

      // 5. SVG Blob → Image → Canvas → PNG download
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = W
          canvas.height = H
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, W, H)
          URL.revokeObjectURL(svgUrl)
          canvas.toBlob((pngBlob) => {
            if (!pngBlob) { reject(new Error('PNG export failed')); return }
            const pngUrl = URL.createObjectURL(pngBlob)
            const a = document.createElement('a')
            a.href = pngUrl
            a.download = `post-${formatId}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            setTimeout(() => URL.revokeObjectURL(pngUrl), 1000)
            resolve()
          }, 'image/png')
        }
        img.onerror = () => reject(new Error('SVG load failed'))
        img.src = svgUrl
      })

      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 2000)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  const aspectRatio = selectedFormat.height / selectedFormat.width

  return (
    <main style={{ background: '#0a0a0f', minHeight: '100vh', fontFamily: 'var(--font-inter)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px',
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #16161f',
      }}>
        <span style={{ color: '#e8e8f0', fontSize: 14, fontWeight: 600 }}>Post Module</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => setShowTour(true)}
            style={{ background: 'none', border: 'none', color: '#6b6b80', fontSize: 12, cursor: 'pointer' }}>
            ? Tour
          </button>
          <span className="editor-header-hint" style={{ color: '#3d3d50', fontSize: 12 }}>Social post creator</span>
        </div>
      </header>

      <div className="editor-grid">
        {/* ── Left: Controls ── */}
        <div className="editor-controls" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Format */}
          <Section title="Format">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {FORMATS.map((fmt) => (
                <button key={fmt.id} type="button" onClick={() => setFormatId(fmt.id)}
                  style={{
                    padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    border: `1px solid ${formatId === fmt.id ? '#4f6ef7' : '#2a2a3a'}`,
                    background: formatId === fmt.id ? '#4f6ef7' : '#0a0a0f',
                    color: formatId === fmt.id ? '#fff' : '#6b6b80',
                  }}>
                  {fmt.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Design Library button */}
          <button type="button" onClick={() => setShowDesignLibrary(true)}
            style={{
              background: 'linear-gradient(135deg, #1a1a3a, #2a1a4a)',
              border: '1px solid #4f6ef760',
              borderRadius: 12, padding: '12px 16px',
              color: '#e8e8f0', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', textAlign: 'left',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
            <span>✨ Design Library</span>
            <span style={{ color: '#4f6ef7', fontSize: 12 }}>8 designs →</span>
          </button>

          {/* Background */}
          <Section
            title="Background"
            action={
              <button type="button" onClick={() => setShowImageGallery(true)}
                style={{
                  background: '#0a0a0f', border: '1px solid #2a2a3a',
                  borderRadius: 6, padding: '3px 8px',
                  color: '#ffffff', fontSize: 10, cursor: 'pointer',
                }}>
                Browse Photos
              </button>
            }
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#6b6b80', fontSize: 11, width: 60 }}>From</span>
              <ColorPicker value={bgColor1} onChange={setBgColor1} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#6b6b80', fontSize: 11, width: 60 }}>To</span>
              <ColorPicker value={bgColor2} onChange={setBgColor2} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6b6b80', fontSize: 11 }}>Angle</span>
                <span style={{ color: '#4f6ef7', fontSize: 11, fontFamily: 'monospace' }}>{bgAngle}°</span>
              </div>
              <input type="range" min={0} max={360} value={bgAngle}
                title="Gradient angle"
                onChange={(e) => setBgAngle(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#4f6ef7' }} />
            </div>
            {bgImageUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={bgImageUrl} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} />
                <span style={{ color: '#6b6b80', fontSize: 11, flex: 1 }}>Photo selected</span>
                <button type="button" onClick={() => setBgImageUrl('')}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <label style={{ color: '#6b6b80', fontSize: 11, display: 'block', marginBottom: 4 }}>Image URL (optional)</label>
                <input value={bgImageUrl} onChange={(e) => setBgImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={{ ...inputStyle, fontSize: 12 }} />
              </div>
            )}
          </Section>

          {/* Text layers */}
          {layers.map((ld, i) => (
            <LayerCard key={ld.id} ld={ld} index={i}
              onChange={(patch) => updateLayer(ld.id, patch)}
              onDelete={() => deleteLayer(ld.id)} />
          ))}

          {/* Add layer */}
          <button type="button" onClick={addLayer}
            style={{
              background: '#16161f', border: '1px dashed #2a2a3a',
              borderRadius: 12, padding: '12px 0',
              color: '#6b6b80', fontSize: 13, cursor: 'pointer',
            }}>
            + Add Text Layer
          </button>

          {/* Download */}
          <button type="button" onClick={handleDownload} disabled={downloading}
            style={{
              background: downloaded ? '#22c55e' : downloading ? '#4f6ef740' : '#4f6ef7',
              border: 'none', borderRadius: 10, padding: '13px 0',
              color: downloading ? '#4f6ef7' : '#fff',
              fontSize: 14, fontWeight: 600, cursor: downloading ? 'default' : 'pointer',
            }}>
            {downloaded ? '✓ Downloaded!' : downloading ? 'Rendering…' : 'Download PNG'}
          </button>
        </div>

        {/* ── Right: Preview ── */}
        <div className="editor-preview">
          <div style={{ background: '#16161f', border: '1px solid #2a2a3a', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid #2a2a3a',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ color: '#e8e8f0', fontSize: 12, fontWeight: 600 }}>Preview</span>
              <span style={{ color: '#6b6b80', fontSize: 11 }}>
                {selectedFormat.label} · {selectedFormat.dimensions} · hover text to drag
              </span>
            </div>
            <div style={{ padding: 16 }}>
              <DraggableCanvas
                svgHtml={svgHtml}
                layers={layers}
                aspectRatio={aspectRatio}
                onLayerMove={(id, x, y) => updateLayer(id, { x, y })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDesignLibrary && (
        <DesignLibrary onSelect={applyPreset} onClose={() => setShowDesignLibrary(false)} />
      )}
      {showImageGallery && (
        <ImageGallery onSelect={(url) => setBgImageUrl(url)} onClose={() => setShowImageGallery(false)} />
      )}

      {/* AI Assistant — floating */}
      <AIAssistant />

      {/* Onboarding Tour */}
      {showTour && <OnboardingTour onComplete={completeTour} />}
    </main>
  )
}
