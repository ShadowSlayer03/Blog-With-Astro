import { useState, useEffect } from 'react';

interface Props {
  slug: string;
}

export default function LikeButton({ slug }: Props) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`likes:${slug}`);
    if (stored) {
      const data = JSON.parse(stored);
      setLikes(data.count);
      setHasLiked(data.liked);
    }
  }, [slug]);

  const handleLike = () => {
    if (hasLiked) return;

    const newCount = likes + 1;
    setLikes(newCount);
    setHasLiked(true);
    setIsAnimating(true);

    localStorage.setItem(`likes:${slug}`, JSON.stringify({ count: newCount, liked: true }));

    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <button
      onClick={handleLike}
      disabled={hasLiked}
      className={`group inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        hasLiked
          ? 'border-pink-200/60 bg-pink-50 text-pink-600 dark:border-pink-500/20 dark:bg-pink-500/10 dark:text-pink-400'
          : 'border-gray-200/80 bg-white text-gray-500 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 dark:border-white/5 dark:bg-white/5 dark:text-gray-400 dark:hover:border-pink-500/20 dark:hover:bg-pink-500/10 dark:hover:text-pink-400'
      }`}
      aria-label={hasLiked ? `Liked (${likes})` : 'Like this article'}
    >
      <span
        className={`inline-block transition-transform ${
          isAnimating ? 'scale-125' : ''
        }`}
      >
        {hasLiked ? '❤️' : '🤍'}
      </span>
      <span>{likes > 0 ? likes : 'Like'}</span>
    </button>
  );
}
