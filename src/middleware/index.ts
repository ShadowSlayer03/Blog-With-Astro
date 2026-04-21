import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";

export const onRequest = defineMiddleware((context, next) => {
    const url = new URL(context.request.url);

    if (!url.pathname.startsWith("/api/")) return next();

    const apiKey = context.request.headers.get("x-api-key");
    if (apiKey) {
        if (!env.API_KEY || apiKey !== env.API_KEY) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
        }
        return next();
    }

    const origin = context.request.headers.get("origin");
    const referer = context.request.headers.get("referer");
    const siteOrigin = url.origin;

    const fromSameSite =
        (origin && origin === siteOrigin) ||
        (referer && new URL(referer).origin === siteOrigin);

    if (!fromSameSite) {
        return new Response(JSON.stringify({ message: "Access to this API is Forbidden!" }), { status: 403 });
    }

    return next();
});