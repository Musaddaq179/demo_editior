import type { BrandPreset, Format } from './types'

export const BRANDS: BrandPreset[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    background: {
      type: 'gradient',
      stops: [
        { offset: '0%', color: '#0a0a1a' },
        { offset: '100%', color: '#1a1a3a' },
      ],
      angle: 135,
    },
    textColor: '#ffffff',
    accentColor: '#f5c518',
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    background: {
      type: 'gradient',
      stops: [
        { offset: '0%', color: '#fdf0d5' },
        { offset: '100%', color: '#f5e0b5' },
      ],
      angle: 135,
    },
    textColor: '#3d2b1f',
    accentColor: '#c4622a',
  },
  {
    id: 'forest',
    name: 'Forest',
    background: {
      type: 'gradient',
      stops: [
        { offset: '0%', color: '#0d1f0d' },
        { offset: '100%', color: '#1a2e1a' },
      ],
      angle: 135,
    },
    textColor: '#f0ede6',
    accentColor: '#8fbc8f',
  },
  {
    id: 'neon',
    name: 'Neon',
    background: {
      type: 'gradient',
      stops: [
        { offset: '0%', color: '#000000' },
        { offset: '100%', color: '#050510' },
      ],
      angle: 135,
    },
    textColor: '#ffffff',
    accentColor: '#00fff0',
  },
]

export const FORMATS: Format[] = [
  { id: 'ig-square', label: 'Instagram Square', dimensions: '1080 × 1080', aspectRatio: 1, width: 1080, height: 1080 },
  { id: 'ig-portrait', label: 'Instagram Portrait', dimensions: '1080 × 1350', aspectRatio: 4 / 5, width: 1080, height: 1350 },
  { id: 'ig-story', label: 'Instagram Story', dimensions: '1080 × 1920', aspectRatio: 9 / 16, width: 1080, height: 1920 },
  { id: 'linkedin', label: 'LinkedIn', dimensions: '1200 × 627', aspectRatio: 1200 / 627, width: 1200, height: 627 },
  { id: 'twitter', label: 'Twitter / X', dimensions: '1600 × 900', aspectRatio: 16 / 9, width: 1600, height: 900 },
]

export function applyBrandToTemplate(
  template: import('./types').Template,
  brand: BrandPreset
): import('./types').Template {
  return {
    ...template,
    background: brand.background,
    layers: template.layers.map((layer) => {
      if (layer.type !== 'text') return layer
      return {
        ...layer,
        runs: layer.runs.map((run) => {
          // If the run had the previous accent color, update to new accent
          // We track accent runs by role: headline last word, cta all text
          return run
        }),
        defaultStyle: {
          ...layer.defaultStyle,
          fill: layer.role === 'headline' || layer.role === 'body'
            ? brand.textColor
            : brand.accentColor,
        },
      }
    }),
  }
}
