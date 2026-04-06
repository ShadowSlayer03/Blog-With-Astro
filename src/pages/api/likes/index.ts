import type { APIContext, APIRoute } from "astro";
import postLikes from "../_controllers/likes/post";

export const POST: APIRoute = (context: APIContext) => postLikes(context);