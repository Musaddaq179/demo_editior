'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { TextStyle } from '@/lib/types'

interface Props {
  onApply: (style: Partial<TextStyle>) => void
  onClose: () => void
}

const BRAND_COLORS = [
  '#ffffff',
  '#f5c518',
  '#00fff0',
  '#c4622a',
  '#8fbc8f',
  '#4f6ef7',
]

export default function FloatingToolbar({ onApply, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [customHex, setCustomHex] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    positionToolbar()
  }, [])

  function positionToolbar() {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const rect = sel.getRangeAt(0).getBoundingClientRect()
    const toolbarH = 52
    const toolbarW = 320
    setPos({
      top: rect.top + window.scrollY - toolbarH - 10,
      left: Math.max(8, rect.left + window.scrollX + rect.width / 2 - toolbarW / 2),
    })
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div
      ref={ref}
      className="fade-in-up fixed z-50 flex items-center gap-2 rounded-full px-3 py-2 shadow-2xl"
      style={{
        top: pos.top,
        left: pos.left,
        background: '#1e1e2e',
        border: '1px solid #2a2a3a',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Color swatches */}
      <div className="flex items-center gap-1.5">
        {BRAND_COLORS.map((color) => (
          <button
            key={color}
            className="rounded-full transition-transform hover:scale-110 active:scale-95"
            style={{
              width: 20,
              height: 20,
              background: color,
              border: '1.5px solid rgba(255,255,255,0.15)',
              outline: 'none',
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              onApply({ fill: color })
            }}
          />
        ))}
      </div>

      <div style={{ width: 1, height: 20, background: '#2a2a3a' }} />

      {/* Custom hex */}
      <input
        type="text"
        placeholder="#hex"
        value={customHex}
        onChange={(e) => setCustomHex(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const hex = customHex.startsWith('#') ? customHex : `#${customHex}`
            if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
              onApply({ fill: hex })
              setCustomHex('')
            }
          }
        }}
        className="w-16 rounded px-1.5 py-0.5 text-xs outline-none"
        style={{ background: '#0a0a0f', border: '1px solid #2a2a3a', color: '#e8e8f0' }}
      />

      <div style={{ width: 1, height: 20, background: '#2a2a3a' }} />

      {/* Bold */}
      <button
        className="rounded px-2 py-0.5 text-xs font-bold transition-colors hover:bg-white/10"
        style={{ color: '#e8e8f0' }}
        onMouseDown={(e) => { e.preventDefault(); onApply({ bold: true }) }}
      >
        B
      </button>

      {/* Italic */}
      <button
        className="rounded px-2 py-0.5 text-xs italic transition-colors hover:bg-white/10"
        style={{ color: '#e8e8f0' }}
        onMouseDown={(e) => { e.preventDefault(); onApply({ italic: true }) }}
      >
        I
      </button>
    </div>,
    document.body
  )
}
