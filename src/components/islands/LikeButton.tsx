import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
  slug: string;
}

export default function LikeButton({ slug }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch(`/api/likes/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch likes');
        return res.json();
      })
      .then(data => {
        if (mounted) {
          setCount(data?.likes?.[0]?.count ?? 0);
        }
      })
      .catch(() => {
        if (mounted) setCount(0);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  // Local storage check
  useEffect(() => {
    const alreadyLiked = localStorage.getItem(`liked:${slug}`) === 'true';
    setHasLiked(alreadyLiked);
  }, [slug]);

  const handleLike = async () => {
    if (hasLiked || isPending || count === null) return;

    setIsPending(true);
    setCount(prev => (prev ?? 0) + 1);
    localStorage.setItem(`liked:${slug}`, 'true');
    setHasLiked(true);

    try {
      const res = await fetch(`/api/likes/${slug}`, { method: 'PUT' });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Request failed (${res.status})`);
      }

      const data = await res.json();
      const newCount = data.updatedLikeData?.[0]?.count;

      setCount(newCount ?? count + 1);
      toast.success('Thanks for the like! ❤️');
    } catch (error: any) {
      setCount(prev => (prev !== null ? Math.max(0, prev - 1) : 0));
      setHasLiked(false);
      localStorage.removeItem(`liked:${slug}`);
      toast.error(error.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={hasLiked || isPending}
      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] transition-all duration-200 ${
        hasLiked
          ? 'border-pink-500/25 bg-pink-500/12 text-pink-300'
          : 'border-white/8 bg-[#08111f]/90 text-slate-300 hover:border-cyan-400/25 hover:bg-[#0d1727] hover:text-white'
      }`}
      aria-label={hasLiked ? `Liked (${count})` : 'Like this article'}
    >
      <svg
        className={`h-3.5 w-3.5 transition-transform ${
          isPending ? 'scale-125' : ''
        }`}
        fill={hasLiked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.435 6.582a5.94 5.94 0 00-8.403 0L12 7.614l-1.032-1.032a5.94 5.94 0 10-8.403 8.403L12 24l9.435-9.015a5.94 5.94 0 000-8.403z"
        />
      </svg>
      <span>{count === null ? '…' : count > 0 ? count : 'Like'}</span>
    </button>
  );
}