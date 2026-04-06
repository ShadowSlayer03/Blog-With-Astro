import type { APIContext } from "astro";
import { eq, sql } from "drizzle-orm";
import { views } from "../../../../db/schema";
import { db } from "../../../../db/client";

const putViews = async ({ params }: APIContext) => {
    try {
        const { postId } = params;

        if (!postId) {
            return new Response(JSON.stringify({ message: "Post ID is required!" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const updatedViewData = await db.update(views)
            .set({
                count: sql`${views.count} + 1`,
                updated_at: new Date().toISOString(),
            })
            .where(eq(views.post_slug, postId))
            .returning();

        if (!updatedViewData || updatedViewData.length === 0) {
            return new Response(JSON.stringify({ message: "No view data found for this post to update.", postId }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        }

        return new Response(JSON.stringify({ message: "View data updated successfully.", updatedViewData }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error("Error occurred while updating view count:", error);
        return new Response(JSON.stringify({ message: "An error occurred while updating view count for this post.", error: error instanceof Error ? error.message : String(error) }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }
}

export default putViews;