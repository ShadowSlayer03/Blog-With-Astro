---
title: "Getting Started with Astro 6"
description: "Learn how to build blazing-fast websites with Astro 6, the modern static site generator that ships zero JavaScript by default."
pubDate: 2026-03-20
tags: ["astro", "web development", "tutorial"]
heroImage: "https://pub-e9e6d7b1566e4199a52a0c68cec4e410.r2.dev/images/astro-getting-started.jpg"
---

## Why Astro?

Astro is a modern web framework designed for **content-driven websites**. Unlike traditional JavaScript frameworks that ship heavy client-side bundles, Astro takes a different approach:

- **Zero JS by default** — Only hydrate what you need
- **Content Collections** — Type-safe Markdown and MDX
- **Island Architecture** — Partial hydration for interactive components
- **Framework agnostic** — Use React, Vue, Svelte, or none at all

## Quick Start

Getting started with Astro is incredibly simple:

```bash
# Create a new project
bun create astro@latest my-blog

# Start the dev server
bun run dev
```

## Content Collections

One of Astro's killer features is **Content Collections**. Define a schema for your content and get full type safety:

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
```

## What's Next?

In upcoming posts, we'll explore:

1. Adding MDX components to your blog
2. Implementing dark mode with Tailwind CSS
3. Deploying to Vercel or Cloudflare Pages

Stay tuned! 🚀
