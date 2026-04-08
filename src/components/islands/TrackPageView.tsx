import { useEffect, useRef } from "react";

type TrackPageViewProps = {
    slug: string;
    readingTime: number;
}

const MIN_ENGAGEMENT_SECONDS = 30;

const TrackPageView = ({ slug }: TrackPageViewProps) => {
    const activeSecondsRef = useRef(0);
    const hasFiredRef = useRef(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isVisibleRef = useRef(true);

    useEffect(() => {
        const sessionKey = `viewed:${slug}`;
        if (sessionStorage.getItem(sessionKey)) return;

        intervalRef.current = setInterval(() => {
            if (isVisibleRef.current) {
                activeSecondsRef.current += 1;
            }
        }, 1000);

        const sendView = () => {
            if (hasFiredRef.current) return;
            if (activeSecondsRef.current < MIN_ENGAGEMENT_SECONDS) return;

            hasFiredRef.current = true;
            sessionStorage.setItem(sessionKey, "true");

            const payload = JSON.stringify({ timeSpent: activeSecondsRef.current });
            const blob = new Blob([payload], { type: "application/json" });

            // sendBeacon always sends POST and includes the Origin header
            const sent = navigator.sendBeacon(`/api/views/${slug}`, blob);

            if (!sent) {
                fetch(`/api/views/${slug}`, {
                    method: "PUT",
                    body: payload,
                    headers: { "Content-Type": "application/json" },
                    keepalive: true,
                }).catch(() => { });
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                isVisibleRef.current = false;
                sendView();
            } else {
                isVisibleRef.current = true;
            }
        };

        const handleBeforeUnload = () => sendView();

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            sendView(); // Fire on unmount (SPA navigation) if threshold met
        };
    }, [slug]);

    return null;
}

export default TrackPageView;