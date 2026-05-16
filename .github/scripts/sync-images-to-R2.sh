#!/usr/bin/env bash

set -euo pipefail

# ============================================================================
# CONFIG
# ============================================================================

BLOG_CONTENT_DIR="src/content/blog"
PUBLIC_IMAGE_DIR="public/images/blog"

# ============================================================================
# Helpers
# ============================================================================

get_content_type() {
  case "${1##*.}" in
    jpg|jpeg) echo "image/jpeg" ;;
    png) echo "image/png" ;;
    gif) echo "image/gif" ;;
    webp) echo "image/webp" ;;
    avif) echo "image/avif" ;;
    svg) echo "image/svg+xml" ;;
    mp4) echo "video/mp4" ;;
    webm) echo "video/webm" ;;
    mov) echo "video/quicktime" ;;
    *) echo "application/octet-stream" ;;
  esac
}

# ============================================================================
# ONE-TIME SAFE MIGRATION
# Converts ONLY markdown CDN image syntax -> HTML img tags
# ONLY if markdown syntax still exists
# ============================================================================

echo ""
echo "=================================================="
echo "Migrating markdown CDN images → HTML..."
echo "=================================================="

find "$BLOG_CONTENT_DIR" -type f \
  \( -name "*.mdoc" -o -name "*.md" -o -name "*.mdx" \) \
| while IFS= read -r MD_FILE; do

  # Skip files already migrated
  if ! grep -qE '!\[[^]]*\]\(https://cdn\.' "$MD_FILE"; then
    continue
  fi

  echo "Migrating: $MD_FILE"

  TEMP_FILE=$(mktemp)

  awk '

  {
    line = $0

    while (match(line, /!\[[^]]*\]\(https:\/\/cdn\.[^)]+\)/)) {

      full = substr(line, RSTART, RLENGTH)

      alt = full
      sub(/^!\[/, "", alt)
      sub(/\]\(https:\/\/cdn\.[^)]+\)$/, "", alt)

      url = full
      sub(/^!\[[^]]*\]\(/, "", url)
      sub(/\)$/, "", url)

      replacement = "<img src=\"" url "\" alt=\"" alt "\" loading=\"lazy\" decoding=\"async\" class=\"rounded-xl border border-white/10 my-8 w-full\" />"

      line = substr(line, 1, RSTART - 1) replacement substr(line, RSTART + RLENGTH)
    }

    print line
  }

  ' "$MD_FILE" > "$TEMP_FILE"

  mv "$TEMP_FILE" "$MD_FILE"

done

# ============================================================================
# FIND LOCAL MEDIA ONLY
# IMPORTANT:
# ONLY local files should be processed
# Never reprocess CDN content
# ============================================================================

CHANGED=$(find "$PUBLIC_IMAGE_DIR" "$BLOG_CONTENT_DIR" -type f \
  \( \
    -path "*/content/*" \
    -o -path "public/images/blog/*" \
  \) \
  \( \
    -iname "*.png" \
    -o -iname "*.jpg" \
    -o -iname "*.jpeg" \
    -o -iname "*.webp" \
    -o -iname "*.gif" \
    -o -iname "*.avif" \
    -o -iname "*.svg" \
    -o -iname "*.mp4" \
    -o -iname "*.webm" \
    -o -iname "*.mov" \
  \) \
  2>/dev/null || true)

echo ""
echo "=================================================="
echo "Local media detected"
echo "=================================================="
echo "$CHANGED"

# ============================================================================
# PROCESS MEDIA
# ============================================================================

