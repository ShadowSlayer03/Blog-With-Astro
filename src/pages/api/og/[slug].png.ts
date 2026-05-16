import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { SITE } from '../../../lib/constants';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

let wasmInitialized = false;

let fontBoldCache: ArrayBuffer | null = null;
let fontRegularCache: ArrayBuffer | null = null;

async function getFonts(): Promise<[ArrayBuffer, ArrayBuffer]> {
  if (fontBoldCache && fontRegularCache) return [fontBoldCache, fontRegularCache];
  [fontBoldCache, fontRegularCache] = await Promise.all([
    // Fetch Outfit Bold for headings and Sekuya Regular for body/accent UI elements
    fetch('https://cdn.jsdelivr.net/fontsource/fonts/outfit@latest/latin-700-normal.woff').then((r) => r.arrayBuffer()),
    fetch('https://cdn.jsdelivr.net/fontsource/fonts/sekuya@latest/latin-400-normal.woff').then((r) => r.arrayBuffer()),
  ]);
  return [fontBoldCache, fontRegularCache];
}

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id } }));
};

export const GET: APIRoute = async ({ params }) => {
  if (!wasmInitialized) {
    const require = createRequire(import.meta.url);
    const wasmPath = require.resolve('@resvg/resvg-wasm/index_bg.wasm');
    const wasmBuffer = await readFile(wasmPath);
    await initWasm(wasmBuffer);
    wasmInitialized = true;
  }

  const posts = await getCollection('blog');
  const post = posts.find((p) => p.id === params.slug);

  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  const title = post.data.title;
  const desc =
    post.data.description.length > 150
      ? post.data.description.slice(0, 120) + '...'
      : post.data.description;
  const fontSize = title.length > 50 ? 48 : 56;
  const domain = SITE.url.replace('https://', '');

  // Fetch your dynamic updated font assets
  const [fontBold, fontRegular] = await getFonts();

  // Satori Virtual DOM
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
        backgroundColor: '#060e20', // Custom sleek dark-slate palette matching blog
        backgroundImage: 'radial-gradient(circle at 50% 0%, #111e3b 0%, #060e20 80%)',
        position: 'relative',
        color: '#fff',
      },
      children: [
        // Grid pattern layout overlay design inside the card
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
        // Neon top accent bar
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
        // ── Top section ──
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' as const, position: 'relative' },
            children: [
              // Site branding row
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center' as const },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          backgroundColor: '#00E5FF',
                          marginRight: 12,
                          boxShadow: '0 0 12px #00E5FF'
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { 
                          fontSize: 20, 
                          fontWeight: 400, 
                          fontFamily: 'Sekuya', 
                          color: '#00E5FF', 
                          letterSpacing: '0.15em' 
                        },
                        children: SITE.title.toUpperCase(),
                      },
                    },
                  ],
                },
              },
              // Title
              {
                type: 'div',
                props: {
                  style: {
                    fontSize,
                    fontWeight: 700,
                    fontFamily: 'Sekuya',
                    color: '#ffffff',
                    lineHeight: 1.2,
                    marginTop: 40,
                    letterSpacing: '-0.03em'
                  },
                  children: title,
                },
              },
              // Description
              {
                type: 'div',
                props: {
                  style: { 
                    fontSize: 24, 
                    fontFamily: 'Outfit', 
                    color: '#a3aac4', 
                    lineHeight: 1.6, 
                    marginTop: 16 
                  },
                  children: desc,
                },
              },
            ],
          },
        },
        // ── Bottom row ──
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between' as const,
              alignItems: 'center' as const,
              position: 'relative',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: 32
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { fontSize: 20, fontFamily: 'Outfit', color: '#ffffff', fontWeight: 700 },
                  children: domain,
                },
              }
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
      { name: 'Sekuya', data: fontRegular, weight: 400 as const, style: 'normal' as const },
      { name: 'Outfit', data: fontBold, weight: 700 as const, style: 'normal' as const },
    ],
  });

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(Uint8Array.from(pngBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};