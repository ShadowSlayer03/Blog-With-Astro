import { useState, useEffect } from 'react';

interface Props {
  slug: string;
}

export default function PostStats({ slug }: Props) {
  const [likes, setLikes] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/likes/${slug}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setLikes(data?.likes?.[0]?.count ?? 0))
      .catch(() => setLikes(0));
  }, [slug]);

  if (likes === null) return null;

  return (
    <span className="flex items-center gap-1 font-mono text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-widest">
      <span>🤍</span>
      <span>{likes}</span>
    </span>
  );
}
