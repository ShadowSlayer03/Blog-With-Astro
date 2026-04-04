// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import pagefind from "astro-pagefind";

export default defineConfig({
  site: 'https://blog.arjunnambiar.dev',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
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
