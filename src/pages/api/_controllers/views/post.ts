import type { APIContext } from "astro";
import { views } from "../../../../db/schema";
import { getDb } from "../../../../db/client";

const findValuesToInsert = (existingViewsData: any[], postSlugs: string[]) => {
    const existingSlugs = existingViewsData.map((data) => data.post_slug);
    return postSlugs.filter((slug) => !existingSlugs.includes(slug)).map((slug) => ({
        id: crypto.randomUUID(),
        post_slug: slug,
        count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }));
}

const postViews = async ({ request, locals }: APIContext) => {
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

        const viewData = await db.select().from(views);

        const valuesToInsert = findValuesToInsert(viewData, postSlugs);

        if (valuesToInsert.length === 0) {
            return new Response(JSON.stringify({ message: "View data already exists for all the blog posts." }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const newViewData = await db.insert(views).values(valuesToInsert).returning();

        return new Response(JSON.stringify({ message: "New view data created successfully.", newViewData }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            }
        });

    } catch (error) {
        console.error("Error occurred while creating view data:", error);
        return new Response(JSON.stringify({ message: "An error occurred while creating view data for this post.", error: error instanceof Error ? error.message : String(error) }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }
}

export default postViews;