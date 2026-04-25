import type { APIContext } from "astro";
import { likes } from "../../../../db/schema";
import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db/client";

const putLikes = async ({ params, locals }: APIContext) => {
    try {
        const { postId } = params;

        if (!postId) {
            return new Response(JSON.stringify({ message: "Post ID is required!" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const db = getDb(locals);

        const updatedLikeData = await db.update(likes)
            .set({
                count: sql`${likes.count} + 1`,
                updated_at: new Date().toISOString(),
            })
            .where(eq(likes.post_slug, postId))
            .returning();

        if (!updatedLikeData || updatedLikeData.length === 0) {
            return new Response(JSON.stringify({ message: "No like data found for this post to update.", postId }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        }

        return new Response(JSON.stringify({ message: "Like data updated successfully.", updatedLikeData }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error("Error while updating like count:", error);
        return new Response(JSON.stringify({ message: "An error occurred while updating like count.", error: error instanceof Error ? error.message : String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export default putLikes;