while IFS= read -r FILE; do

  [ -f "$FILE" ] || continue

  echo ""
  echo "=================================================="
  echo "Processing: $FILE"
  echo "=================================================="

  FILE_NAME=$(basename "$FILE")
  CONTENT_TYPE=$(get_content_type "$FILE")

  # ==========================================================================
  # CASE 1:
  # public/images/blog/*
  # Used mainly for heroImage
  # ==========================================================================

  if [[ "$FILE" == public/images/blog/* ]]; then

    PUBLIC_PATH="${FILE#public}"
    R2_KEY="${PUBLIC_PATH#/}"
    CDN_URL="${CDN_BASE_URL}/${R2_KEY}"

    echo "Uploading public asset → R2"
    echo "CDN URL: $CDN_URL"

    wrangler r2 object put "${R2_BUCKET_NAME}/${R2_KEY}" \
      --remote \
      --file "$FILE" \
      --content-type "$CONTENT_TYPE"

    echo "Updating heroImage references safely..."

    grep -rlF -- "$PUBLIC_PATH" "$BLOG_CONTENT_DIR" 2>/dev/null | while IFS= read -r MD_FILE; do

python3 <<PYTHON
from pathlib import Path

file_path = Path("$MD_FILE")

content = file_path.read_text()

public_path = "$PUBLIC_PATH"
cdn_url = "$CDN_URL"

# ONLY replace exact local heroImage references
content = content.replace(
    f"heroImage: {public_path}",
    f"heroImage: {cdn_url}"
)

file_path.write_text(content)
PYTHON

    done

  fi

  # ==========================================================================
  # CASE 2:
  # Keystatic content assets
  # src/content/blog/<slug>/content/*
  # ==========================================================================

  if [[ "$FILE" == src/content/blog/*/content/* ]]; then

    POST_SLUG=$(echo "$FILE" | cut -d'/' -f4)
    EXTENSION="${FILE_NAME##*.}"

    if [[ "$EXTENSION" =~ ^(mp4|webm|mov)$ ]]; then
      R2_KEY="videos/blog/${POST_SLUG}/${FILE_NAME}"
    else
      R2_KEY="images/blog/${POST_SLUG}/${FILE_NAME}"
    fi

    CDN_URL="${CDN_BASE_URL}/${R2_KEY}"

    echo "Uploading Keystatic asset → R2"
    echo "CDN URL: $CDN_URL"

    wrangler r2 object put "${R2_BUCKET_NAME}/${R2_KEY}" \
      --remote \
      --file "$FILE" \
      --content-type "$CONTENT_TYPE"

    MD_FILE="${BLOG_CONTENT_DIR}/${POST_SLUG}.mdoc"

    [ -f "$MD_FILE" ] || continue

    echo "Transforming local markdown asset syntax → CDN HTML"

    TEMP_FILE=$(mktemp)

    awk \
      -v filename="$FILE_NAME" \
      -v cdn="$CDN_URL" \
      -v ext="$EXTENSION" \
    '

    function is_video(extension) {
      return (
        extension == "mp4" ||
        extension == "webm" ||
        extension == "mov"
      )
    }

    {
      line = $0

      while (match(line, /!\[[^]]*\]\([^)]+\)/)) {

        full = substr(line, RSTART, RLENGTH)

        alt = full
        sub(/^!\[/, "", alt)
        sub(/\]\([^)]+\)$/, "", alt)

        path = full
        sub(/^!\[[^]]*\]\(/, "", path)
        sub(/\)$/, "", path)

        if (
          path == "./content/" filename ||
          path == "content/" filename ||
          path == filename
        ) {

          if (is_video(ext)) {

            replacement = "<video controls playsinline preload=\"metadata\" class=\"w-full rounded-xl my-8\"><source src=\"" cdn "\" type=\"video/" ext "\" /></video>"

          } else {

            replacement = "<img src=\"" cdn "\" alt=\"" alt "\" loading=\"lazy\" decoding=\"async\" class=\"rounded-xl border border-white/10 my-8 w-full\" />"
          }

          line = substr(line, 1, RSTART - 1) replacement substr(line, RSTART + RLENGTH)

        } else {
          break
        }
      }

      print line
    }

    ' "$MD_FILE" > "$TEMP_FILE"

    mv "$TEMP_FILE" "$MD_FILE"

    echo "Successfully transformed content assets."

  fi

done <<< "$CHANGED"

# ============================================================================
# COMMIT CHANGES
# ============================================================================

git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

git add -A

if git diff --staged --quiet; then
  echo "Nothing to commit."
  exit 0
fi

git commit -m "chore: sync blog assets to R2 CDN [skip ci]"

git push
