import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

function getBlogSlugs(): string[] {

    const projectRoot = process.cwd().endsWith("scripts")
        ? path.resolve(process.cwd(), "..", "..")
        : process.cwd();

    const blogDir = path.resolve(projectRoot, "src/content/blog");

    if (!fs.existsSync(blogDir)) {
        console.error(`❌ Blog directory not found at: ${blogDir}`);
        process.exit(1);
    }

    return fs
        .readdirSync(blogDir)
        .filter((file) =>
            file.endsWith(".mdoc") ||
            file.endsWith(".mdx")
        )
        .map((file) => path.basename(file, path.extname(file)))
}

async function main() {
    try {
        const localBlogSlugs = getBlogSlugs();

        if (!process.env.API_BASE_URL) {
            console.error("API_BASE_URL is not defined in environment variables.");
            return;
        }

        if (!process.env.API_KEY) {
            console.error("API_KEY is not defined in environment variables.");
            return;
        }

        const updateLikesResponse = await fetch(`${process.env.API_BASE_URL}/api/likes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.API_KEY,
            },
            body: JSON.stringify({ postSlugs: localBlogSlugs }),
        });

        const updateViewsResponse = await fetch(`${process.env.API_BASE_URL}/api/views`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.API_KEY,
            },
            body: JSON.stringify({ postSlugs: localBlogSlugs }),
        });

        // console.log("likes response:", await updateLikesResponse.text());
        // console.log("views response:", await updateViewsResponse.text());

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
