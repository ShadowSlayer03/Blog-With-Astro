// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import pagefind from "astro-pagefind";
import { fileURLToPath } from 'url';

// Keystatic's virtual:keystatic-config module) and the Cloudflare adapter
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: 'https://arjunnambiar.dev',
  // Set `export const prerender = true` for prerendering(SSG) in the blog pages.
  // output:'server' lets Keystatic's OAuth API routes stay server-side(SSR).
  output: 'server',
  adapter: isProduction ? cloudflare() : node({ mode: 'standalone' }),
  integrations: [
    mdx(),
    sitemap(),
    react(),
    markdoc(),
    keystatic(),
    pagefind()
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    resolve: {
      alias: isProduction ? {} : {
        'cloudflare:workers': fileURLToPath(
          new URL('./src/lib/cf-workers-shim.ts', import.meta.url)
        ),
      },
    },
    server: {
      allowedHosts: ["astroblog.share.zrok.io"]
    }
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
