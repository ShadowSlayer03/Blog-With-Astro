# AstroBlog

A modern, fast, and feature-rich blog built with **Astro 6**, **Tailwind CSS 4**, and **React 19** — using Islands Architecture so pages ship zero JS by default and only hydrate interactive components on demand.

## Features

- **Islands Architecture** — Static HTML pages with selective hydration for interactive components
- **Keystatic CMS** — Git-based content management at `/keystatic`, write posts from any device
- **Pagefind Search** — Static full-text search index, triggered with `Ctrl/Cmd + K`
- **Giscus Comments** — GitHub Discussions–powered comment system on every post
- **OG Image Generation** — Auto-generated social cards for each post via Satori + Sharp
- **RSS Feed** — Auto-generated at `/rss.xml`
- **Sitemap** — Auto-generated for SEO
- **Dark Mode** — System preference + manual toggle, persisted in localStorage
- **Tag Filtering** — Browse posts by tag with dedicated `/blog/tag/[tag]` pages
- **Reading Progress** — Scroll progress bar on blog posts
- **Table of Contents** — Auto-generated sidebar TOC with active heading tracking
- **Like & Share** — Per-post like button (localStorage) and share dropdown (Twitter/X, LinkedIn, Reddit, clipboard)
- **Back to Top** — Floating button appears after scrolling
- **Dual-Theme Syntax Highlighting** — Shiki with `github-light` / `github-dark`
- **MDX Support** — Use React components inside Markdown posts

## Tech Stack

| Category | Technology |
|:--|:--|
| Framework | Astro 6 |
| Styling | Tailwind CSS 4 + Typography plugin |
| Islands | React 19 |
| CMS | Keystatic |
| Search | Pagefind |
| Comments | Giscus |
| OG Images | Satori |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| Runtime | Bun |

## Project Structure

```
src/
├── components/
│   ├── islands/          # React islands (hydrated on demand)
│   │   ├── BackToTop.tsx
│   │   ├── GiscusComments.tsx
│   │   ├── LikeButton.tsx
│   │   ├── ScrollProgress.tsx
│   │   ├── SearchDialog.tsx
│   │   ├── ShareButton.tsx
│   │   └── TableOfContents.tsx
│   ├── BlogCard.astro
│   ├── Footer.astro
│   ├── Header.astro
│   ├── Newsletter.astro
│   ├── ReadingTime.astro
│   ├── SEOHead.astro
│   └── TagPill.astro
├── content/
│   └── blog/             # Markdown / MDX blog posts
├── layouts/
│   ├── BaseLayout.astro
│   └── BlogPostLayout.astro
├── lib/
│   ├── constants.ts      # Site metadata, socials, nav links
│   └── utils.ts          # formatDate, getReadingTime, slugify
├── pages/
│   ├── blog/
│   │   ├── tag/[tag].astro
│   │   ├── [slug].astro
│   │   └── index.astro
│   ├── og/[slug].png.ts  # Dynamic OG image endpoint
│   ├── 404.astro
│   ├── about.astro
│   ├── index.astro
│   └── rss.xml.ts
├── styles/
│   └── global.css
└── content.config.ts     # Content Collections schema
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0+) or Node.js 22+

### Install & Run

```bash
# Install dependencies
bun install

# Start dev server at localhost:4321
bun run dev

# Build for production (includes Pagefind index generation)
bun run build

# Preview the production build
bun run preview
```

## Configuration

Edit `src/lib/constants.ts` to set your site metadata:

```ts
export const SITE = {
  title: 'AstroBlog',
  description: 'Your blog description',
  url: 'https://your-domain.com',
  author: 'Your Name',
};

export const SOCIALS = {
  twitter: 'https://twitter.com/yourusername',
  github: 'https://github.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername',
};
```

### Giscus Comments

Update the Giscus config in `src/components/islands/GiscusComments.tsx` with your GitHub repo details. Follow the setup at [giscus.app](https://giscus.app).

### Keystatic CMS

Access the CMS at `/keystatic` in dev mode. For production, configure GitHub storage in `keystatic.config.ts` and set up GitHub OAuth. See [Keystatic docs](https://keystatic.com/docs).

## Writing Posts

Add `.md` or `.mdx` files to `src/content/blog/`:

```md
---
title: 'My New Post'
description: 'A short description for SEO and social cards'
pubDate: 2026-03-31
tags: ['astro', 'web development']
heroImage: '/images/my-post-hero.jpg'
draft: false
---

Your content here...
```

Posts with `draft: true` are excluded from the build.

## License

MIT
