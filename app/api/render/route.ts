import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { layoutEngine } from '@/lib/layoutEngine'
import { FORMATS } from '@/lib/brands'
import type { Template, FormatId } from '@/lib/types'

export const runtime = 'nodejs'

let resvgInitialized = false
let fontBytes: Uint8Array | null = null
let fontLoaded = false

async function loadFont(): Promise<Uint8Array | null> {
  if (fontLoaded) return fontBytes

  // 1. Try bundled font (works in dev; also on Vercel when outputFileTracingIncludes is set)
  const localPaths = [
    path.join(process.cwd(), 'public/fonts/Inter.ttf'),
    '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
    '/Library/Fonts/Arial Unicode.ttf',
  ]
  for (const p of localPaths) {
    if (existsSync(p)) {
      try {
        fontBytes = new Uint8Array(readFileSync(p))
        fontLoaded = true
        console.log('[render] font loaded from fs:', p, fontBytes.length, 'bytes')
        return fontBytes
      } catch {}
    }
  }

  // 2. Fallback: fetch the font from our own deployment's public URL
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/fonts/Inter.ttf`)
    if (res.ok) {
      fontBytes = new Uint8Array(await res.arrayBuffer())
      fontLoaded = true
      console.log('[render] font loaded via http, bytes:', fontBytes.length)
      return fontBytes
    }
  } catch (e) {
    console.error('[render] http font fetch failed:', e)
  }

  fontLoaded = true
  console.error('[render] no font available — text will be invisible in PNG')
  return null
}

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
    const bytes = await loadFont()
    const { Resvg } = await import('@resvg/resvg-wasm')

    const fontOpts = bytes
      ? {
          fontBuffers: [bytes],
          sansSerifFamily: 'Inter',
          serifFamily: 'Inter',
          monospaceFamily: 'Inter',
          defaultFontFamily: 'Inter',
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
