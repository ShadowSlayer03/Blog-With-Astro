import { useState, useEffect } from 'react';
import Giscus from '@giscus/react';

export default function GiscusComments() {
  const [theme, setTheme] = useState<'catppuccin_mocha' | 'light'>('light');

  useEffect(() => {
    const getTheme = () =>
      document.documentElement.classList.contains('dark') ? 'catppuccin_mocha' : 'light';

    setTheme(getTheme());

    const observer = new MutationObserver(() => setTheme(getTheme()));

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Comments
      </h2>
      <Giscus
        repo="ShadowSlayer03/Blog-With-Astro"
        repoId="R_kgDORwsoqw"
        category="Announcements"
        categoryId="DIC_kwDORwsoq84C588i"
        mapping="pathname"
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme}
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
