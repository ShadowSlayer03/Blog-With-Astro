import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  slug: string;
}

export default function ViewCount({ slug }: Props) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch(`/api/views/${slug}`)
      .then((res) => {
        if (!res.ok) {
          toast.error(`Failed to fetch view count for slug: ${slug}`);
          throw new Error("Failed to fetch");
        }
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setCount(data?.views?.[0]?.count ?? 0);
        }
      })
      .catch(() => {
        if (mounted) setCount(0);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (count === null) {
    return (
      <span className="flex items-center gap-1.5 animate-pulse">
        <span className="h-3 w-8 rounded bg-gray-200 dark:bg-slate-700" />
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      <svg
        className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      {count} {count === 1 ? "view" : "views"}
    </span>
  );
}