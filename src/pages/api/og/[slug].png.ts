import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage, PNG_HEADERS } from '../../../lib/og-render';
import { SITE } from '../../../lib/constants';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug ?? '';

  let title: string = SITE.title;
  let desc: string = '';

  if (slug) {
    const posts = await getCollection('blog');
    const match = posts.find(p => p.id === slug);
    if (match) {
      title = match.data.title;
      desc = match.data.description ?? '';
    }
  }

  const png = await renderOgImage(title, desc);
  return new Response(png.buffer as ArrayBuffer, { status: 200, headers: PNG_HEADERS });
};