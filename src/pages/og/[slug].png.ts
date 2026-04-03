import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';
import { SITE } from '../../lib/constants';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id } }));
};

export const GET: APIRoute = async ({ params }) => {
  const posts = await getCollection('blog');
  const post = posts.find((p) => p.id === params.slug);

  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  const title = post.data.title;
  const desc =
    post.data.description.length > 120
      ? post.data.description.slice(0, 117) + '...'
      : post.data.description;
  const fontSize = title.length > 50 ? 48 : 56;
  const domain = SITE.url.replace('https://', '');

  // Fetch Inter font files
  const [fontBold, fontRegular] = await Promise.all([
    fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff').then(
      (r) => r.arrayBuffer()
    ),
    fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff').then(
      (r) => r.arrayBuffer()
    ),
  ]);

  // Build Satori virtual DOM — every element with >1 child needs display:flex
  const element = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'space-between' as const,
        width: '100%',
        height: '100%',
        padding: 60,
        backgroundColor: '#0f172a',
        fontFamily: 'Inter',
        color: '#fff',
      },
      children: [
        // ── Top section ──
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' as const },
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
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          backgroundColor: '#6366f1',
                          marginRight: 12,
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: 24, fontWeight: 700, color: '#c7d2fe' },
                        children: SITE.title,
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
                    color: '#ffffff',
                    lineHeight: 1.2,
                    marginTop: 32,
                  },
                  children: title,
                },
              },
              // Description
              {
                type: 'div',
                props: {
                  style: { fontSize: 24, color: '#a5b4fc', lineHeight: 1.5, marginTop: 12 },
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
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { fontSize: 20, color: '#818cf8' },
                  children: domain,
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: 20, color: '#64748b' },
                  children: `by ${SITE.author}`,
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
      { name: 'Inter', data: fontRegular, weight: 400 as const, style: 'normal' as const },
      { name: 'Inter', data: fontBold, weight: 700 as const, style: 'normal' as const },
    ],
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
