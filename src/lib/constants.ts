export const SITE = {
  title: 'Arjun Nambiar\'s Blog',
  description:
    'A cool, calm, and collected blog about web development, tech, and programming.',
  url: 'https://arjunnambiar.dev/blog',
  author: 'Arjun Nambiar',
} as const;

export const SOCIALS = {
  twitter: 'https://x.com/ArjunNambiar03',
  github: 'https://github.com/ShadowSlayer03',
  linkedin: 'https://linkedin.com/in/ArjunNambiar03',
} as const;

export const NAV_LINKS = [
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
] as const;

export const PROJECT_STACK = [
  {
    name: 'Astro 6',
    desc: 'Static-first framework with Islands Architecture',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.13 22.19L11.5 18.36C13.07 17.07 14.14 15.27 14.65 13.19L18.31 16.85L22.15 15.22C21.59 19.61 18.45 21.55 13.13 22.19M5.64 12.5L1.81 10.87C2.45 5.55 4.39 2.41 8.78 1.85L7.15 5.69L10.81 9.35C8.73 9.86 6.93 10.93 5.64 12.5M21.61 2.39C21.61 2.39 16.66 .27 11 5.93C8.81 8.12 7.5 10.53 6.65 12.64C6.26 13.62 6.5 14.72 7.21 15.43L8.57 16.79C9.28 17.5 10.38 17.74 11.36 17.35C13.5 16.53 15.88 15.19 18.07 13C23.73 7.34 21.61 2.39 21.61 2.39M14.54 9.46C13.76 8.68 13.76 7.41 14.54 6.63S16.59 5.85 17.37 6.63C18.14 7.41 18.15 8.68 17.37 9.46C16.59 10.24 15.32 10.24 14.54 9.46M8.88 16.53L7.47 15.12L8.88 16.53M6.24 22L9.88 18.36C9.54 18.27 9.21 18.12 8.91 17.91L4.83 22H6.24M2 22H3.41L8.18 17.24L6.76 15.82L2 20.59V22M2 19.17L6.09 15.09C5.88 14.79 5.73 14.46 5.64 14.12L2 17.76V19.17Z"/></svg>',
  },
  {
    name: 'Tailwind CSS 4',
    desc: 'The latest utility-first styling engine',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
  },
  {
    name: 'React 19',
    desc: 'Interactive islands with concurrent rendering',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52-9.87 6.54-11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/></svg>',
  },
  {
    name: 'Keystatic',
    desc: 'Git-based local content management',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>',
  },
  {
    name: 'Turso',
    desc: 'Distributed SQLite database for the edge',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  },
  {
    name: 'Drizzle ORM',
    desc: 'TypeScript ORM with focus on type safety',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 2 6 6-6 6-6-6Z"/><path d="m10 10 6 6-6 6-6-6Z"/></svg>',
  },
  {
    name: 'TanStack Query',
    desc: 'Declarative data fetching and state management',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>',
  },
  {
    name: 'Pagefind',
    desc: 'Static zero-config full-text search',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  },
  {
    name: 'Giscus',
    desc: 'GitHub Discussions powered comments',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
  },
  {
    name: 'Bun',
    desc: 'Blazing fast JS runtime & package manager',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
  },
  {
    name: 'Shiki',
    desc: 'Beautiful dual-theme syntax highlighting',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  },
  {
    name: 'Satori',
    desc: 'Dynamic SVG and OG image generation',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
  },
];

export const POSTS_PER_PAGE = 6;