'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'ai'
  text: string
}

const SUGGESTIONS = [
  'What colors look good together?',
  'Suggest a font for headlines',
  'How to make text stand out?',
  'Tips for Instagram posts',
]

function getResponse(input: string): string {
  const m = input.toLowerCase()

  if (m.includes('color') || m.includes('colour') || m.includes('rang')) {
    return '🎨 Best color combos for social posts:\n• White + Gold (#f5c518) — luxury feel\n• White + Teal (#1ABCB2) — fresh & modern\n• Light + Deep Purple (#a855f7) — creative\n• Cream + Burnt Orange — warm & energetic\n\nFor text on dark backgrounds, always use high contrast. Try the "Gradient to" color as your accent!'
  }

  if (m.includes('font') || m.includes('typeface') || m.includes('typography')) {
    return '🔤 Font recommendations:\n• Headlines: Montserrat, Poppins (bold & modern)\n• Elegant: Playfair Display (premium feel)\n• Clean: Inter, DM Sans (readable)\n• Friendly: Lato, Open Sans\n\nPro tip: Use one font for headline + same font lighter for body. Avoid mixing more than 2 fonts!'
  }

  if (m.includes('background') || m.includes('bg') || m.includes('image') || m.includes('photo')) {
    return '🖼️ Background tips:\n• Dark backgrounds make text pop best\n• Try a dark gradient (e.g. #0a0a1a → #1a1a3a)\n• For photo backgrounds, add a dark overlay effect using dark gradient on top\n• Click "Browse Photos" in the Background section to add a real photo!'
  }

  if (m.includes('instagram') || m.includes('ig') || m.includes('social') || m.includes('post')) {
    return '📱 Instagram post tips:\n• Use IG Square (1080×1080) for feed posts\n• IG Story (1080×1920) for stories\n• Keep text to max 20% of the image\n• Bold headline at center/top\n• CTA at bottom\n• High contrast colors perform best'
  }

  if (m.includes('headline') || m.includes('title') || m.includes('text')) {
    return '✍️ Headline tips:\n• Keep it short — 5-8 words max\n• Use accent color on the most powerful word\n• All caps for impact (LIKE THIS)\n• Left-align for editorial feel\n• Center-align for bold/graphic style\n• Font size: fill 25-40% of canvas height'
  }

  if (m.includes('layout') || m.includes('design') || m.includes('position')) {
    return '📐 Layout tips:\n• Rule of thirds: place key text at 1/3 or 2/3 of canvas\n• Drag text layers directly on the preview to reposition!\n• Leave breathing room — don\'t fill every corner\n• Headline: Y position 25-35%\n• Body: Y position 50-60%\n• CTA: Y position 70-80%'
  }

  if (m.includes('download') || m.includes('export') || m.includes('save')) {
    return '⬇️ To download your post:\n1. Set your format (IG Square, Story, etc.)\n2. Edit your design\n3. Click the blue "Download PNG" button\n4. High-quality PNG at full resolution downloads automatically!'
  }

  if (m.includes('hello') || m.includes('hi') || m.includes('help') || m.includes('hey')) {
    return '👋 Hello! I\'m your design assistant. I can help with:\n• Color combinations\n• Font selection\n• Layout tips\n• Instagram/social media best practices\n• Background photo ideas\n\nWhat would you like help with?'
  }

  return '💡 I can help with colors, fonts, layouts, backgrounds, and social media tips!\n\nTry asking:\n• "What colors work well?"\n• "Best font for headlines"\n• "Instagram post tips"\n• "How to position my text"'
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: '👋 Hi! I\'m your design assistant. Ask me about colors, fonts, layouts, or any design questions!' },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg) return
    setInput('')
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: msg },
      { role: 'ai', text: getResponse(msg) },
    ])
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 80,
            right: 24,
            width: 320,
            maxHeight: 480,
            background: '#0f0f18',
            border: '1px solid #2a2a3a',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: '#4f6ef7',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🤖</span>
              <div>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>Design Assistant</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, margin: 0 }}>Ask me anything about design</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 10,
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
                    background: msg.role === 'user' ? '#4f6ef7' : '#1e1e30',
                    color: '#e8e8f0',
                    fontSize: 12,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 20,
                    fontSize: 10,
                    cursor: 'pointer',
                    border: '1px solid #2a2a3a',
                    background: '#16161f',
                    color: '#6b6b80',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '8px 12px 12px', display: 'flex', gap: 6 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send() }}
              placeholder="Ask a design question…"
              style={{
                flex: 1,
                background: '#16161f',
                border: '1px solid #2a2a3a',
                borderRadius: 20,
                padding: '6px 12px',
                color: '#e8e8f0',
                fontSize: 12,
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => send()}
              style={{
                background: '#4f6ef7',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                color: '#fff',
                fontSize: 14,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: open ? '#1e1e30' : '#4f6ef7',
          border: `2px solid ${open ? '#4f6ef7' : 'transparent'}`,
          boxShadow: '0 4px 16px rgba(79,110,247,0.4)',
          color: '#fff',
          fontSize: 22,
          cursor: 'pointer',
          zIndex: 201,
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title={open ? 'Close assistant' : 'Open design assistant'}
      >
        {open ? '×' : '🤖'}
      </button>
    </>
  )
}
