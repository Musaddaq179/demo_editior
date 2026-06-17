'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Template, TextLayer, TextStyle } from '@/lib/types'
import { layoutEngine } from '@/lib/layoutEngine'
import { applyStyleToRange, getSelectionInContainer } from '@/lib/textUtils'
import FloatingToolbar from './FloatingToolbar'

interface Props {
  template: Template
  onTemplateChange: (t: Template) => void
  selectedFormat: { width: number; height: number }
}

export default function CanvasEditor({ template, onTemplateChange, selectedFormat }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgWrapRef = useRef<HTMLDivElement>(null)
  const editRef = useRef<HTMLDivElement>(null)

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [hasSelection, setHasSelection] = useState(false)
  const [editOverlay, setEditOverlay] = useState<{
    left: number; top: number; width: number; height: number; fontSize: number; layer: TextLayer
  } | null>(null)

  const W = selectedFormat.width
  const H = selectedFormat.height
  const aspectRatio = W / H

  // Pass skipLayerIds so the editing layer's text is excluded from the SVG,
  // preventing it from showing through the contenteditable overlay.
  const svgString = layoutEngine(
    template, W, H,
    'editor',
    editingLayerId ? [editingLayerId] : []
  )

  // Compute edit overlay position
  const computeOverlay = useCallback((layer: TextLayer) => {
    const wrap = svgWrapRef.current
    if (!wrap) return null
    const rect = wrap.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect() ?? rect

    const displayW = rect.width
    const scaleX = displayW / W
    const displayH = rect.height
    const scaleY = displayH / H

    const left = layer.boundingBox.x * W * scaleX + (rect.left - containerRect.left)
    const top = layer.boundingBox.y * H * scaleY + (rect.top - containerRect.top)
    const width = layer.boundingBox.width * W * scaleX
    const height = layer.boundingBox.height * H * scaleY
    const fontSize = layer.defaultStyle.fontSize * scaleX

    return { left, top, width, height, fontSize, layer }
  }, [W, H])

  const handleLayerClick = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation()
    if (editingLayerId === layerId) return
    setSelectedLayerId(layerId)
    setEditingLayerId(null)
    setEditOverlay(null)
    setHasSelection(false)
  }

  const handleLayerDblClick = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation()
    const layer = template.layers.find((l) => l.id === layerId) as TextLayer | undefined
    if (!layer) return
    setEditingLayerId(layerId)
    setSelectedLayerId(layerId)
    const ov = computeOverlay(layer)
    setEditOverlay(ov)
    setTimeout(() => editRef.current?.focus(), 50)
  }

  const handleCanvasClick = () => {
    setSelectedLayerId(null)
    setEditingLayerId(null)
    setEditOverlay(null)
    setHasSelection(false)
  }

  useEffect(() => {
    const handler = () => {
      if (!editRef.current) return
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed) {
        setHasSelection(false)
        return
      }
      if (editRef.current.contains(sel.anchorNode)) {
        setHasSelection(true)
      }
    }
    document.addEventListener('selectionchange', handler)
    return () => document.removeEventListener('selectionchange', handler)
  }, [])

  const handleApplyStyle = (style: Partial<TextStyle>) => {
    if (!editingLayerId || !editRef.current) return
    const range = getSelectionInContainer(editRef.current)
    if (!range) return

    const layer = template.layers.find((l) => l.id === editingLayerId) as TextLayer | undefined
    if (!layer) return

    const newRuns = applyStyleToRange(layer.runs, range.start, range.end, style)
    const newLayers = template.layers.map((l) =>
      l.id === editingLayerId ? { ...l, runs: newRuns } : l
    )
    onTemplateChange({ ...template, layers: newLayers })

    // Update overlay content
    setTimeout(() => {
      if (editRef.current) {
        const updatedLayer = { ...layer, runs: newRuns }
        setEditOverlay(computeOverlay(updatedLayer) ?? editOverlay)
      }
    }, 0)

    setHasSelection(false)
  }

  const handleToolbarClose = () => setHasSelection(false)

  // Click-out of edit mode
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (editRef.current && !editRef.current.contains(e.target as Node)) {
        setEditingLayerId(null)
        setEditOverlay(null)
        setHasSelection(false)
      }
    }
    if (editingLayerId) {
      document.addEventListener('mousedown', handler)
    }
    return () => document.removeEventListener('mousedown', handler)
  }, [editingLayerId])

  const editingLayer = editingLayerId
    ? (template.layers.find((l) => l.id === editingLayerId) as TextLayer | undefined)
    : null

  return (
    <div ref={containerRef} className="relative w-full">
      {/* SVG Canvas */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          background: '#12121a',
          backgroundImage: 'linear-gradient(#1a1a28 1px, transparent 1px), linear-gradient(90deg, #1a1a28 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          padding: 24,
        }}
        onClick={handleCanvasClick}
      >
        <div
          ref={svgWrapRef}
          className="relative mx-auto overflow-hidden rounded-lg shadow-2xl"
          style={{
            aspectRatio: `${aspectRatio}`,
            maxWidth: '100%',
            boxShadow: '0 20px 80px rgba(0,0,0,0.7)',
            transition: 'aspect-ratio 0.3s ease',
          }}
        >
          {/* SVG render */}
          <div
            dangerouslySetInnerHTML={{ __html: svgString }}
            className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full"
          />

          {/* Layer click targets + selection rings */}
          {template.layers.map((layer) => {
            if (layer.type !== 'text') return null
            const tl = layer as TextLayer
            const isSelected = selectedLayerId === tl.id
            const isEditing = editingLayerId === tl.id

            return (
              <div
                key={tl.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${tl.boundingBox.x * 100}%`,
                  top: `${tl.boundingBox.y * 100}%`,
                  width: `${tl.boundingBox.width * 100}%`,
                  height: `${tl.boundingBox.height * 100}%`,
                  border: isSelected || isEditing ? '1.5px solid #4f6ef7' : '1.5px solid transparent',
                  borderRadius: 4,
                  transition: 'border-color 0.15s ease, opacity 0.15s ease',
                  opacity: isEditing ? 0 : 1,
                  pointerEvents: isEditing ? 'none' : 'auto',
                }}
                onClick={(e) => handleLayerClick(e, tl.id)}
                onDoubleClick={(e) => handleLayerDblClick(e, tl.id)}
              />
            )
          })}

          {/* Layer labels on hover */}
          {template.layers.map((layer) => {
            if (layer.type !== 'text') return null
            const tl = layer as TextLayer
            const isSelected = selectedLayerId === tl.id && !editingLayerId
            if (!isSelected) return null
            return (
              <div
                key={`label-${tl.id}`}
                className="absolute pointer-events-none text-xs font-medium"
                style={{
                  left: `${tl.boundingBox.x * 100}%`,
                  top: `calc(${tl.boundingBox.y * 100}% - 22px)`,
                  background: '#4f6ef7',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  whiteSpace: 'nowrap',
                }}
              >
                {tl.role} · double-click to edit
              </div>
            )
          })}
        </div>
      </div>

      {/* Edit overlay */}
      {editOverlay && editingLayer && (
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          className="absolute"
          style={{
            left: editOverlay.left,
            top: editOverlay.top,
            width: editOverlay.width,
            minHeight: editOverlay.height,
            fontFamily: editingLayer.defaultStyle.fontFamily,
            fontSize: editOverlay.fontSize,
            lineHeight: editingLayer.defaultStyle.lineHeight,
            outline: 'none',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            cursor: 'text',
            color: editingLayer.defaultStyle.fill,
            zIndex: 10,
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setEditingLayerId(null)
              setEditOverlay(null)
              setHasSelection(false)
            }
          }}
        >
          {editingLayer.runs.map((run, i) => (
            <span
              key={i}
              style={{
                color: run.style.fill,
                fontWeight: run.style.bold ? 'bold' : 'normal',
                fontStyle: run.style.italic ? 'italic' : 'normal',
              }}
            >
              {run.text}
            </span>
          ))}
        </div>
      )}

      {/* Floating toolbar */}
      {hasSelection && editingLayerId && (
        <FloatingToolbar onApply={handleApplyStyle} onClose={handleToolbarClose} />
      )}

      {/* Hint */}
      {!selectedLayerId && !editingLayerId && (
        <p className="mt-3 text-center text-xs" style={{ color: '#6b6b80' }}>
          Click any layer to select · Double-click to edit · Drag to select characters
        </p>
      )}
      {selectedLayerId && !editingLayerId && (
        <p className="mt-3 text-center text-xs" style={{ color: '#4f6ef7' }}>
          Double-click to enter text editing mode
        </p>
      )}
      {editingLayerId && (
        <p className="mt-3 text-center text-xs" style={{ color: '#6b6b80' }}>
          Select characters → style them · Press Esc to exit
        </p>
      )}
    </div>
  )
}
