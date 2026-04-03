import { useState, useEffect } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const article = document.querySelector('article');
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
    <nav className="hidden xl:block">
      <div className="fixed top-28 right-8 w-56">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
          On this page
        </p>
        <ul className="space-y-0.5 border-l border-gray-200 dark:border-white/5">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`block border-l-2 -ml-px py-1.5 text-[13px] leading-snug transition-all duration-200 ${
                  heading.level === 3 ? 'pl-6' : 'pl-3'
                } ${
                  activeId === heading.id
                    ? 'border-indigo-500 font-medium text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:text-gray-600 dark:hover:border-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
