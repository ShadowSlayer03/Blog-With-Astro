#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# Resolve content-type from extension so the CDN serves images correctly.
# Without this, files are served as application/octet-stream.
# ---------------------------------------------------------------------------
get_content_type() {
  case "${1##*.}" in
    jpg|jpeg) echo "image/jpeg" ;;
    png)      echo "image/png"  ;;
    gif)      echo "image/gif"  ;;
    webp)     echo "image/webp" ;;
    avif)     echo "image/avif" ;;
    *)        echo "application/octet-stream" ;;
  esac
}

escape_sed_pattern() {
  printf '%s' "$1" | sed 's/[][\\/.^$*+?(){}|]/\\&/g'
}

escape_sed_replacement() {
  printf '%s' "$1" | sed 's/[&|\\]/\\&/g'
}

# ---------------------------------------------------------------------------
# Find images added/modified in this push.
# ---------------------------------------------------------------------------
CHANGED=$(git diff --name-only --diff-filter=AM HEAD~1 HEAD \
  | grep '^public/images/blog/' || true)

if [ -z "$CHANGED" ]; then
  echo "No new blog images in this push. Skipping."
  exit 0
fi

# ---------------------------------------------------------------------------
# For each changed image: upload → replace URL in markdown → delete local file
# Using `while read` instead of `for` to safely handle filenames with spaces.
# ---------------------------------------------------------------------------
while IFS= read -r FILE; do
  # FILE           = public/images/blog/my-post/hero.jpg
  # PUBLIC_PATH    = /images/blog/my-post/hero.jpg   ← what Keystatic writes into frontmatter
  # R2_KEY         = images/blog/my-post/hero.jpg    ← R2 object key (no leading slash)
  # CDN_URL        = https://cdn.example.com/images/blog/my-post/hero.jpg
  PUBLIC_PATH="${FILE#public}"
  R2_KEY="${PUBLIC_PATH#/}"
  CDN_URL="${CDN_BASE_URL}/${R2_KEY}"
  CONTENT_TYPE=$(get_content_type "$FILE")
  SED_PUBLIC_PATH=$(escape_sed_pattern "$PUBLIC_PATH")
  SED_CDN_URL=$(escape_sed_replacement "$CDN_URL")

  echo "→ Uploading: $FILE"
  wrangler r2 object put "${R2_BUCKET_NAME}/${R2_KEY}" \
    --file "$FILE" \
    --content-type "$CONTENT_TYPE"

  echo "→ Verifying remote upload: ${R2_BUCKET_NAME}/${R2_KEY}"
  wrangler r2 object get "${R2_BUCKET_NAME}/${R2_KEY}" --remote --pipe > /dev/null

  echo "→ Replacing '$PUBLIC_PATH' with '$CDN_URL' in markdown"
  grep -rlF -- "$PUBLIC_PATH" src/content/blog/ | while IFS= read -r MD_FILE; do
    sed -i "s|${SED_PUBLIC_PATH}|${SED_CDN_URL}|g" "$MD_FILE"
  done

  echo "→ Removing local file: $FILE"
  rm "$FILE"
done <<< "$CHANGED"

# ---------------------------------------------------------------------------
# Commit the changed markdown files + deleted images back to main.
# [skip ci] is a secondary infinite-loop guard in case the `if:` condition
# above ever fails (e.g. different GH Actions runner behaviour).
# ---------------------------------------------------------------------------
git config user.name  "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"
git add -A

if git diff --staged --quiet; then
  echo "Nothing to commit."
else
  git commit -m "chore: Migrate blog images to R2 CDN [skip ci]"
  git push
fi