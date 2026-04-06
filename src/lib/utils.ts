/**
 * Formats a Date object to a human-readable string.
 * @param style 'long' → "April 5, 2026" | 'short' → "Apr 5, 2026"
 */
export function formatDate(date: Date, style: 'long' | 'short' = 'long'): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: style,
    day: 'numeric',
  });
}

/**
 * Estimates reading time for a given text.
 * Average reading speed: 200 words per minute.
 * @returns number of minutes (minimum 1)
 */
export function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
