import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(({ request }, next) => {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname.startsWith("/api/")) {
        const validApiKey = import.meta.env.API_KEY;

        if (!validApiKey) {
            console.error("API_KEY is not defined in environment variables.");
            return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
        }

        // Accept API key from header or query param (sendBeacon can't set headers)
        const xApiKey = request.headers.get('x-api-key') || url.searchParams.get('key');

        if (!xApiKey || xApiKey !== validApiKey) {
            console.warn("Unauthorized request. Missing or invalid API key.");
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }
    }

    return next();
});

