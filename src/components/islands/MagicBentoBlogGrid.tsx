import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { cn } from '../../lib/utils';
import useTheme from '../../lib/useTheme';

export type ArchiveGridPost = {
  slug: string;
  title: string;
  description: string;
  heroImage: string | null;
  tag: string;
  date: string;
  readingTime: number;
};

type MagicBentoBlogGridProps = {
  posts: ArchiveGridPost[];
  textAutoHide?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
};

const MOBILE_BREAKPOINT = 768;
const DEFAULT_GLOW_COLOR = '103, 232, 249';
const DEFAULT_PARTICLE_COUNT = 10;
const DEFAULT_SPOTLIGHT_RADIUS = 360;

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

type BentoCardProps = {
  post: ArchiveGridPost;
  index: number;
  theme: 'dark' | 'light';
  textAutoHide: boolean;
  shouldDisableAnimations: boolean;
  enableTilt: boolean;
  enableMagnetism: boolean;
  clickEffect: boolean;
  enableBorderGlow: boolean;
  particleCount: number;
  glowColor: string;
};

const BentoCard: React.FC<BentoCardProps> = ({
  post,
  index,
  theme,
  textAutoHide,
  shouldDisableAnimations,
  enableTilt,
  enableMagnetism,
  clickEffect,
  enableBorderGlow,
  particleCount,
  glowColor,
}) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<number[]>([]);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const particleTweensRef = useRef<gsap.core.Tween[]>([]);
  const cardShadow = theme === 'dark' ? '0 18px 50px rgba(0, 0, 0, 0.22)' : '0 18px 40px rgba(15, 23, 42, 0.08)';

  useEffect(() => {
    if (!cardRef.current || shouldDisableAnimations) return;

    gsap.set(cardRef.current, { opacity: 0, y: 40, scale: 0.97 });
    gsap.to(cardRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.65,
      delay: index * 0.12,
      ease: 'power3.out',
    });
  }, [index, shouldDisableAnimations]);

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
    if (shouldDisableAnimations || !cardRef.current) {
      return;
    }

    const rect = cardRef.current.getBoundingClientRect();

    for (let index = 0; index < particleCount; index += 1) {
      const timeoutId = window.setTimeout(() => {
        if (!cardRef.current) {
          return;
        }

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
    if (!cardRef.current || shouldDisableAnimations) {
      return;
    }

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
      if (!card) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      card.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);

      if (shouldDisableAnimations) {
        return;
      }

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const animation: gsap.TweenVars = {
        duration: 0.18,
        ease: 'power2.out',
        transformPerspective: 1200,
      };

      if (enableTilt) {
        animation.rotateX = ((y - centerY) / centerY) * -8;
        animation.rotateY = ((x - centerX) / centerX) * 8;
      }

      if (enableMagnetism) {
        animation.x = (x - centerX) * 0.035;
        animation.y = (y - centerY) * 0.035;
      }

      gsap.to(card, animation);
    },
    [enableMagnetism, enableTilt, shouldDisableAnimations],
  );

  const handleMouseEnter = useCallback(() => {
    if (!cardRef.current) {
      return;
    }

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
    if (!cardRef.current) {
      return;
    }

    cardRef.current.style.setProperty('--glow-intensity', '0');
    clearParticles();
    resetTransforms();

    if (cardRef.current && !shouldDisableAnimations) {
      gsap.to(cardRef.current, {
        boxShadow: cardShadow,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, [cardShadow, clearParticles, resetTransforms, shouldDisableAnimations]);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (shouldDisableAnimations || !clickEffect || !cardRef.current) {
        return;
      }

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
    <a
      ref={cardRef}
      href={`/blog/${post.slug}`}
      className={cn(
        'magic-bento-card group relative flex h-full min-h-72 flex-col overflow-hidden rounded-[20px] border border-white/6 bg-[#091224]/90 transition-colors duration-300',
        enableBorderGlow && 'magic-bento-card--glow',
        theme === 'dark'
          ? 'border-white/6 bg-[#091224]/90'
          : 'border-slate-200/90 bg-white/95 shadow-[0_16px_38px_rgba(15,23,42,0.08)]',
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        ['--glow-x' as string]: '50%',
        ['--glow-y' as string]: '50%',
        ['--glow-intensity' as string]: '0',
        ['--glow-radius' as string]: '280px',
      }}
    >
      {/* Shimmer overlay */}
      <div
        ref={shimmerRef}
        className="pointer-events-none absolute inset-0 z-4 opacity-0"
        style={{
          background: `linear-gradient(105deg, transparent 40%, rgba(${glowColor}, 0.07) 50%, transparent 60%)`,
        }}
      />

      <div className={cn(
        'relative overflow-hidden border-b pt-[54%]',
        theme === 'dark' ? 'border-white/5 bg-[#050b14]' : 'border-slate-200/90 bg-slate-100'
      )}>
        <div className="magic-bento-scanline" />
        <div className="magic-bento-vignette" />
        {post.heroImage ? (
          <img
            src={post.heroImage}
            alt={post.title}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]',
              theme === 'dark'
                ? 'opacity-85 saturate-75 mix-blend-luminosity'
                : 'opacity-95 saturate-100'
            )}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            decoding="async"
          />
        ) : (
          <div className={cn(
            'absolute inset-0 flex items-center justify-center',
            theme === 'dark'
              ? 'bg-[radial-gradient(circle_at_center,rgba(103,232,249,0.14),transparent_52%),linear-gradient(180deg,#040914_0%,#0a1324_100%)]'
              : 'bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.08),transparent_52%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)]'
          )}>
            <svg className={cn('h-12 w-12', theme === 'dark' ? 'text-cyan-900/80' : 'text-slate-500')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
        )}

        <div className={cn(
          'absolute inset-0 bg-linear-to-t',
          theme === 'dark' ? 'from-[#091224] via-[#091224]/25 to-transparent' : 'from-white/95 via-white/15 to-transparent'
        )} />
        <div className={cn(
          'absolute left-4 top-4 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.24em]',
          theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
        )}>
          <span>{post.date}</span>
          <span className={theme === 'dark' ? 'text-slate-700' : 'text-slate-300'}>//</span>
          <span>{post.readingTime?.toString().padStart(2, '0')} MIN</span>
        </div>
        <div className={cn(
          'absolute right-4 top-4 rounded-full border px-3 py-1 font-mono text-[8px] uppercase tracking-[0.24em]',
          theme === 'dark'
            ? 'border-white/10 bg-[#111d32]/85 text-slate-200 shadow-[0_0_18px_rgba(0,0,0,0.35)]'
            : 'border-slate-200 bg-white/90 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]'
        )}>
          {post.tag}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-6">
        <h3 className={cn(
          'mb-3 text-[1.55rem] font-bold leading-[1.15] transition-colors duration-200',
          theme === 'dark' ? 'text-white group-hover:text-cyan-50' : 'text-slate-950 group-hover:text-slate-700',
          textAutoHide && 'line-clamp-2'
        )}>
          {post.title}
        </h3>
        <p className={cn(
          'mb-8 text-[0.9rem] leading-7 transition-colors duration-200',
          theme === 'dark' ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-500',
          textAutoHide && 'line-clamp-3'
        )}>
          {post.description}
        </p>

        <div className={cn(
          'mt-auto flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.24em]',
          theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
        )}>
          <span className={cn(
            'transition-colors duration-200',
            theme === 'dark' ? 'group-hover:text-cyan-400' : 'group-hover:text-slate-700'
          )}>OPEN NODE</span>
          <div className="flex items-center gap-1.5 transition-all duration-300 group-hover:gap-2.5">
            <span className={cn(
              'h-px w-0 transition-all duration-300 group-hover:w-4',
              theme === 'dark' ? 'bg-cyan-400/60' : 'bg-slate-700/60'
            )} />
            <svg className={cn(
              'h-4 w-4 transition-all duration-300 group-hover:translate-x-0.5',
              theme === 'dark' ? 'group-hover:text-cyan-300' : 'group-hover:text-slate-700'
            )} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
};

const MagicBentoBlogGrid: React.FC<MagicBentoBlogGridProps> = ({
  posts,
  textAutoHide = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = false,
  clickEffect = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useIsMobile();
  const shouldReduceMotion = useShouldReduceMotion();
  const shouldDisableAnimations = disableAnimations || isMobile || shouldReduceMotion;
  const activeGlowColor = glowColor || (theme === 'dark' ? DEFAULT_GLOW_COLOR : '15, 23, 42');

  useEffect(() => {
    if (!enableSpotlight || shouldDisableAnimations || !gridRef.current || !spotlightRef.current) {
      return;
    }

    const gridElement = gridRef.current;
    const spotlightElement = spotlightRef.current;

    const updateGlow = (event: MouseEvent) => {
      const gridRect = gridElement.getBoundingClientRect();
      const mouseX = event.clientX - gridRect.left;
      const mouseY = event.clientY - gridRect.top;

      spotlightElement.style.left = `${mouseX}px`;
      spotlightElement.style.top = `${mouseY}px`;

      let highestIntensity = 0;

      gridElement.querySelectorAll<HTMLElement>('.magic-bento-card').forEach((card) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.max(0, Math.hypot(event.clientX - centerX, event.clientY - centerY) - Math.max(rect.width, rect.height) * 0.35);

        let intensity = 0;
        if (distance <= spotlightRadius * 0.4) {
          intensity = 1;
        } else if (distance <= spotlightRadius) {
          intensity = (spotlightRadius - distance) / (spotlightRadius * 0.6);
        }

        const relativeX = ((event.clientX - rect.left) / rect.width) * 100;
        const relativeY = ((event.clientY - rect.top) / rect.height) * 100;

        card.style.setProperty('--glow-x', `${relativeX}%`);
        card.style.setProperty('--glow-y', `${relativeY}%`);
        card.style.setProperty('--glow-intensity', `${Math.max(intensity, Number(card.style.getPropertyValue('--glow-intensity')) || 0)}`);

        highestIntensity = Math.max(highestIntensity, intensity);
      });

      gsap.to(spotlightElement, {
        opacity: highestIntensity * 0.9,
        duration: 0.18,
        ease: 'power2.out',
      });
    };

    const resetGlow = () => {
      gridElement.querySelectorAll<HTMLElement>('.magic-bento-card').forEach((card) => {
        card.style.setProperty('--glow-intensity', '0');
      });

      gsap.to(spotlightElement, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out',
      });
    };

    gridElement.addEventListener('mousemove', updateGlow);
    gridElement.addEventListener('mouseleave', resetGlow);

    return () => {
      gridElement.removeEventListener('mousemove', updateGlow);
      gridElement.removeEventListener('mouseleave', resetGlow);
    };
  }, [enableSpotlight, shouldDisableAnimations, spotlightRadius]);

  if (posts.length === 0) {
    return (
      <div className={cn(
        'rounded-3xl border border-dashed px-8 py-20 text-center font-mono text-sm uppercase tracking-[0.24em]',
        theme === 'dark'
          ? 'border-white/10 bg-[#071121]/70 text-slate-500'
          : 'border-slate-200 bg-slate-50 text-slate-500'
      )}>
        No archive entries available.
      </div>
    );
  }

  return (
    <div className="magic-bento-shell relative">
      <style>{`
        .magic-bento-card {
          transform-style: preserve-3d;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.22);
        }

        .magic-bento-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(460px circle at var(--glow-x) var(--glow-y), rgba(${activeGlowColor}, calc(var(--glow-intensity) * 0.12)) 0%, transparent 58%);
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
          background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y), rgba(${activeGlowColor}, calc(var(--glow-intensity) * 0.95)) 0%, rgba(${activeGlowColor}, calc(var(--glow-intensity) * 0.25)) 35%, transparent 62%);
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

        /* Hover scanline on image area */
        .magic-bento-card .magic-bento-scanline {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(${activeGlowColor}, 0.06) 50%, transparent 100%);
          height: 35%;
          opacity: 0;
          transform: translateY(-100%);
          pointer-events: none;
          z-index: 1;
          transition: opacity 0.3s ease;
        }

        .magic-bento-card:hover .magic-bento-scanline {
          opacity: 1;
          animation: bento-scanline 2.2s linear infinite;
        }

        @keyframes bento-scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(380%); }
        }

        /* Image inner vignette */
        .magic-bento-vignette {
          position: absolute;
          inset: 0;
          box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.45);
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
      {enableSpotlight && !shouldDisableAnimations && (
        <div
          ref={spotlightRef}
          className="pointer-events-none absolute z-0 h-md w-md -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-3xl"
          style={{
            background: `radial-gradient(circle, rgba(${activeGlowColor}, 0.18) 0%, rgba(${activeGlowColor}, 0.08) 24%, rgba(${activeGlowColor}, 0.03) 42%, transparent 68%)`,
          }}
        />
      )}

      <div ref={gridRef} className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post, index) => (
          <BentoCard
            key={post.slug}
            post={post}
            index={index}
            theme={theme === 'dark' ? 'dark' : 'light'}
            textAutoHide={textAutoHide}
            shouldDisableAnimations={shouldDisableAnimations}
            enableTilt={enableTilt}
            enableMagnetism={enableMagnetism}
            clickEffect={clickEffect}
            enableBorderGlow={enableBorderGlow}
            particleCount={particleCount}
            glowColor={activeGlowColor}
          />
        ))}
      </div>

    </div>
  );
};

export default MagicBentoBlogGrid;