import { useState, useEffect } from 'react';
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from 'sonner';
import QueryClientWrapper from './QueryClientWrapper';

interface Props {
  slug: string;
}

function LikeButtonInner({ slug }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const [hasLiked, setHasLiked] = useState(false);

  const { data: fetchedLikes } = useQuery({
    queryKey: ['likes', slug],
    queryFn: async () => {
      const res = await fetch(`/api/likes/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch likes');
      const data = await res.json();
      return (data?.likes?.[0]?.count ?? 0) as number;
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/likes/${slug}`, { method: 'PUT' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? `Request failed (${res.status})`);
      }
      const data = await res.json();
      return data.updatedLikeData?.[0]?.count as number;
    },
    onSuccess: (newCount) => {
      setCount(newCount ?? (count ?? 0) + 1);
      toast.success('Thanks for the like! ❤️');
    },
    onError: (error: Error) => {
      setCount(prev => (prev !== null ? Math.max(0, prev - 1) : 0));
      setHasLiked(false);
      localStorage.removeItem(`liked:${slug}`);
      toast.error(error.message);
    }
  });

  useEffect(() => {
    if (fetchedLikes !== undefined) setCount(fetchedLikes);
  }, [fetchedLikes]);

  useEffect(() => {
    const alreadyLiked = localStorage.getItem(`liked:${slug}`) === 'true';
    setHasLiked(alreadyLiked);
  }, [slug]);

  const handleLike = () => {
    if (hasLiked || isPending || count === null) return;

    setCount(prev => (prev ?? 0) + 1);

    localStorage.setItem(`liked:${slug}`, 'true');
    setHasLiked(true);

    mutate();
  };

  return (
    <button
      onClick={handleLike}
      disabled={hasLiked || isPending}
      className={`group inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${hasLiked
        ? 'border-pink-200/60 bg-pink-50 text-pink-600 dark:border-pink-500/20 dark:bg-pink-500/10 dark:text-pink-400'
        : 'border-gray-200/80 bg-white text-gray-500 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 dark:border-white/5 dark:bg-white/5 dark:text-gray-400 dark:hover:border-pink-500/20 dark:hover:bg-pink-500/10 dark:hover:text-pink-400'
        }`}
      aria-label={hasLiked ? `Liked (${count})` : 'Like this article'}
    >
      <span
        className={`inline-block transition-transform ${isPending ? 'scale-125' : ''
          }`}
      >
        {hasLiked ? '❤️' : '🤍'}
      </span>
      <span>{count === null ? '…' : count > 0 ? count : 'Like'}</span>
    </button>
  );
}

export default function LikeButton({ slug }: Props) {
  return (
    <QueryClientWrapper>
      <LikeButtonInner slug={slug} />
    </QueryClientWrapper>
  );
}