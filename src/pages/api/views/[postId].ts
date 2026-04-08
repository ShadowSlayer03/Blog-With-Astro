import type { APIContext, APIRoute } from "astro";
import getViews from "../_controllers/views/get";
import putViews from "../_controllers/views/put";

export const GET: APIRoute = (context: APIContext) => getViews(context);

// POST handler since sendBeacon always sends POST
export const POST: APIRoute = (context: APIContext) => putViews(context);