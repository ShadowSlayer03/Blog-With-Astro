import { useState, useEffect } from 'react';

interface Props {
  slug: string;
}

export default function LikeButton({ slug }: Props) {
  const [count, setCount] = useState<number | null>(null); // null = loading
  const [hasLiked, setHasLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const alreadyLiked = localStorage.getItem(`liked:${slug}`) === 'true';
    setHasLiked(alreadyLiked);

    fetch(`/api/likes/${slug}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setCount(data?.likes?.[0]?.count ?? 0))
      .catch(() => setCount(0));
  }, [slug]);

  const handleLike = async () => {
    if (hasLiked || isLoading || count === null) return;

    setCount(prev => (prev ?? 0) + 1);
    setHasLiked(true);
    setIsAnimating(true);
    setIsLoading(true);
    localStorage.setItem(`liked:${slug}`, 'true');

    try {
      const res = await fetch(`/api/likes/${slug}`, { method: 'PUT' });

      if (!res.ok) {
        setCount(prev => Math.max(0, (prev ?? 1) - 1));
        setHasLiked(false);
        localStorage.removeItem(`liked:${slug}`);
      } else {
        const data = await res.json();
        setCount(data.updatedLikeData?.[0]?.count ?? count + 1);
      }
    } catch {
      setCount(prev => Math.max(0, (prev ?? 1) - 1));
      setHasLiked(false);
      localStorage.removeItem(`liked:${slug}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={hasLiked || isLoading}
      className={`group inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        hasLiked
          ? 'border-pink-200/60 bg-pink-50 text-pink-600 dark:border-pink-500/20 dark:bg-pink-500/10 dark:text-pink-400'
          : 'border-gray-200/80 bg-white text-gray-500 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 dark:border-white/5 dark:bg-white/5 dark:text-gray-400 dark:hover:border-pink-500/20 dark:hover:bg-pink-500/10 dark:hover:text-pink-400'
      }`}
      aria-label={hasLiked ? `Liked (${count})` : 'Like this article'}
    >
      <span
        className={`inline-block transition-transform ${
          isAnimating ? 'scale-125' : ''
        }`}
      >
        {hasLiked ? '❤️' : '🤍'}
      </span>
      <span>{count === null ? '…' : count > 0 ? count : 'Like'}</span>
    </button>
  );
}
