import type { LayerDef } from './editor'

export interface BgConfig {
  color1: string
  color2: string
  angle: number
}

export interface DesignPreset {
  id: string
  name: string
  emoji: string
  bg: BgConfig
  layers: LayerDef[]
}

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    emoji: '✨',
    bg: { color1: '#0a0a1a', color2: '#1a1a3a', angle: 135 },
    layers: [
      { id: 'headline', mainText: 'Your Brand,', accentText: ' Elevated', color: '#ffffff', accentColor: '#f5c518', x: 8, y: 25, w: 84, h: 25, fontSize: 108, fontFamily: 'DM Sans', textAlign: 'left' },
      { id: 'body', mainText: 'Premium quality meets modern design.', accentText: '', color: '#a0a0c0', accentColor: '#f5c518', x: 8, y: 54, w: 75, h: 15, fontSize: 40, fontFamily: 'DM Sans', textAlign: 'left' },
      { id: 'cta', mainText: 'Learn more →', accentText: '', color: '#f5c518', accentColor: '#f5c518', x: 8, y: 74, w: 40, h: 10, fontSize: 36, fontFamily: 'DM Sans', textAlign: 'left' },
    ],
  },
  {
    id: 'teal-dark',
    name: 'Teal Dark',
    emoji: '🌊',
    bg: { color1: '#051419', color2: '#0a2830', angle: 160 },
    layers: [
      { id: 'headline', mainText: 'Make Waves', accentText: ' Today', color: '#ffffff', accentColor: '#1ABCB2', x: 8, y: 30, w: 84, h: 25, fontSize: 108, fontFamily: 'Montserrat', textAlign: 'center' },
      { id: 'body', mainText: 'Stand out in the digital ocean.', accentText: '', color: '#7abfc0', accentColor: '#1ABCB2', x: 10, y: 60, w: 80, h: 15, fontSize: 40, fontFamily: 'Montserrat', textAlign: 'center' },
      { id: 'cta', mainText: 'Get started →', accentText: '', color: '#1ABCB2', accentColor: '#1ABCB2', x: 30, y: 78, w: 40, h: 10, fontSize: 36, fontFamily: 'Montserrat', textAlign: 'center' },
    ],
  },
  {
    id: 'sunset',
    name: 'Sunset Vibes',
    emoji: '🌅',
    bg: { color1: '#1a0800', color2: '#3d1500', angle: 135 },
    layers: [
      { id: 'headline', mainText: 'Golden Hour', accentText: ' Awaits', color: '#fff8e7', accentColor: '#ff6b35', x: 8, y: 28, w: 84, h: 25, fontSize: 100, fontFamily: 'Playfair Display', textAlign: 'left' },
      { id: 'body', mainText: 'Chase the light. Capture the moment.', accentText: '', color: '#d4a57a', accentColor: '#ff6b35', x: 8, y: 57, w: 78, h: 15, fontSize: 40, fontFamily: 'Playfair Display', textAlign: 'left' },
      { id: 'cta', mainText: 'Explore →', accentText: '', color: '#ff6b35', accentColor: '#ff6b35', x: 8, y: 76, w: 35, h: 10, fontSize: 36, fontFamily: 'DM Sans', textAlign: 'left' },
    ],
  },
  {
    id: 'minimal',
    name: 'Clean Minimal',
    emoji: '⬜',
    bg: { color1: '#f0f0f0', color2: '#e0e0e0', angle: 180 },
    layers: [
      { id: 'headline', mainText: 'Less is', accentText: ' More', color: '#1a1a2e', accentColor: '#4f6ef7', x: 8, y: 30, w: 84, h: 25, fontSize: 108, fontFamily: 'Inter', textAlign: 'left' },
      { id: 'body', mainText: 'Clarity in every pixel. Simplicity by design.', accentText: '', color: '#4a4a6a', accentColor: '#4f6ef7', x: 8, y: 57, w: 75, h: 15, fontSize: 38, fontFamily: 'Inter', textAlign: 'left' },
      { id: 'cta', mainText: 'Discover →', accentText: '', color: '#4f6ef7', accentColor: '#4f6ef7', x: 8, y: 76, w: 38, h: 10, fontSize: 36, fontFamily: 'Inter', textAlign: 'left' },
    ],
  },
  {
    id: 'neon-night',
    name: 'Neon Night',
    emoji: '💜',
    bg: { color1: '#000000', color2: '#0d0015', angle: 135 },
    layers: [
      { id: 'headline', mainText: 'Future is', accentText: ' Now', color: '#e0c3fc', accentColor: '#00fff0', x: 8, y: 28, w: 84, h: 25, fontSize: 108, fontFamily: 'Montserrat', textAlign: 'center' },
      { id: 'body', mainText: 'Breaking boundaries in the digital age.', accentText: '', color: '#9d7fc8', accentColor: '#00fff0', x: 8, y: 57, w: 84, h: 15, fontSize: 40, fontFamily: 'Montserrat', textAlign: 'center' },
      { id: 'cta', mainText: 'Join now →', accentText: '', color: '#00fff0', accentColor: '#00fff0', x: 28, y: 76, w: 44, h: 10, fontSize: 36, fontFamily: 'DM Sans', textAlign: 'center' },
    ],
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    emoji: '🌹',
    bg: { color1: '#2d1515', color2: '#1a0a0a', angle: 150 },
    layers: [
      { id: 'headline', mainText: 'Timeless', accentText: ' Elegance', color: '#f5e6d3', accentColor: '#e8976b', x: 8, y: 28, w: 84, h: 25, fontSize: 100, fontFamily: 'Playfair Display', textAlign: 'center' },
      { id: 'body', mainText: 'Where beauty meets purpose.', accentText: '', color: '#c4a882', accentColor: '#e8976b', x: 10, y: 58, w: 80, h: 15, fontSize: 40, fontFamily: 'Playfair Display', textAlign: 'center' },
      { id: 'cta', mainText: 'Shop now →', accentText: '', color: '#e8976b', accentColor: '#e8976b', x: 30, y: 76, w: 40, h: 10, fontSize: 34, fontFamily: 'DM Sans', textAlign: 'center' },
    ],
  },
  {
    id: 'forest',
    name: 'Forest Deep',
    emoji: '🌿',
    bg: { color1: '#071a07', color2: '#0d2810', angle: 160 },
    layers: [
      { id: 'headline', mainText: 'Go', accentText: ' Green', color: '#e8f5e8', accentColor: '#4caf50', x: 8, y: 28, w: 84, h: 25, fontSize: 120, fontFamily: 'Poppins', textAlign: 'left' },
      { id: 'body', mainText: 'Sustainable choices for a better tomorrow.', accentText: '', color: '#8bc98b', accentColor: '#4caf50', x: 8, y: 57, w: 75, h: 15, fontSize: 40, fontFamily: 'Poppins', textAlign: 'left' },
      { id: 'cta', mainText: 'Learn more →', accentText: '', color: '#4caf50', accentColor: '#4caf50', x: 8, y: 76, w: 45, h: 10, fontSize: 36, fontFamily: 'DM Sans', textAlign: 'left' },
    ],
  },
  {
    id: 'purple-haze',
    name: 'Purple Haze',
    emoji: '🔮',
    bg: { color1: '#0d0021', color2: '#1a0035', angle: 130 },
    layers: [
      { id: 'headline', mainText: 'Dream', accentText: ' Bigger', color: '#ddd6fe', accentColor: '#a855f7', x: 8, y: 28, w: 84, h: 25, fontSize: 120, fontFamily: 'Poppins', textAlign: 'center' },
      { id: 'body', mainText: 'Unlock your creative potential today.', accentText: '', color: '#9061c8', accentColor: '#a855f7', x: 8, y: 58, w: 84, h: 15, fontSize: 40, fontFamily: 'Poppins', textAlign: 'center' },
      { id: 'cta', mainText: 'Start now →', accentText: '', color: '#a855f7', accentColor: '#a855f7', x: 28, y: 76, w: 44, h: 10, fontSize: 36, fontFamily: 'DM Sans', textAlign: 'center' },
    ],
  },
]
