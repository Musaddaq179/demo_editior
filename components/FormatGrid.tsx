'use client'

import { useMemo } from 'react'
import type { Template } from '@/lib/types'
import { FORMATS } from '@/lib/brands'
import { layoutEngine } from '@/lib/layoutEngine'

interface Props {
  template: Template
}

export default function FormatGrid({ template }: Props) {
  const svgs = useMemo(() => {
    return FORMATS.map((fmt) => ({
      ...fmt,
      svg: layoutEngine(template, fmt.width, fmt.height, fmt.id),
    }))
  }, [template])

  return (
    <section className="mt-20">
      <div className="mb-8 text-center">
        <h2
          className="text-2xl font-semibold tracking-tight"
          style={{ color: '#e8e8f0', fontFamily: 'var(--font-inter)' }}
        >
          One edit. Every format.
        </h2>
        <p className="mt-2 text-sm" style={{ color: '#6b6b80' }}>
          The same layout engine renders all platforms simultaneously.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {svgs.map((fmt) => {
          return (
            <div
              key={fmt.id}
              className="format-card group flex flex-col items-center gap-3"
            >
              <div
                className="relative w-full overflow-hidden rounded-xl transition-all duration-200 group-hover:-translate-y-1"
                style={{
                  height: 180,
                  background: '#0d0d14',
                  border: '1px solid #2a2a3a',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div
                  className="absolute inset-0 [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: fmt.svg }}
                />
              </div>

              <div className="text-center">
                <p className="text-xs font-medium" style={{ color: '#e8e8f0' }}>
                  {fmt.label}
                </p>
                <p className="text-xs" style={{ color: '#6b6b80' }}>
                  {fmt.dimensions}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
