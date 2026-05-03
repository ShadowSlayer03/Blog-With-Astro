import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { cn } from '../../lib/utils';
import useTheme from '../../lib/useTheme';

type ArchiveGridPost = {
  slug: string;
  title: string;
  description: string;
  heroImage: string | null;
  tag: string;
  date: string;
  readingTime: number;
  authorHandle: string;
};

type Props = {
  post: ArchiveGridPost;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  disableAnimations?: boolean;
  particleCount?: number;
  glowColor?: string;
};

const MOBILE_BREAKPOINT = 768;
const DEFAULT_GLOW_COLOR = '103, 232, 249';

const createParticle = (x: number, y: number, color: string) => {
  const el = document.createElement('div');
  el.className = 'magic-bento-particle';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.background = `rgba(${color},1)`;
  el.style.boxShadow = `0 0 10px rgba(${color},0.65)`;
  return el;
};

const useIsMobile = () => {
  const [v, set] = useState(false);
  useEffect(() => {
    const fn = () => set(window.innerWidth <= MOBILE_BREAKPOINT);
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return v;
};

const useReducedMotion = () => {
  const [v, set] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fn = () => set(mq.matches);
    fn();
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return v;
};

const MagicFeaturedBlogCard: React.FC<Props> = ({
  post,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = false,
  clickEffect = true,
  disableAnimations = false,
  particleCount = 12,
  glowColor,
}) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);

  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);

  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const tweensRef = useRef<gsap.core.Tween[]>([]);

  const theme = useTheme();
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();

  const disabled = disableAnimations || isMobile || reduced;

  const activeGlowColor = useMemo(
    () => glowColor || (theme === 'dark' ? DEFAULT_GLOW_COLOR : '15, 23, 42'),
    [glowColor, theme]
  );

  // cache rect
  const updateRect = () => {
    if (cardRef.current) rectRef.current = cardRef.current.getBoundingClientRect();
  };

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);

  useEffect(() => {
    if (!cardRef.current || disabled) return;

    gsap.set(cardRef.current, { opacity: 0, y: 40, scale: 0.97 });
    gsap.to(cardRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.65,
      ease: 'power3.out',
    });
  }, [disabled]);

  const clearParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    tweensRef.current.forEach(t => t.kill());
    tweensRef.current = [];

    particlesRef.current.forEach(p => p.remove());
    particlesRef.current = [];
  }, []);

  useEffect(() => clearParticles, [clearParticles]);

  const spawnParticles = useCallback(() => {
    if (!cardRef.current || disabled || !rectRef.current) return;

    const rect = rectRef.current;

    for (let i = 0; i < particleCount; i++) {
      const id = window.setTimeout(() => {
        if (!cardRef.current) return;

        const p = createParticle(
          Math.random() * rect.width,
          Math.random() * rect.height,
          activeGlowColor
        );

        cardRef.current.appendChild(p);
        particlesRef.current.push(p);

        const tween = gsap.to(p, {
          x: (Math.random() - 0.5) * 90,
          y: (Math.random() - 0.5) * 90,
          opacity: 0.15,
          scale: 0.2,
          duration: 1.5,
          onComplete: () => p.remove(),
        });

        tweensRef.current.push(tween);
      }, i * 40);

      timeoutsRef.current.push(id);
    }
  }, [particleCount, activeGlowColor, disabled]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current || !rectRef.current) return;

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;

      const rect = rectRef.current!;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const card = cardRef.current!;
      card.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);

      if (disabled) return;

      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const anim: gsap.TweenVars = {
        duration: 0.18,
        ease: 'power2.out',
        transformPerspective: 1200,
      };

      if (enableTilt) {
        anim.rotateX = ((y - cy) / cy) * -4;
        anim.rotateY = ((x - cx) / cx) * 4;
      }

      if (enableMagnetism) {
        anim.x = (x - cx) * 0.02;
        anim.y = (y - cy) * 0.02;
      }

      gsap.killTweensOf(card);
      gsap.to(card, anim);
    });
  }, [disabled, enableTilt, enableMagnetism]);

  const handleEnter = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--glow-intensity', '1');
    spawnParticles();
  };

  const handleLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--glow-intensity', '0');
    clearParticles();

    gsap.killTweensOf(cardRef.current);
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, x: 0, y: 0 });
  };

  return (
    <a
      ref={cardRef}
      href={`/blog/${post.slug}`}
      className={cn(
        'magic-bento-card group relative z-10 flex h-full flex-col overflow-hidden rounded-[22px] transition-colors duration-300 md:flex-row',
        theme === 'dark'
          ? 'border border-white/6 bg-[#10192b]/92 shadow-[0_20px_55px_rgba(0,0,0,0.24)]'
          : 'border border-slate-200/90 bg-white/95 shadow-[0_20px_55px_rgba(15,23,42,0.10)]',
        enableBorderGlow && 'magic-bento-card--glow'
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        ['--glow-x' as string]: '50%',
        ['--glow-y' as string]: '50%',
        ['--glow-intensity' as string]: '0',
        ['--glow-radius' as string]: '320px',
      }}
    >
      <div
        ref={shimmerRef}
        className="pointer-events-none absolute inset-0 z-4 opacity-0"
        style={{
          background: `linear-gradient(105deg, transparent 40%, rgba(${activeGlowColor}, 0.07) 50%, transparent 60%)`,
        }}
      />

      <div
        className={cn(
          'relative h-72 shrink-0 overflow-hidden md:h-auto md:w-[46%] md:border-b-0 md:border-r',
          theme === 'dark'
            ? 'border-b border-white/5 bg-[#070e1a]'
            : 'border-b border-slate-200/90 bg-slate-100 md:border-r'
        )}
      >
        {post.heroImage ? (
          <img
            src={post.heroImage}
            alt={post.title}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]',
              theme === 'dark'
                ? 'opacity-80 saturate-75 mix-blend-luminosity'
                : 'opacity-95 saturate-100'
            )}
          />
        ) : (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              theme === 'dark'
                ? 'bg-[radial-gradient(circle_at_center,rgba(103,232,249,0.14),transparent_52%),linear-gradient(180deg,#040914_0%,#0a1324_100%)]'
                : 'bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.08),transparent_52%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)]'
            )}
          >
            <svg
              className={cn('h-14 w-14', theme === 'dark' ? 'text-cyan-900/80' : 'text-slate-500')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
        )}
        <div
          className={cn(
            'absolute inset-0 bg-linear-to-t',
            theme === 'dark'
              ? 'from-[#10192b] via-[#10192b]/20 to-transparent'
              : 'from-white/90 via-white/15 to-transparent'
          )}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
        <div
          className={cn(
            'mb-6 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.25em]',
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          <span
            className={cn(
              'rounded-sm border px-3 py-1.5 shadow-[0_0_10px_rgba(34,211,238,0.1)]',
              theme === 'dark'
                ? 'border-cyan-500/10 bg-[#1d2740] text-cyan-300'
                : 'border-slate-200 bg-slate-100 text-slate-700 shadow-none'
            )}
          >
            {post.tag}
          </span>
          <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>{post.date}</span>
        </div>

        <h2
          className={cn(
            'mb-5 max-w-[14ch] text-3xl font-bold leading-[1.08] tracking-tight transition-colors lg:text-[2.75rem]',
            theme === 'dark' ? 'text-white group-hover:text-cyan-100' : 'text-slate-950 group-hover:text-slate-700'
          )}
        >
          {post.title}
        </h2>

        <p
          className={cn(
            'mb-10 max-w-[52ch] text-[15px] leading-8 line-clamp-3',
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          )}
        >
          {post.description}
        </p>

        <div
          className={cn(
            'mt-auto flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.25em]',
            theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
          )}
        >
          <span>BY {post.authorHandle}</span>
          <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}>//</span>
          <span>{String(post.readingTime).padStart(2, '0')} MIN READ</span>
        </div>
      </div>
    </a>
  );
};

export default MagicFeaturedBlogCard;