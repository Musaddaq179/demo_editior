import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { layoutEngine } from '@/lib/layoutEngine'
import { FORMATS } from '@/lib/brands'
import type { Template, FormatId } from '@/lib/types'

export const runtime = 'nodejs'

let resvgInitialized = false

// resvg-wasm can't call loadSystemFonts in WASM mode.
// Pass font bytes directly via CustomFontsOptions instead.
const FONT_PATHS = [
  '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  '/Library/Fonts/Arial Unicode.ttf',
  '/Library/Fonts/Swis721 BT Roman.ttf',
]

function loadFontBytes(): Uint8Array | null {
  for (const p of FONT_PATHS) {
    if (existsSync(p)) {
      try { return new Uint8Array(readFileSync(p)) } catch {}
    }
  }
  return null
}

const FONT_BYTES = loadFontBytes()
console.log('[render] font loaded:', FONT_BYTES ? `${FONT_BYTES.length} bytes` : 'NONE — text will be invisible')

async function initResvg() {
  if (resvgInitialized) return
  const { initWasm } = await import('@resvg/resvg-wasm')
  try {
    const wasmPath = path.resolve('./node_modules/@resvg/resvg-wasm/index_bg.wasm')
    const wasmBytes = readFileSync(wasmPath)
    await initWasm(wasmBytes)
  } catch {
    const res = await fetch('https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm')
    await initWasm(res)
  }
  resvgInitialized = true
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const encoded = searchParams.get('template')
  const formatId = (searchParams.get('format') ?? 'ig-square') as FormatId

  if (!encoded) {
    return NextResponse.json({ error: 'Missing template param' }, { status: 400 })
  }

  let template: Template
  try {
    // Client sends base64url without padding; Node Buffer handles that correctly
    const json = Buffer.from(encoded, 'base64url').toString('utf-8')
    template = JSON.parse(json)
  } catch {
    return NextResponse.json({ error: 'Invalid template' }, { status: 400 })
  }

  const format = FORMATS.find((f) => f.id === formatId)
  const W = format?.width ?? template.width
  const H = format?.height ?? template.height

  const svg = layoutEngine(template, W, H, 'server')

  try {
    await initResvg()
    const { Resvg } = await import('@resvg/resvg-wasm')
    const fontOpts = FONT_BYTES
      ? {
          fontBuffers: [FONT_BYTES],
          // Map all generic families → the loaded font so resvg can find it
          // regardless of what fontFamily the SVG specifies
          sansSerifFamily: 'Arial Unicode MS',
          serifFamily: 'Arial Unicode MS',
          monospaceFamily: 'Arial Unicode MS',
          defaultFontFamily: 'Arial Unicode MS',
        }
      : { loadSystemFonts: true }
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: W },
      font: fontOpts,
    })
    const pngData = resvg.render().asPng()
    const png = Buffer.from(pngData)

    return new NextResponse(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('resvg error', err)
    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml' },
    })
  }
}
