export interface CuratedImage {
  id: string
  name: string
  category: 'Abstract' | 'Nature' | 'City' | 'Dark' | 'Gradient'
  thumb: string   // 300×300
  full: string    // 1080×1080
}

// All images from picsum.photos — free, no API key, curated Unsplash photos
function img(id: number, name: string, category: CuratedImage['category']): CuratedImage {
  return {
    id: `p${id}`,
    name,
    category,
    thumb: `https://picsum.photos/id/${id}/300/300`,
    full: `https://picsum.photos/id/${id}/1080/1080`,
  }
}

export const CURATED_IMAGES: CuratedImage[] = [
  // Dark / Abstract
  img(1, 'Forest Path', 'Nature'),
  img(10, 'Mountain Vista', 'Nature'),
  img(15, 'Pine Forest', 'Nature'),
  img(20, 'Flower Field', 'Nature'),
  img(29, 'Snowy Peak', 'Nature'),
  img(39, 'Autumn Leaves', 'Nature'),

  // City / Urban
  img(37, 'City Bridge', 'City'),
  img(55, 'Urban Lights', 'City'),
  img(64, 'Glass Building', 'City'),
  img(76, 'Street Scene', 'City'),
  img(96, 'Aerial City', 'City'),
  img(116, 'Night Street', 'City'),

  // Abstract / Gradient
  img(91, 'Smoke Art', 'Abstract'),
  img(103, 'Water Ripple', 'Abstract'),
  img(122, 'Bokeh Lights', 'Abstract'),
  img(130, 'Texture Wave', 'Abstract'),
  img(163, 'Light Leak', 'Abstract'),
  img(175, 'Minimal Form', 'Abstract'),

  // Dark tones
  img(42, 'Dark Forest', 'Dark'),
  img(57, 'Night Sky', 'Dark'),
  img(83, 'Dark Ocean', 'Dark'),
  img(85, 'Moonlit Path', 'Dark'),
  img(110, 'Storm Clouds', 'Dark'),
  img(119, 'Dark Abstract', 'Dark'),

  // Gradient-friendly
  img(143, 'Sunset Glow', 'Gradient'),
  img(152, 'Golden Hour', 'Gradient'),
  img(167, 'Dawn Light', 'Gradient'),
  img(189, 'Misty Valley', 'Gradient'),
  img(192, 'Soft Tones', 'Gradient'),
  img(210, 'Color Wash', 'Gradient'),
]

export const IMAGE_CATEGORIES: CuratedImage['category'][] = [
  'Nature', 'City', 'Abstract', 'Dark', 'Gradient',
]
