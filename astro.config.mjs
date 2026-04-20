// @ts-check
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import pagefind from "astro-pagefind";

export default defineConfig({
  site: 'https://arjunnambiar.dev',
  // Set `export const prerender = true` for prerendering(SSG) in the blog pages.
  // output:'server' lets Keystatic's OAuth API routes stay server-side(SSR).
  output: 'server',
  adapter: cloudflare(),
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
  env: {
    schema: {
      API_KEY: envField.string({ context: 'server', access: 'secret' }),
    }
  },
});
