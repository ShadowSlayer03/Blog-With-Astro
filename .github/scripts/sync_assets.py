import os
import re
import subprocess
from pathlib import Path

BLOG_CONTENT_DIR = Path("src/content/blog")
PUBLIC_IMAGE_DIR = Path("public/images/blog")

R2_BUCKET_NAME = os.environ["R2_BUCKET_NAME"]
CDN_BASE_URL = os.environ["CDN_BASE_URL"]

MEDIA_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".avif",
    ".svg",
    ".mp4",
    ".webm",
    ".mov",
}

VIDEO_EXTENSIONS = {
    ".mp4",
    ".webm",
    ".mov",
}


def get_content_type(path: Path) -> str:
    ext = path.suffix.lower()

    return {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".avif": "image/avif",
        ".svg": "image/svg+xml",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mov": "video/quicktime",
    }.get(ext, "application/octet-stream")


def upload_to_r2(file_path: Path, r2_key: str):
    content_type = get_content_type(file_path)

    print(f"Uploading → {r2_key}")

    subprocess.run(
        [
            "wrangler",
            "r2",
            "object",
            "put",
            f"{R2_BUCKET_NAME}/{r2_key}",
            "--remote",
            "--file",
            str(file_path),
            "--content-type",
            content_type,
        ],
        check=True,
    )


# ============================================================================
# ONE-TIME SAFE MIGRATION
# markdown CDN image syntax -> HTML img tags
# ============================================================================

print("")
print("==================================================")
print("Migrating CDN markdown images → HTML")
print("==================================================")

markdown_files = list(BLOG_CONTENT_DIR.rglob("*.mdoc"))
markdown_files += list(BLOG_CONTENT_DIR.rglob("*.md"))
markdown_files += list(BLOG_CONTENT_DIR.rglob("*.mdx"))

cdn_markdown_pattern = re.compile(
    r'!\[([^\]]*)\]\((https://cdn\.[^)]+)\)'
)

for md_file in markdown_files:

    content = md_file.read_text()

    if not cdn_markdown_pattern.search(content):
        continue

    print(f"Migrating: {md_file}")

    def replace_cdn_markdown(match):
        alt = match.group(1)
        url = match.group(2)

        return (
            f'<img src="{url}" '
            f'alt="{alt}" '
            f'loading="lazy" '
            f'decoding="async" '
            f'class="rounded-xl border border-white/10 my-8 w-full" />'
        )

    updated = cdn_markdown_pattern.sub(
        replace_cdn_markdown,
        content,
    )

    md_file.write_text(updated)


# ============================================================================
# FIND LOCAL MEDIA
# ============================================================================

media_files = []

for root in [PUBLIC_IMAGE_DIR, BLOG_CONTENT_DIR]:

    if not root.exists():
        continue

    for file in root.rglob("*"):

        if not file.is_file():
            continue

        if file.suffix.lower() not in MEDIA_EXTENSIONS:
            continue

        if (
            "/content/" in str(file)
            or str(file).startswith("public/images/blog/")
        ):
            media_files.append(file)

print("")
print("==================================================")
print("Local media detected")
print("==================================================")

for media in media_files:
    print(media)

# ============================================================================
# PROCESS MEDIA
# ============================================================================

for file_path in media_files:

    print("")
    print("==================================================")
    print(f"Processing: {file_path}")
    print("==================================================")

    # =========================================================================
    # CASE 1
    # public/images/blog/*
    # =========================================================================

    if str(file_path).startswith("public/images/blog/"):

        public_path = "/" + str(file_path.relative_to("public")).replace("\\", "/")

        r2_key = public_path.lstrip("/")

        cdn_url = f"{CDN_BASE_URL}/{r2_key}"

        upload_to_r2(file_path, r2_key)

        print("Updating heroImage references safely...")

        for md_file in markdown_files:

            content = md_file.read_text()

            updated = content.replace(
                f"heroImage: {public_path}",
                f"heroImage: {cdn_url}",
            )

            if updated != content:
                md_file.write_text(updated)

    # =========================================================================
    # CASE 2
    # src/content/blog/<slug>/content/*
    # =========================================================================

    if "/content/" in str(file_path):

        parts = file_path.parts

        try:
            slug = parts[3]
        except IndexError:
            continue

        ext = file_path.suffix.lower()

        if ext in VIDEO_EXTENSIONS:
            r2_key = f"videos/blog/{slug}/{file_path.name}"
        else:
            r2_key = f"images/blog/{slug}/{file_path.name}"

        cdn_url = f"{CDN_BASE_URL}/{r2_key}"

        upload_to_r2(file_path, r2_key)

        md_file = BLOG_CONTENT_DIR / f"{slug}.mdoc"

        if not md_file.exists():
            continue

        print("Transforming local markdown asset syntax → CDN HTML")

        content = md_file.read_text()

        local_patterns = [
            rf'!\[([^\]]*)\]\(\./content/{re.escape(file_path.name)}\)',
            rf'!\[([^\]]*)\]\(content/{re.escape(file_path.name)}\)',
            rf'!\[([^\]]*)\]\({re.escape(file_path.name)}\)',
        ]

        updated = content

        for pattern in local_patterns:

            regex = re.compile(pattern)

            def replace_local(match):
                alt = match.group(1)

                if ext in VIDEO_EXTENSIONS:
                    return (
                        f'<video controls playsinline preload="metadata" '
                        f'class="w-full rounded-xl my-8">'
                        f'<source src="{cdn_url}" type="video/{ext[1:]}" />'
                        f'</video>'
                    )

                return (
                    f'<img src="{cdn_url}" '
                    f'alt="{alt}" '
                    f'loading="lazy" '
                    f'decoding="async" '
                    f'class="rounded-xl border border-white/10 my-8 w-full" />'
                )

            updated = regex.sub(replace_local, updated)

        if updated != content:
            md_file.write_text(updated)

# ============================================================================
# COMMIT CHANGES
# ============================================================================

subprocess.run(
    ["git", "config", "user.name", "github-actions[bot]"],
    check=True,
)

subprocess.run(
    [
        "git",
        "config",
        "user.email",
        "github-actions[bot]@users.noreply.github.com",
    ],
    check=True,
)

subprocess.run(["git", "add", "-A"], check=True)

diff = subprocess.run(
    ["git", "diff", "--staged", "--quiet"]
)

if diff.returncode == 0:
    print("Nothing to commit.")
    raise SystemExit(0)

subprocess.run(
    [
        "git",
        "commit",
        "-m",
        "chore: sync blog assets to R2 CDN [skip ci]",
    ],
    check=True,
)

subprocess.run(["git", "push"], check=True)