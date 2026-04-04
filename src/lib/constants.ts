export const SITE = {
  title: 'AstroBlog',
  description:
    'A modern blog about web development, design, and technology. Built with Astro.',
  url: 'https://blog.arjunnambiar.dev',
  author: 'Arjun Nambiar',
} as const;

export const SOCIALS = {
  twitter: 'https://x.com/ArjunNambiar03',
  github: 'https://github.com/ShadowSlayer03',
  linkedin: 'https://linkedin.com/in/ArjunNambiar03',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
] as const;

export const POSTS_PER_PAGE = 6;
