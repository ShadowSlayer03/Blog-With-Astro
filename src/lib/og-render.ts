import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { SITE } from './constants';

let wasmInitialized = false;
let fontBoldCache: ArrayBuffer | null = null;
let fontRegularCache: ArrayBuffer | null = null;

export async function getFonts(): Promise<[ArrayBuffer, ArrayBuffer]> {
  if (fontBoldCache && fontRegularCache) return [fontBoldCache, fontRegularCache];
  [fontBoldCache, fontRegularCache] = await Promise.all([
    fetch('https://cdn.jsdelivr.net/fontsource/fonts/outfit@latest/latin-700-normal.woff').then(r => r.arrayBuffer()),
    fetch('https://cdn.jsdelivr.net/fontsource/fonts/sekuya@latest/latin-400-normal.woff').then(r => r.arrayBuffer()),
  ]);
  return [fontBoldCache, fontRegularCache];
}

export async function initResvg() {
  if (wasmInitialized) return;

  if (process.env.NODE_ENV === 'production') {
    const wasmModule = await import('@resvg/resvg-wasm/index_bg.wasm');
    await initWasm(wasmModule.default);
  } else {
    const { readFile } = await import('node:fs/promises');
    const { resolve } = await import('node:path');
    const wasmPath = resolve('node_modules/@resvg/resvg-wasm/index_bg.wasm');
    const wasmBuffer = await readFile(wasmPath);
    await initWasm(wasmBuffer);
  }

  wasmInitialized = true;
}

export async function renderOgImage(title: string, desc: string): Promise<Uint8Array> {
  await initResvg();
  const [fontBold, fontRegular] = await getFonts();

  const displayDesc = desc.length > 150 ? desc.slice(0, 120) + '...' : desc;
  const fontSize = title.length > 50 ? 44 : 52;
  const domain = SITE.url.replace('https://', '');

  const element = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'space-between' as const,
        width: '100%',
        height: '100%',
        padding: 80,
        backgroundColor: '#060e20',
        backgroundImage: 'radial-gradient(circle at 50% 0%, #111e3b 0%, #060e20 80%)',
        position: 'relative',
        color: '#fff',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: 'linear-gradient(to right, rgba(0, 229, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.02) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }
          }
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0, left: '5%', right: '5%',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #00E5FF, #a68cff, transparent)',
            }
          }
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' as const, position: 'relative' },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'row' as const, alignItems: 'center' as const },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          width: 14, height: 14,
                          borderRadius: 7,
                          backgroundColor: '#00E5FF',
                          marginRight: 12,
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', fontSize: 20, fontWeight: 400, fontFamily: 'Sekuya', color: '#00E5FF', letterSpacing: '0.15em' },
                        children: SITE.title.toUpperCase(),
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize, fontWeight: 700, fontFamily: 'Outfit', color: '#ffffff', lineHeight: 1.2, marginTop: 40, letterSpacing: '-0.02em', maxWidth: 900 },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: 24, fontWeight: 400, fontFamily: 'Outfit', color: '#a3aac4', lineHeight: 1.6, marginTop: 20, maxWidth: 750 },
                  children: displayDesc,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row' as const,
              justifyContent: 'space-between' as const,
              alignItems: 'center' as const,
              position: 'relative',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: 32,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: 20, fontFamily: 'Outfit', color: '#ffffff', fontWeight: 700 },
                  children: domain,
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(element as any, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Sekuya', data: fontRegular, weight: 400, style: 'normal' },
      { name: 'Outfit', data: fontBold, weight: 700, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return Uint8Array.from(pngData.asPng());
}

export const PNG_HEADERS = {
  'Content-Type': 'image/png',
  'Cache-Control': 'public, max-age=31536000, immutable',
};