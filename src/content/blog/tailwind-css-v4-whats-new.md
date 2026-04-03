---
title: "Tailwind CSS v4: What's New"
description: "Explore the exciting new features in Tailwind CSS v4, including the new engine, CSS-first configuration, and improved performance."
pubDate: 2026-03-22
tags: ["css", "tailwind", "design"]
heroImage: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=400&fit=crop"
---

## The New Era of Tailwind

Tailwind CSS v4 is a ground-up rewrite that brings massive improvements in performance, developer experience, and flexibility.

### Key Changes

#### 1. CSS-First Configuration

No more `tailwind.config.js`! Configuration now lives in your CSS:

```css
@import "tailwindcss";

@theme {
  --color-primary: #6366f1;
  --font-sans: "Inter", sans-serif;
}
```

#### 2. Lightning-Fast Performance

The new Oxide engine, written in Rust, delivers:
- **10x faster** full builds
- **100x faster** incremental builds
- Smaller output CSS

#### 3. Modern CSS Features

Tailwind v4 embraces modern CSS:

```css
/* Container queries */
.card {
  @apply @container;
}

/* Nesting without plugins */
.parent {
  .child {
    @apply text-blue-500;
  }
}
```

## Migration Tips

Moving from v3 to v4? Here's what to keep in mind:

1. **Remove the config file** — Move customizations to CSS `@theme`
2. **Update the Vite plugin** — Use `@tailwindcss/vite` instead of the PostCSS plugin
3. **Check deprecated utilities** — Some class names have changed

## Conclusion

Tailwind v4 is a fantastic upgrade that makes the utility-first workflow even better. The CSS-first approach feels more natural and the performance gains are immediately noticeable.
