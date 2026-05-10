#!/usr/bin/env bash

set -euo pipefail

# ============================================================================
# Helpers
# ============================================================================

get_content_type() {
  case "${1##*.}" in
    jpg|jpeg) echo "image/jpeg" ;;
    png)      echo "image/png" ;;
    gif)      echo "image/gif" ;;
    webp)     echo "image/webp" ;;
    avif)     echo "image/avif" ;;
    svg)      echo "image/svg+xml" ;;
    *)        echo "application/octet-stream" ;;
  esac
}

escape_sed_pattern() {
  printf '%s' "$1" | sed 's/[][\/.^$*+?(){}|]/\\&/g'
}

escape_sed_replacement() {
  printf '%s' "$1" | sed 's/[&|\\]/\\&/g'
}

# ============================================================================
# Find changed images
# ============================================================================

CHANGED=$(git diff --name-only --diff-filter=AM HEAD~1 HEAD | grep -E \
'^(public/images/blog/|src/content/blog/.*/content/)' || true)

if [ -z "$CHANGED" ]; then
  echo "No changed blog images found. Skipping."
  exit 0
fi

echo "Changed images:"
echo "$CHANGED"

# ============================================================================
# Process each image
# ============================================================================

while IFS= read -r FILE; do

  [ -f "$FILE" ] || continue

  echo ""
  echo "===================================================="
  echo "Processing: $FILE"
  echo "===================================================="

  CONTENT_TYPE=$(get_content_type "$FILE")

  # --------------------------------------------------------------------------
  # CASE 1: public/images/blog/**
  # --------------------------------------------------------------------------

  if [[ "$FILE" == public/images/blog/* ]]; then

    PUBLIC_PATH="${FILE#public}"
    R2_KEY="${PUBLIC_PATH#/}"
    CDN_URL="${CDN_BASE_URL}/${R2_KEY}"

    echo "Detected public image"
    echo "CDN URL: $CDN_URL"

    echo "Uploading to R2..."

    wrangler r2 object put "${R2_BUCKET_NAME}/${R2_KEY}" \
      --file "$FILE" \
      --content-type "$CONTENT_TYPE"

    echo "Verifying upload..."

    wrangler r2 object get "${R2_BUCKET_NAME}/${R2_KEY}" \
      --remote \
      --pipe > /dev/null

    SED_PUBLIC_PATH=$(escape_sed_pattern "$PUBLIC_PATH")
    SED_CDN_URL=$(escape_sed_replacement "$CDN_URL")

    echo "Replacing markdown references..."

    grep -rlF -- "$PUBLIC_PATH" src/content/blog/ | while IFS= read -r MD_FILE; do
      sed -i "s|${SED_PUBLIC_PATH}|${SED_CDN_URL}|g" "$MD_FILE"
    done

    echo "Removing local image..."

    rm "$FILE"

  fi

  # --------------------------------------------------------------------------
  # CASE 2: src/content/blog/**/content/**
  # --------------------------------------------------------------------------

  if [[ "$FILE" == src/content/blog/*/content/* ]]; then

    # Example:
    # src/content/blog/my-post/content/architecture.png

    POST_SLUG=$(echo "$FILE" | cut -d'/' -f4)
    IMAGE_NAME=$(basename "$FILE")

    R2_KEY="images/blog/${POST_SLUG}/${IMAGE_NAME}"

    CDN_URL="${CDN_BASE_URL}/${R2_KEY}"

    echo "Detected Keystatic content image"
    echo "Post slug: $POST_SLUG"
    echo "CDN URL: $CDN_URL"

    echo "Uploading to R2..."

    wrangler r2 object put "${R2_BUCKET_NAME}/${R2_KEY}" \
      --file "$FILE" \
      --content-type "$CONTENT_TYPE"

    echo "Verifying upload..."

    wrangler r2 object get "${R2_BUCKET_NAME}/${R2_KEY}" \
      --remote \
      --pipe > /dev/null

    MD_FILE="src/content/blog/${POST_SLUG}.md"

    if [ ! -f "$MD_FILE" ]; then
      MD_FILE="src/content/blog/${POST_SLUG}.mdx"
    fi

    if [ -f "$MD_FILE" ]; then

      echo "Updating markdown references in: $MD_FILE"

      RELATIVE_PATH_1="./content/${IMAGE_NAME}"
      RELATIVE_PATH_2="content/${IMAGE_NAME}"

      SED_RELATIVE_PATH_1=$(escape_sed_pattern "$RELATIVE_PATH_1")
      SED_RELATIVE_PATH_2=$(escape_sed_pattern "$RELATIVE_PATH_2")
      SED_CDN_URL=$(escape_sed_replacement "$CDN_URL")

      sed -i "s|${SED_RELATIVE_PATH_1}|${SED_CDN_URL}|g" "$MD_FILE"
      sed -i "s|${SED_RELATIVE_PATH_2}|${SED_CDN_URL}|g" "$MD_FILE"

      echo "Removing local image..."

      rm "$FILE"

    else
      echo "WARNING: Could not find markdown file for slug: $POST_SLUG"
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