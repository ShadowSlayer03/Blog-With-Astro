import { useEffect, useRef, useState } from "react";

export default function ScrollUI() {
    const [isVisible, setIsVisible] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight =
                document.documentElement.scrollHeight -
                document.documentElement.clientHeight;

            const scrollPercent =
                scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

            if (barRef.current) {
                barRef.current.style.width = `${scrollPercent}%`;
            }

            setIsVisible(scrollTop > 400);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // initialize once

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <>
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 z-60 h-0.5 w-full">
                <div
                    ref={barRef}
                    className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 transition-[width] duration-75 ease-out"
                    style={{ width: "0%" }}
                />
            </div>

            {/* Back To Top */}
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/80 bg-white/95 text-gray-500 shadow-lg shadow-gray-200/50 backdrop-blur-sm transition-all hover:border-gray-300 hover:bg-white hover:text-indigo-600 hover:shadow-xl dark:border-white/10 dark:bg-gray-900/95 dark:text-gray-400 dark:shadow-none dark:hover:border-white/20 dark:hover:text-indigo-400"
                    aria-label="Scroll to top"
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                        />
                    </svg>
                </button>
            )}
        </>
    );
}