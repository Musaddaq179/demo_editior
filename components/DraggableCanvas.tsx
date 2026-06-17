'use client'

import { useEffect, useRef, useState } from 'react'
import type { LayerDef } from '@/lib/editor'

interface Props {
  svgHtml: string
  layers: LayerDef[]
  aspectRatio: number   // height / width  e.g. 1 for square
  onLayerMove: (id: string, x: number, y: number) => void
}

export default function DraggableCanvas({ svgHtml, layers, aspectRatio, onLayerMove }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number } | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const dx = ((e.clientX - dragging.current.sx) / rect.width) * 100
      const dy = ((e.clientY - dragging.current.sy) / rect.height) * 100
      const newX = Math.max(0, Math.min(95, dragging.current.ox + dx))
      const newY = Math.max(0, Math.min(95, dragging.current.oy + dy))
      onLayerMove(dragging.current.id, newX, newY)
    }

    const onUp = () => {
      if (dragging.current) setActiveId(null)
      dragging.current = null
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [onLayerMove])

  const onMouseDown = (ld: LayerDef, e: React.MouseEvent) => {
    e.preventDefault()
    setActiveId(ld.id)
    dragging.current = { id: ld.id, sx: e.clientX, sy: e.clientY, ox: ld.x, oy: ld.y }
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: `${aspectRatio * 100}%`,
        borderRadius: 8,
        overflow: 'hidden',
        background: '#0d0d14',
        userSelect: 'none',
      }}
    >
      {/* SVG render — no pointer events so drag layer stays on top */}
      <div
        className="absolute inset-0 [&>svg]:w-full [&>svg]:h-full"
        style={{ pointerEvents: 'none' }}
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />

      {/* Drag handles */}
      <div className="absolute inset-0">
        {layers.map((ld, i) => {
          const isActive = activeId === ld.id
          const isHover = hoverId === ld.id
          const color = isActive ? '#22c55e' : isHover ? '#4f6ef7' : 'rgba(255,255,255,0.25)'

          return (
            <div
              key={ld.id}
              onMouseDown={(e) => onMouseDown(ld, e)}
              onMouseEnter={() => setHoverId(ld.id)}
              onMouseLeave={() => setHoverId(null)}
              style={{
                position: 'absolute',
                left: `${ld.x}%`,
                top: `${ld.y}%`,
                width: `${ld.w}%`,
                height: `${ld.h}%`,
                border: `1.5px dashed ${color}`,
                cursor: 'move',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
            >
              {/* Layer label chip */}
              {(isHover || isActive) && (
                <span
                  style={{
                    position: 'absolute',
                    top: -22,
                    left: 0,
                    background: isActive ? '#22c55e' : '#4f6ef7',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}
                >
                  {i === 0 ? 'Headline' : `Layer ${i + 1}`} — drag to move
                </span>
              )}

              {/* Corner drag indicator */}
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 4,
                  color,
                  fontSize: 10,
                  opacity: isHover || isActive ? 1 : 0,
                  transition: 'opacity 0.15s',
                  pointerEvents: 'none',
                }}
              >
                ⠿
              </span>
            </div>
          )
        })}
      </div>

      {/* Drag hint (shows when nothing is hovered) */}
      {!hoverId && !activeId && (
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.6)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 10,
            padding: '3px 8px',
            borderRadius: 20,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Hover a text layer to drag it
        </div>
      )}
    </div>
  )
}
