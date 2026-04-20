import { useState, useEffect } from 'react';
import useTheme from '../../lib/useTheme';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const theme = useTheme();

  useEffect(() => {
    const article = document.querySelector('#post-content');
    if (!article) return;

    const elements = article.querySelectorAll('h2, h3');
    const items: TOCItem[] = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent || '',
      level: el.tagName === 'H2' ? 2 : 3,
    }));
    setHeadings(items);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length < 2) return null;

  return (
    <nav className="sticky top-28">
      <div className="mb-6 flex items-center gap-2">
        <span className="block h-3 w-1 bg-cyan-400"></span>
        <span className={`font-mono text-[9px] font-bold uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-white' : 'text-accent-dark'}`}>ON THIS PAGE</span>
      </div>
      <ul className="space-y-3 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
        {headings.map((heading, idx) => {
          const numberPrefix = heading.level === 2 
            ? `${String(headings.filter((h, i) => i <= idx && h.level === 2).length).padStart(2, '0')}_`
            : '.._';
          
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`group flex items-start gap-1.5 transition-all duration-200 ${
                  heading.level === 3 ? 'ml-4' : ''
                } ${
                  activeId === heading.id
                    ? 'text-cyan-300'
                    : 'hover:text-slate-300'
                }`}
              >
                <span className={activeId === heading.id ? "text-cyan-500/50" : "text-slate-700/70 group-hover:text-slate-500 transition-colors"}>
                  {numberPrefix}
                </span>
                <span className="mt-0.5 leading-[1.4]">
                  {heading.text.replace(/\s+/g, '_')}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
