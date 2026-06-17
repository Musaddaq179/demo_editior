'use client'

import { useState } from 'react'

const STEPS = [
  {
    emoji: '🎨',
    title: 'Welcome to Post Module',
    desc: 'Create stunning social media posts in minutes. This quick tour will show you everything you can do!',
  },
  {
    emoji: '📐',
    title: 'Choose Your Format',
    desc: 'Select Instagram Square, Story, LinkedIn, Twitter and more. Your preview updates instantly to the correct size.',
  },
  {
    emoji: '🖼️',
    title: 'Customize Background',
    desc: 'Set gradient colors, adjust the angle, or add a real photo from our free photo library. Click "Browse Photos" in the Background section.',
  },
  {
    emoji: '✍️',
    title: 'Edit Text Layers',
    desc: 'Each layer has its own text, font, size, color and alignment. The Headline supports two colors — use it to make a key word stand out!',
  },
  {
    emoji: '🖱️',
    title: 'Drag to Reposition',
    desc: 'Hover over any text in the preview on the right — you will see a dashed border. Click and drag to move the text anywhere on the canvas!',
  },
  {
    emoji: '✨',
    title: 'Design Library',
    desc: 'Not sure where to start? Click "Design Library" to pick from 8 beautiful ready-made designs. One click applies the full style.',
  },
  {
    emoji: '🤖',
    title: 'AI Design Assistant',
    desc: 'See the 🤖 button at the bottom-right? Click it to chat with your AI design assistant — ask about colors, fonts, layouts, and more!',
  },
  {
    emoji: '⬇️',
    title: 'Download Your Post',
    desc: 'When you\'re happy with your design, click the blue "Download PNG" button to save a full-quality image ready to post!',
  },
]

interface Props {
  onComplete: () => void
}

export default function OnboardingTour({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#0f0f18',
          border: '1px solid #2a2a3a',
          borderRadius: 20,
          width: '100%',
          maxWidth: 440,
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* Progress bar */}
        <div style={{ height: 3, background: '#1e1e2e' }}>
          <div
            style={{
              height: '100%',
              width: `${((step + 1) / STEPS.length) * 100}%`,
              background: '#4f6ef7',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>{current.emoji}</div>
          <h2 style={{ color: '#e8e8f0', fontSize: 20, fontWeight: 700, marginBottom: 10, margin: '0 0 10px' }}>
            {current.title}
          </h2>
          <p style={{ color: '#8b8ba0', fontSize: 14, lineHeight: 1.6, margin: '0 0 28px' }}>
            {current.desc}
          </p>

          {/* Step dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === step ? '#4f6ef7' : i < step ? '#4f6ef760' : '#2a2a3a',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onComplete}
              style={{
                background: 'none',
                border: '1px solid #2a2a3a',
                borderRadius: 8,
                padding: '10px 20px',
                color: '#6b6b80',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Skip tour
            </button>
            <button
              type="button"
              onClick={() => isLast ? onComplete() : setStep((s) => s + 1)}
              style={{
                background: '#4f6ef7',
                border: 'none',
                borderRadius: 8,
                padding: '10px 28px',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isLast ? 'Start designing! 🚀' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
