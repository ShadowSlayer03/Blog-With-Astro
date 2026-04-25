import type { APIContext } from "astro";
import { db } from "../../../../db/client";
import { views } from "../../../../db/schema";
import { eq } from "drizzle-orm";

async function getViews({ params }: APIContext) {
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

        const viewData = await db.select().from(views).where(eq(views.post_slug, postId));

        if (!viewData || viewData.length === 0) {
            return new Response(JSON.stringify({ message: "No views found for this post.", postId }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }

        return new Response(JSON.stringify({ message: `Views retrieved for this post: ${postId}`, views: viewData }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error("Error occurred while retrieving view data:", error);
        return new Response(JSON.stringify({ message: "An error occurred while retrieving view data for this post.", error: error instanceof Error ? error : String(error) }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }
}

export default getViews;