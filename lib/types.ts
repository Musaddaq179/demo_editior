export interface TextStyle {
  fill: string
  bold?: boolean
  italic?: boolean
  fontSize?: number // multiplier: 1.0 = layer default
}

export interface TextRun {
  text: string
  style: TextStyle
}

export interface BoundingBox {
  x: number // 0-1 normalized
  y: number // 0-1 normalized
  width: number // 0-1 normalized
  height: number // 0-1 normalized
}

export interface TextLayer {
  id: string
  type: 'text'
  runs: TextRun[]
  boundingBox: BoundingBox
  defaultStyle: {
    fill: string
    fontFamily: string
    fontSize: number // px at 1080 canvas width
    lineHeight: number
    textAlign: 'left' | 'center' | 'right'
  }
  role: 'headline' | 'body' | 'cta'
}

export type Layer = TextLayer

export interface GradientStop {
  offset: string
  color: string
}

export interface BackgroundConfig {
  type: 'gradient'
  stops: GradientStop[]
  angle: number
  imageUrl?: string
}

export interface Template {
  width: number
  height: number
  background: BackgroundConfig
  layers: Layer[]
}

export type FormatId = 'ig-square' | 'ig-portrait' | 'ig-story' | 'linkedin' | 'twitter'

export interface Format {
  id: FormatId
  label: string
  dimensions: string
  aspectRatio: number
  width: number
  height: number
}

export interface BrandPreset {
  id: string
  name: string
  background: BackgroundConfig
  textColor: string
  accentColor: string
}

export interface SelectionRange {
  start: number
  end: number
}
