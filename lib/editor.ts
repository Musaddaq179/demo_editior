// Shared editor state types — used by page.tsx and design presets

export interface LayerDef {
  id: string
  mainText: string
  accentText: string
  color: string
  accentColor: string
  x: number       // 0–100 (% of canvas width)
  y: number       // 0–100 (% of canvas height)
  w: number       // 0–100
  h: number       // 0–100
  fontSize: number
  fontFamily: string
  textAlign: 'left' | 'center' | 'right'
}

export const DEFAULT_LAYERS: LayerDef[] = [
  {
    id: 'headline',
    mainText: 'Your skin,',
    accentText: ' decoded',
    color: '#ffffff',
    accentColor: '#f5c518',
    x: 8, y: 25, w: 84, h: 25,
    fontSize: 108,
    fontFamily: 'DM Sans',
    textAlign: 'left',
  },
  {
    id: 'body',
    mainText: 'Personalized skincare backed by AI analysis. Built for your biology.',
    accentText: '',
    color: '#ffffff',
    accentColor: '#f5c518',
    x: 8, y: 54, w: 75, h: 20,
    fontSize: 40,
    fontFamily: 'DM Sans',
    textAlign: 'left',
  },
  {
    id: 'cta',
    mainText: 'Discover your routine →',
    accentText: '',
    color: '#f5c518',
    accentColor: '#f5c518',
    x: 8, y: 77, w: 50, h: 10,
    fontSize: 36,
    fontFamily: 'DM Sans',
    textAlign: 'left',
  },
]

export function layerDefToTemplateLayer(ld: LayerDef) {
  return {
    id: ld.id,
    type: 'text' as const,
    role: 'body' as const,
    runs: ld.accentText
      ? [
          { text: ld.mainText, style: { fill: ld.color } },
          { text: ld.accentText, style: { fill: ld.accentColor } },
        ]
      : [{ text: ld.mainText, style: { fill: ld.color } }],
    boundingBox: {
      x: ld.x / 100,
      y: ld.y / 100,
      width: ld.w / 100,
      height: ld.h / 100,
    },
    defaultStyle: {
      fill: ld.color,
      fontFamily: `${ld.fontFamily}, sans-serif`,
      fontSize: ld.fontSize,
      lineHeight: 1.2,
      textAlign: ld.textAlign,
    },
  }
}
