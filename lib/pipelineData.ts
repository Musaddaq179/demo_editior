import type { Template } from './types'

export interface LayerMeta {
  layerId: string
  label: string
  detectedFont: string
  confidence: number
  colorHex: string
}

export const SAMPLE_LAYER_META: LayerMeta[] = [
  { layerId: 'counter', label: '1/11 (heading)', detectedFont: 'Montserrat', confidence: 1.0, colorHex: '#393a3c' },
  { layerId: 'handle', label: 'sooomanie TD (body)', detectedFont: 'Montserrat', confidence: 0.45, colorHex: '#72777c' },
  { layerId: 'title', label: 'AI IS MOVING… (title)', detectedFont: 'Montserrat', confidence: 0.77, colorHex: '#FFFFFF' },
  { layerId: 'swipe', label: 'SWIPE FOR MORE (cta)', detectedFont: 'Montserrat', confidence: 0.78, colorHex: '#262626' },
]

export function buildSampleTemplate(): Template {
  return {
    width: 1016,
    height: 1280,
    background: {
      type: 'gradient',
      angle: 180,
      stops: [
        { offset: '0%', color: '#111214' },
        { offset: '100%', color: '#0a0a0c' },
      ],
    },
    layers: [
      {
        id: 'counter',
        type: 'text',
        role: 'body',
        boundingBox: { x: 0.887, y: 0.027, width: 0.059, height: 0.04 },
        runs: [{ text: '1/11', style: { fill: '#393a3c' } }],
        defaultStyle: {
          fill: '#393a3c',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 32,
          lineHeight: 1.1,
          textAlign: 'center',
        },
      },
      {
        id: 'handle',
        type: 'text',
        role: 'body',
        boundingBox: { x: 0.311, y: 0.534, width: 0.363, height: 0.04 },
        runs: [{ text: 'SOOOMANIE TD', style: { fill: '#72777c' } }],
        defaultStyle: {
          fill: '#72777c',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 28,
          lineHeight: 1.1,
          textAlign: 'center',
        },
      },
      {
        id: 'title',
        type: 'text',
        role: 'headline',
        boundingBox: { x: 0.079, y: 0.616, width: 0.85, height: 0.298 },
        runs: [
          { text: "AI IS MOVING FASTER THAN EVER - HERE'S THE BIGGEST ", style: { fill: '#FFFFFF' } },
          { text: "AI NEWS YOU MIGHT'VE", style: { fill: '#1ABCB2' } },
          { text: ' MISSED THIS WEEK', style: { fill: '#FFFFFF' } },
        ],
        defaultStyle: {
          fill: '#FFFFFF',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 100,
          lineHeight: 1.1,
          textAlign: 'center',
        },
      },
      {
        id: 'swipe',
        type: 'text',
        role: 'cta',
        boundingBox: { x: 0.419, y: 0.931, width: 0.132, height: 0.04 },
        runs: [{ text: 'SWIPE FOR MORE', style: { fill: '#8a8a8a' } }],
        defaultStyle: {
          fill: '#8a8a8a',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 22,
          lineHeight: 1.1,
          textAlign: 'center',
        },
      },
    ],
  }
}
