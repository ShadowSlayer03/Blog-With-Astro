import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";

const SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
}

export const onRequest = defineMiddleware(async (context, next) => {
    const url = new URL(context.request.url);

    const isKeystaticRoute = url.pathname.startsWith("/keystatic");

    if (isKeystaticRoute) {
        return next()
    }

    if (url.pathname.startsWith("/api/")) {

        if (url.pathname.startsWith("/api/og/")) {
            return next();
        }

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
    }

    const response = await next();
    const newResponse = new Response(response.body, response);

    const headers = {
        ...SECURITY_HEADERS,
        ...(!isKeystaticRoute && { "X-Frame-Options": "DENY" }),
    }

    Object.entries(headers).forEach(([key, value]) => {
        newResponse.headers.set(key, value);
    });

    return newResponse;
});