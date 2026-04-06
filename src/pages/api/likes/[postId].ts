import type { APIContext, APIRoute } from "astro";
import getLikes from "../_controllers/likes/get";
import putLikes from "../_controllers/likes/put";

export const GET: APIRoute =  (context: APIContext) => getLikes(context);

export const PUT: APIRoute = (context: APIContext) => putLikes(context);