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
# Find ALL remaining local blog images
# ============================================================================

CHANGED=$(find public/images/blog src/content/blog -type f \
  \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.webp" -o -iname "*.gif" -o -iname "*.avif" -o -iname "*.svg" \) \
  2>/dev/null || true)

if [ -z "$CHANGED" ]; then
  echo "No images left to process."
  exit 0
fi

echo "Found images:"
echo "$CHANGED"

# ============================================================================
# Process images one-by-one
# ============================================================================

while IFS= read -r FILE; do

  [ -f "$FILE" ] || continue

  echo ""
  echo "=================================================="
  echo "Processing: $FILE"
  echo "=================================================="

  # --------------------------------------------------------------------------
  # Skip if this image is already referenced via CDN URL in any markdown file
  # --------------------------------------------------------------------------
  IMAGE_NAME=$(basename "$FILE")
  if grep -rl "${CDN_BASE_URL}" src/content/blog/ 2>/dev/null | xargs grep -l "$IMAGE_NAME" 2>/dev/null | grep -q .; then
    echo "Skipping (already on CDN): $FILE"
    continue
  fi

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

    echo "Uploading public image to REAL R2..."

    if wrangler r2 object put "${R2_BUCKET_NAME}/${R2_KEY}" \
      --remote \
      --file "$FILE" \
      --content-type "$CONTENT_TYPE"; then

      echo "Upload successful."

    else
      echo "Upload failed for: $FILE"
      continue
    fi

    echo "Replacing markdown references..."

    SED_PUBLIC_PATH=$(escape_sed_pattern "$PUBLIC_PATH")
    SED_CDN_URL=$(escape_sed_replacement "$CDN_URL")

    grep -rlF -- "$PUBLIC_PATH" src/content/blog/ | while IFS= read -r MD_FILE; do
      sed -i "s|${SED_PUBLIC_PATH}|${SED_CDN_URL}|g" "$MD_FILE"
    done

    echo "Removing local image..."

    rm "$FILE"

  fi

  # ==========================================================================
  # CASE 2: Keystatic content images
  # ==========================================================================

  if [[ "$FILE" == src/content/blog/*/content/* ]]; then

    POST_SLUG=$(echo "$FILE" | cut -d'/' -f4)

    IMAGE_NAME=$(basename "$FILE")

    R2_KEY="images/blog/${POST_SLUG}/${IMAGE_NAME}"

    CDN_URL="${CDN_BASE_URL}/${R2_KEY}"

    echo "R2 Key: $R2_KEY"
    echo "CDN URL: $CDN_URL"

    echo "Uploading Keystatic content image to REAL R2..."

    if wrangler r2 object put "${R2_BUCKET_NAME}/${R2_KEY}" \
      --remote \
      --file "$FILE" \
      --content-type "$CONTENT_TYPE"; then

      echo "Upload successful."

    else
      echo "Upload failed for: $FILE"
      continue
    fi

    # Find the markdown file — check .mdoc first, then .md, then .mdx
    MD_FILE="src/content/blog/${POST_SLUG}.mdoc"

    if [ ! -f "$MD_FILE" ]; then
      MD_FILE="src/content/blog/${POST_SLUG}.md"
    fi

    if [ ! -f "$MD_FILE" ]; then
      MD_FILE="src/content/blog/${POST_SLUG}.mdx"
    fi

    if [ -f "$MD_FILE" ]; then

      echo "Replacing markdown references in: $MD_FILE"

      RELATIVE_PATH_1="./content/${IMAGE_NAME}"
      RELATIVE_PATH_2="content/${IMAGE_NAME}"
      RELATIVE_PATH_3="${IMAGE_NAME}"

      SED_RELATIVE_PATH_1=$(escape_sed_pattern "$RELATIVE_PATH_1")
      SED_RELATIVE_PATH_2=$(escape_sed_pattern "$RELATIVE_PATH_2")
      SED_RELATIVE_PATH_3=$(escape_sed_pattern "$RELATIVE_PATH_3")

      SED_CDN_URL=$(escape_sed_replacement "$CDN_URL")

      sed -E -i "s|\(${SED_RELATIVE_PATH_1}\)|(${SED_CDN_URL})|g" "$MD_FILE"

      sed -E -i "s|\(${SED_RELATIVE_PATH_2}\)|(${SED_CDN_URL})|g" "$MD_FILE"

      sed -E -i "s|\(${SED_RELATIVE_PATH_3}\)|(${SED_CDN_URL})|g" "$MD_FILE"

      echo "Removing local image..."

      rm "$FILE"

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

git commit -m "chore: migrate blog images to R2 CDN [skip ci]"

git push
