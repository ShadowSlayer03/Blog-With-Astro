import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
 * @returns number of minutes (minimum 1)
 */
export function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Finds the remaining posts for a given page number.
 * @param postsWithReadingTime 
 * @param pageNum 
 * @returns An array of remaining posts for the given page.
 */
export function findRemainingPosts(postsWithReadingTime: any[], pageNum: number) {
  const blogsInAPage = 6;

  if (pageNum === 1) {
    return postsWithReadingTime.slice(1, 4);
  } else {
    const startIndex = 4 + (blogsInAPage * (pageNum - 2));
    const endIndex = startIndex + blogsInAPage;
    return postsWithReadingTime.slice(startIndex, endIndex);
  }
}

/** 
 * Generates pagination blocks for a given current page and total number of posts.
 * The first page shows 4 posts, and subsequent pages show 6 posts each.
 * @param totalPosts - The total number of posts available.
 * @returns An array of pagination blocks, where each block is an array of page numbers.
*/
export function getPaginationBlocks(totalPosts: number) {
  const blogsInAPage = 6;
  const firstPageCount = 4;
  const remainingPostsCount = totalPosts - firstPageCount;

  const totalPages = remainingPostsCount > 0 ? Math.ceil(remainingPostsCount / blogsInAPage) + 1 : 1;

  const valuesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  const paginationBlocks: number[][] = [];

  valuesArray.forEach((page) => {
    const arr = paginationBlocks[Math.ceil(page / 4) - 1] || [];
    arr.push(page);
    paginationBlocks[Math.ceil(page / 4) - 1] = arr;
  });

  return paginationBlocks;
}

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};