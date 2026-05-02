import type { APIContext } from "astro";
import { likes } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../db/client";

const getLikes = async ({ params }: APIContext) => {
    try {
        const { postId } = params;

        if (!postId) {
            return new Response(JSON.stringify({ message: "Post ID is required!" }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const db = getDb();

        const likeData = await db.select().from(likes).where(eq(likes.post_slug, postId));

        if (!likeData || likeData.length === 0) {
            return new Response(JSON.stringify({ message: "No likes found for this post.", postId }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        }

        return new Response(JSON.stringify({ message: `Likes retrieved for this post: ${postId}`, likes: likeData }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error("Error occurred while retrieving like data:", error);
        return new Response(JSON.stringify({ message: "An error occurred while retrieving like data for this post.", error: error instanceof Error ? error.message : String(error) }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }
}

export default getLikes;