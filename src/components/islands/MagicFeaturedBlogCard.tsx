import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { cn } from '../../lib/utils';

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

type MagicFeaturedBlogCardProps = {
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

const createParticleElement = (x: number, y: number, color: string): HTMLDivElement => {
  const element = document.createElement('div');
  element.className = 'magic-bento-particle';
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  element.style.background = `rgba(${color}, 1)`;
  element.style.boxShadow = `0 0 10px rgba(${color}, 0.65)`;
  return element;
};

const useShouldReduceMotion = (): boolean => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setShouldReduceMotion(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return shouldReduceMotion;
};

const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return isMobile;
};

const MagicFeaturedBlogCard: React.FC<MagicFeaturedBlogCardProps> = ({
  post,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = false,
  clickEffect = true,
  disableAnimations = false,
  particleCount = 12,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isMobile = useIsMobile();
  const shouldReduceMotion = useShouldReduceMotion();
  const shouldDisableAnimations = disableAnimations || isMobile || shouldReduceMotion;

  const timeoutsRef = useRef<number[]>([]);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const particleTweensRef = useRef<gsap.core.Tween[]>([]);

  // Staggered entrance animation on mount
  useEffect(() => {
    if (!cardRef.current || shouldDisableAnimations) return;

    gsap.set(cardRef.current, { opacity: 0, y: 40, scale: 0.97 });
    gsap.to(cardRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.65,
      delay: 0,
      ease: 'power3.out',
    });
  }, [shouldDisableAnimations]);

  const clearParticles = useCallback(() => {
    timeoutsRef.current.forEach(window.clearTimeout);
    timeoutsRef.current = [];

    particleTweensRef.current.forEach((tween) => tween.kill());
    particleTweensRef.current = [];

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out',
        onComplete: () => particle.remove(),
      });
    });

    particlesRef.current = [];
  }, []);

  useEffect(() => clearParticles, [clearParticles]);

  const spawnParticles = useCallback(() => {
    if (shouldDisableAnimations || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();

    for (let index = 0; index < particleCount; index += 1) {
      const timeoutId = window.setTimeout(() => {
        if (!cardRef.current) return;

        const particle = createParticleElement(
          Math.random() * rect.width,
          Math.random() * rect.height,
          glowColor,
        );

        cardRef.current.appendChild(particle);
        particlesRef.current.push(particle);

        const driftTween = gsap.to(particle, {
          x: (Math.random() - 0.5) * 90,
          y: (Math.random() - 0.5) * 90,
          opacity: 0.15,
          scale: 0.2,
          duration: 1.4 + Math.random() * 1.2,
          ease: 'power2.out',
          onComplete: () => {
            particle.remove();
            particlesRef.current = particlesRef.current.filter((current) => current !== particle);
          },
        });

        particleTweensRef.current.push(driftTween);
      }, index * 45);

      timeoutsRef.current.push(timeoutId);
    }
  }, [glowColor, particleCount, shouldDisableAnimations]);

  const resetTransforms = useCallback(() => {
    if (!cardRef.current || shouldDisableAnimations) return;

    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      duration: 0.28,
      ease: 'power2.out',
      clearProps: 'transformPerspective',
    });
  }, [shouldDisableAnimations]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      card.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);

      if (shouldDisableAnimations) return;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const animation: gsap.TweenVars = {
        duration: 0.18,
        ease: 'power2.out',
        transformPerspective: 1200,
      };

      if (enableTilt) {
        animation.rotateX = ((y - centerY) / centerY) * -4; // reduced tilt for larger card
        animation.rotateY = ((x - centerX) / centerX) * 4;
      }

      if (enableMagnetism) {
        animation.x = (x - centerX) * 0.02;
        animation.y = (y - centerY) * 0.02;
      }

      gsap.to(card, animation);
    },
    [enableMagnetism, enableTilt, shouldDisableAnimations],
  );

  const handleMouseEnter = useCallback(() => {
    if (!cardRef.current) return;

    cardRef.current.style.setProperty('--glow-intensity', '1');
    spawnParticles();

    if (shimmerRef.current && !shouldDisableAnimations) {
      gsap.fromTo(
        shimmerRef.current,
        { x: '-100%', opacity: 0.6 },
        { x: '200%', opacity: 0, duration: 0.75, ease: 'power2.inOut' },
      );
    }

    if (cardRef.current && !shouldDisableAnimations) {
      gsap.to(cardRef.current, {
        boxShadow: `0 24px 60px rgba(0,0,0,0.35), 0 0 40px rgba(${glowColor}, 0.08)`,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [spawnParticles, shouldDisableAnimations, glowColor]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;

    cardRef.current.style.setProperty('--glow-intensity', '0');
    clearParticles();
    resetTransforms();

    if (cardRef.current && !shouldDisableAnimations) {
      gsap.to(cardRef.current, {
        boxShadow: '0 18px 50px rgba(0, 0, 0, 0.22)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [clearParticles, resetTransforms, shouldDisableAnimations]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (shouldDisableAnimations || !clickEffect || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );

      const ripple = document.createElement('div');
      ripple.className = 'magic-bento-ripple';
      ripple.style.left = `${x - maxDistance}px`;
      ripple.style.top = `${y - maxDistance}px`;
      ripple.style.width = `${maxDistance * 2}px`;
      ripple.style.height = `${maxDistance * 2}px`;
      ripple.style.background = `radial-gradient(circle, rgba(${glowColor}, 0.28) 0%, rgba(${glowColor}, 0.12) 35%, transparent 70%)`;

      cardRef.current.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          onComplete: () => ripple.remove(),
        },
      );
    },
    [clickEffect, glowColor, shouldDisableAnimations],
  );

  return (
    <div className="magic-bento-shell relative w-full h-full" ref={containerRef}>
      <style>{`
        .magic-bento-card {
          transform-style: preserve-3d;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.22);
        }
        .magic-bento-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(460px circle at var(--glow-x) var(--glow-y), rgba(${glowColor}, calc(var(--glow-intensity) * 0.12)) 0%, transparent 58%);
          pointer-events: none;
          opacity: 1;
          z-index: 0;
        }
        .magic-bento-card--glow::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y), rgba(${glowColor}, calc(var(--glow-intensity) * 0.95)) 0%, rgba(${glowColor}, calc(var(--glow-intensity) * 0.25)) 35%, transparent 62%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
          z-index: 2;
        }
        .magic-bento-particle,
        .magic-bento-ripple {
          position: absolute;
          pointer-events: none;
          border-radius: 999px;
          z-index: 3;
        }
        .magic-bento-particle {
          width: 3px;
          height: 3px;
        }
      `}</style>
      
      <a
        ref={cardRef}
        href={`/blog/${post.slug}`}
        className={cn(
          'magic-bento-card group flex flex-col overflow-hidden rounded-[22px] border border-white/6 bg-[#10192b]/92 shadow-[0_20px_55px_rgba(0,0,0,0.24)] transition-colors duration-300 md:flex-row relative z-10 h-full',
          enableBorderGlow && 'magic-bento-card--glow'
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
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
            background: `linear-gradient(105deg, transparent 40%, rgba(${glowColor}, 0.07) 50%, transparent 60%)`,
          }}
        />

        <div className="relative h-72 shrink-0 overflow-hidden border-b border-white/5 bg-[#070e1a] md:h-auto md:w-[46%] md:border-b-0 md:border-r">
          {post.heroImage ? (
            <img
              src={post.heroImage}
              alt={post.title}
              className="absolute inset-0 h-full w-full object-cover opacity-80 saturate-75 mix-blend-luminosity transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(103,232,249,0.14),transparent_52%),linear-gradient(180deg,#040914_0%,#0a1324_100%)]">
              <svg
                className="h-14 w-14 text-cyan-900/80"
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
          <div className="absolute inset-0 bg-linear-to-t from-[#10192b] via-[#10192b]/20 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col justify-center p-8 lg:p-10 xl:p-12 relative z-10">
          <div className="mb-6 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.25em] text-slate-400">
            <span className="rounded-sm border border-cyan-500/10 bg-[#1d2740] px-3 py-1.5 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
              {post.tag}
            </span>
            <span className="text-slate-500">
              {post.date}
            </span>
          </div>

          <h2 className="mb-5 max-w-[14ch] text-3xl font-bold leading-[1.08] tracking-tight text-white transition-colors group-hover:text-cyan-100 lg:text-[2.75rem]">
            {post.title}
          </h2>

          <p className="mb-10 max-w-[52ch] text-[15px] leading-8 text-slate-400 line-clamp-3">
            {post.description}
          </p>

          <div className="mt-auto flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.25em] text-slate-500">
            <span>BY {post.authorHandle}</span>
            <span className="text-slate-600">//</span>
            <span>
              {String(post.readingTime).padStart(2, "0")} MIN READ
            </span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default MagicFeaturedBlogCard;