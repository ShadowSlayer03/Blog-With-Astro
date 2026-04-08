import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(({ request }, next) => {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/")) return next();

    // Server-to-server calls (seed script, CI): validate secret API key
    const apiKey = request.headers.get("x-api-key");
    if (apiKey) {
        const validKey = import.meta.env.API_KEY;
        if (!validKey || apiKey !== validKey) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }
        return next();
    }

    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const siteOrigin = url.origin;

    const fromSameSite =
        (origin && origin === siteOrigin) ||
        (referer && new URL(referer).origin === siteOrigin);

    if (!fromSameSite) {
        return new Response(JSON.stringify({ message: "Access to this API is Forbidden!" }), { status: 403 });
    }

    return next();
});

