import { useEffect, useRef } from "react";
import { toast } from "sonner";
import queryClient from "../../lib/queryClient";
import { useMutation } from "@tanstack/react-query";

type TrackPageViewProps = {
    slug: string;
    readingTime: number;
}

const TrackPageView = ({ slug, readingTime }: TrackPageViewProps) => {
    const activeSecondsRef = useRef(0);
    const hasFiredRef = useRef(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isVisibleRef = useRef(true);

    const sessionKey = `viewed:${slug}`;

    const { mutate } = useMutation({
        mutationKey: ["recordViews", slug],
        mutationFn: async () => {
            const res = await fetch(`/api/views/${slug}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ timeSpent: activeSecondsRef.current, readingTime }),
            });

            if (!res.ok) {
                throw new Error(`Failed to update page view for blog ${slug}`);
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("New view recorded!");
            queryClient.invalidateQueries({ queryKey: ["views", slug] });
        },
        onError: (error) => {
            toast.error(`Failed to update page view for blog ${slug}: ${(error as Error).message}`);
        }
    });

    const recordViewViaBeacon = () => {
        if (hasFiredRef.current) return;
        if (activeSecondsRef.current < readingTime * 60) return;

        hasFiredRef.current = true;
        sessionStorage.setItem(sessionKey, "true");

        const payload = JSON.stringify({ timeSpent: activeSecondsRef.current, readingTime });
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(`/api/views/${slug}`, blob);
    };

    const recordViewViaFetch = async () => {
        if (hasFiredRef.current) return;
        if (activeSecondsRef.current < readingTime * 60) return;

        hasFiredRef.current = true;
        sessionStorage.setItem(sessionKey, "true");

        mutate();
    };

    const handleVisibilityChange = () => {
        if (document.hidden) {
            isVisibleRef.current = false;
        } else {
            isVisibleRef.current = true;
        }
    };

    useEffect(() => {
        if (sessionStorage.getItem(sessionKey)) return;

        intervalRef.current = setInterval(() => {
            if (isVisibleRef.current) {
                activeSecondsRef.current += 1;

                if (!hasFiredRef.current && activeSecondsRef.current >= readingTime * 60) {
                    recordViewViaFetch();
                }
            }
        }, 1000);

        const handleBeforeUnload = () => recordViewViaBeacon();

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            recordViewViaBeacon();
        };
    }, [slug]);

    return null;
}

export default TrackPageView;