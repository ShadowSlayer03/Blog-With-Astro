import { useEffect, useState } from "react";

const useTheme = () => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
    const syncTheme = () => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    });

    return () => observer.disconnect();
}, []);

    return theme;
}

export default useTheme;