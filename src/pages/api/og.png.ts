import type { APIRoute } from 'astro';
import { renderOgImage, PNG_HEADERS } from '../../lib/og-render';
import { SITE } from '../../lib/constants';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);

    const title: string = url.searchParams.get('title')
        ? decodeURIComponent(url.searchParams.get('title')!)
        : SITE.title;
    const desc: string = url.searchParams.get('description')
        ? decodeURIComponent(url.searchParams.get('description')!)
        : '';

    const png = await renderOgImage(title, desc);
    return new Response(png.buffer as ArrayBuffer, { status: 200, headers: PNG_HEADERS });
};