'use client'

import { useState } from 'react'
import { CURATED_IMAGES, IMAGE_CATEGORIES, type CuratedImage } from '@/lib/curatedImages'

interface Props {
  onSelect: (imageUrl: string) => void
  onClose: () => void
}

export default function ImageGallery({ onSelect, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState<CuratedImage['category'] | 'All'>('All')

  const filtered = activeCategory === 'All'
    ? CURATED_IMAGES
    : CURATED_IMAGES.filter((img) => img.category === activeCategory)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.75)',
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
          maxWidth: 900,
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
            <p style={{ color: '#e8e8f0', fontSize: 14, fontWeight: 600, margin: 0 }}>Photo Library</p>
            <p style={{ color: '#6b6b80', fontSize: 12, margin: 0 }}>Free curated photos — click to use as background</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#6b6b80', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Category tabs */}
        <div style={{ padding: '10px 20px', borderBottom: '1px solid #1e1e2e', display: 'flex', gap: 6 }}>
          {(['All', ...IMAGE_CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat as CuratedImage['category'] | 'All')}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
                border: `1px solid ${activeCategory === cat ? '#4f6ef7' : '#2a2a3a'}`,
                background: activeCategory === cat ? '#4f6ef7' : '#0a0a0f',
                color: activeCategory === cat ? '#fff' : '#6b6b80',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div
          className="gallery-grid"
          style={{
            padding: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10,
            overflowY: 'auto',
          }}
        >
          {filtered.map((img) => (
            <div
              key={img.id}
              onClick={() => { onSelect(img.full); onClose() }}
              style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', position: 'relative' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.outline = '2px solid #4f6ef7' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.outline = 'none' }}
            >
              <img
                src={img.thumb}
                alt={img.name}
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  padding: '12px 6px 4px',
                }}
              >
                <p style={{ color: '#fff', fontSize: 9, margin: 0, textAlign: 'center' }}>{img.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
