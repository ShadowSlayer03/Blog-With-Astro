import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

export default function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pagefindRef = useRef<any>(null);

  // Load Pagefind on first open
  const loadPagefind = useCallback(async () => {
    if (pagefindRef.current) return;
    try {
      // Build the path dynamically so Vite cannot statically analyze it
      const pagefindPath = `/${['pagefind', 'pagefind.js'].join('/')}`;
      pagefindRef.current = await import(/* @vite-ignore */ pagefindPath);
      await pagefindRef.current.init();
    } catch {
      console.warn('Pagefind not available. Run `bun run build` first to generate the search index.');
    }
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      loadPagefind();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen, loadPagefind]);

  // Search
  useEffect(() => {
    if (!query.trim() || !pagefindRef.current) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const search = await pagefindRef.current.search(query);
        const data = await Promise.all(
          search.results.slice(0, 8).map((r: any) => r.data())
        );
        setResults(
          data.map((item: any) => ({
            url: item.url,
            title: item.meta?.title || 'Untitled',
            excerpt: item.excerpt || '',
          }))
        );
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-200/80 bg-gray-50/50 px-3 py-1.5 text-sm text-gray-400 transition-all hover:border-gray-300 hover:bg-gray-100 hover:text-gray-600 dark:border-white/5 dark:bg-white/5 dark:text-gray-500 dark:hover:border-white/10 dark:hover:bg-white/10 dark:hover:text-gray-300"
        aria-label="Search articles"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-400 dark:border-white/10 dark:bg-white/5 sm:inline">
          ⌘K
        </kbd>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-100 flex items-start justify-center bg-black/50 pt-[15vh] backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="mx-4 w-full max-w-xl overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 shadow-2xl shadow-gray-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/95 dark:shadow-black/30">
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 dark:border-white/5">
              <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-transparent py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {isLoading && (
                <div className="px-4 py-8 text-center text-sm text-gray-500">Searching...</div>
              )}

              {!isLoading && query && results.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No results for "{query}"
                </div>
              )}

              {!isLoading && results.length > 0 && (
                <ul>
                  {results.map((result, i) => (
                    <li key={i}>
                      <a
                        href={result.url}
                        className="block rounded-lg px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsOpen(false)}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {result.title}
                        </p>
                        <p
                          className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400"
                          dangerouslySetInnerHTML={{ __html: result.excerpt }}
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {!query && (
                <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  Type to search through all articles
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-2.5 dark:border-white/5">
              <p className="text-[11px] text-gray-400 dark:text-gray-600">
                Powered by <span className="font-semibold">Pagefind</span> &middot; Local search, zero tracking
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
