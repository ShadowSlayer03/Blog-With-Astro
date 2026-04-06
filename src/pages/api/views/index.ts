import type { APIContext, APIRoute } from "astro";
import postViews from "../_controllers/views/post";

export const POST: APIRoute = (context: APIContext) => postViews(context);