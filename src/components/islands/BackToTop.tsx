import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/80 bg-white/95 text-gray-500 shadow-lg shadow-gray-200/50 backdrop-blur-sm transition-all hover:border-gray-300 hover:bg-white hover:text-indigo-600 hover:shadow-xl dark:border-white/10 dark:bg-gray-900/95 dark:text-gray-400 dark:shadow-none dark:hover:border-white/20 dark:hover:text-indigo-400"
      aria-label="Scroll to top"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
      </svg>
    </button>
  );
}
