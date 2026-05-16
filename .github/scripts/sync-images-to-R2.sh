#!/usr/bin/env bash

set -euo pipefail

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

escape_sed_pattern() {
  printf '%s' "$1" | sed 's/[][\/.^$*+?(){}|]/\\&/g'
}

escape_sed_replacement() {
  printf '%s' "$1" | sed 's/[&|\\]/\\&/g'
}

# ============================================================================
# ONE-TIME MIGRATION:
# Convert existing CDN markdown image syntax -> HTML img tags
# ============================================================================

echo ""
echo "=================================================="
echo "Migrating existing CDN markdown images → HTML..."
echo "=================================================="

find src/content/blog -type f \
  \( -name "*.mdoc" -o -name "*.md" -o -name "*.mdx" \) \
| while IFS= read -r MD_FILE; do

  echo "Processing markdown migration: $MD_FILE"

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

      replacement =
        "<img " \
        "src=\"" url "\" " \
        "alt=\"" alt "\" " \
        "loading=\"lazy\" " \
        "decoding=\"async\" " \
        "class=\"rounded-xl border border-white/10 my-8 w-full\" " \
        "/>"

      line =
        substr(line, 1, RSTART - 1) \
        replacement \
        substr(line, RSTART + RLENGTH)
    }

    print line
  }

  ' "$MD_FILE" > "$TEMP_FILE"

  mv "$TEMP_FILE" "$MD_FILE"

done

# ============================================================================
# Find ALL remaining local blog media
# ============================================================================

CHANGED=$(find public/images/blog src/content/blog -type f \
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

if [ -z "$CHANGED" ]; then
  echo "No media left to process."
else
  echo "Found media:"
  echo "$CHANGED"
fi

# ============================================================================
# Process media one-by-one
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
  # CASE 1: public/images/blog/**
  # ==========================================================================

  if [[ "$FILE" == public/images/blog/* ]]; then

    PUBLIC_PATH="${FILE#public}"

    R2_KEY="${PUBLIC_PATH#/}"

    CDN_URL="${CDN_BASE_URL}/${R2_KEY}"

    echo "R2 Key: $R2_KEY"
    echo "CDN URL: $CDN_URL"

    echo "Uploading public asset to R2..."

    if wrangler r2 object put "${R2_BUCKET_NAME}/${R2_KEY}" \
      --remote \
      --file "$FILE" \
      --content-type "$CONTENT_TYPE"; then

      echo "Upload successful."

    else
      echo "Upload failed for: $FILE"
      continue
    fi

    echo "Replacing public asset references..."

    SED_PUBLIC_PATH=$(escape_sed_pattern "$PUBLIC_PATH")
    SED_CDN_URL=$(escape_sed_replacement "$CDN_URL")

    grep -rlF -- "$PUBLIC_PATH" src/content/blog/ 2>/dev/null | while IFS= read -r MD_FILE; do
      sed -i "s|${SED_PUBLIC_PATH}|${SED_CDN_URL}|g" "$MD_FILE"
    done

  fi

  # ==========================================================================
  # CASE 2: Keystatic content assets
  # ==========================================================================

  if [[ "$FILE" == src/content/blog/*/content/* ]]; then

    POST_SLUG=$(echo "$FILE" | cut -d'/' -f4)

    EXTENSION="${FILE_NAME##*.}"

    # ------------------------------------------------------------------------
    # Decide CDN folder
    # ------------------------------------------------------------------------

    if [[ "$EXTENSION" =~ ^(mp4|webm|mov)$ ]]; then
      R2_KEY="videos/blog/${POST_SLUG}/${FILE_NAME}"
    else
      R2_KEY="images/blog/${POST_SLUG}/${FILE_NAME}"
    fi

    CDN_URL="${CDN_BASE_URL}/${R2_KEY}"

    echo "R2 Key: $R2_KEY"
    echo "CDN URL: $CDN_URL"

    echo "Uploading Keystatic asset to R2..."

    if wrangler r2 object put "${R2_BUCKET_NAME}/${R2_KEY}" \
      --remote \
      --file "$FILE" \
      --content-type "$CONTENT_TYPE"; then

      echo "Upload successful."

    else
      echo "Upload failed for: $FILE"
      continue
    fi

    # ------------------------------------------------------------------------
    # Find markdown file
    # ------------------------------------------------------------------------

    MD_FILE="src/content/blog/${POST_SLUG}.mdoc"

    if [ ! -f "$MD_FILE" ]; then
      MD_FILE="src/content/blog/${POST_SLUG}.md"
    fi

    if [ ! -f "$MD_FILE" ]; then
      MD_FILE="src/content/blog/${POST_SLUG}.mdx"
    fi

    if [ -f "$MD_FILE" ]; then

      echo "Transforming markdown asset syntax → HTML..."

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

              replacement =
                "<video controls playsinline preload=\"metadata\" class=\"w-full rounded-xl my-8\">" \
                "<source src=\"" cdn "\" type=\"video/" ext "\" />" \
                "</video>"

            } else {

              replacement =
                "<img " \
                "src=\"" cdn "\" " \
                "alt=\"" alt "\" " \
                "loading=\"lazy\" " \
                "decoding=\"async\" " \
                "class=\"rounded-xl border border-white/10 my-8 w-full\" " \
                "/>"
            }

            line =
              substr(line, 1, RSTART - 1) \
              replacement \
              substr(line, RSTART + RLENGTH)

          } else {
            break
          }
        }

        print line
      }

      ' "$MD_FILE" > "$TEMP_FILE"

      mv "$TEMP_FILE" "$MD_FILE"

      echo "Successfully transformed asset references."

    else
      echo "Could not find markdown file for slug: $POST_SLUG"
    fi

  fi

done <<< "$CHANGED"

# ============================================================================
# Commit changes
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
