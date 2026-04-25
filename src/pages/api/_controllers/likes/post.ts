import type { APIContext } from "astro";
import { likes } from "../../../../db/schema";
import { getDb } from "../../../../db/client";

const findValuesToInsert = (existingLikesData: any[], postSlugs: string[]) => {
    const existingSlugs = existingLikesData.map((data) => data.post_slug);
    return postSlugs.filter((slug) => !existingSlugs.includes(slug)).map((slug) => ({
        id: crypto.randomUUID(),
        post_slug: slug,
        count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }));
}

const postLikes = async ({ request }: APIContext) => {
    try {
        const { postSlugs } = await request.json();

        if (!postSlugs || postSlugs.length === 0) {
            return new Response(JSON.stringify({ message: "Post slugs are required!" }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const db = getDb();

        const likeData = await db.select().from(likes);

        const valuesToInsert = findValuesToInsert(likeData, postSlugs);

        if (valuesToInsert.length === 0) {
            return new Response(JSON.stringify({ message: "Like data already exists for all the blog posts." }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const newLikeData = await db.insert(likes).values(valuesToInsert).returning();

        return new Response(JSON.stringify({ message: "New like data created successfully.", newLikeData }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            }
        });

    } catch (error) {
        console.error("Error occurred while creating like data:", error);
        return new Response(JSON.stringify({ message: "An error occurred while creating like data for this post.", error: error instanceof Error ? error.message : String(error) }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }
}


export default postLikes;