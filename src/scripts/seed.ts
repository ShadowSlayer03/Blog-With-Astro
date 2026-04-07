import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

function getBlogSlugs(): string[] {
    const blogDir = path.resolve(process.cwd(), "src/content/blog");

    return fs
        .readdirSync(blogDir)
        .filter((file) =>
            file.endsWith(".md") ||
            file.endsWith(".mdx")
        )
        .map((file) => path.basename(file, path.extname(file)))
}

async function main() {
    try {
        const localBlogSlugs = getBlogSlugs();

        if(!process.env.API_BASE_URL) {
            console.error("API_BASE_URL is not defined in environment variables.");
            return;
        }

        const updateLikesResponse = await fetch(`${process.env.API_BASE_URL}/api/likes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ postSlugs: localBlogSlugs}),
        });

        const updateViewsResponse = await fetch(`${process.env.API_BASE_URL}/api/views`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ postSlugs: localBlogSlugs}),
        });

        console.log("API response - Likes", await updateLikesResponse.text());
        console.log("API response - Views", await updateViewsResponse.text());

        const likesResponseData = await updateLikesResponse.json();

        const viewsResponseData = await updateViewsResponse.json();

        if (updateLikesResponse.ok) {
            console.log("Likes update response:", likesResponseData);
        } else {
            console.error("Failed to update likes data. Status:", updateLikesResponse.status, "Message:", likesResponseData.message);
        }

        if (updateViewsResponse.ok) {
            console.log("Views update response:", viewsResponseData);
        } else {
            console.error("Failed to update views data. Status:", updateViewsResponse.status, "Message:", viewsResponseData.message);
        }

    } catch (error) {
        console.error("Error occurred in main fn while checking DB for likes and views data for all blog posts:", error);
    }
}

main();
