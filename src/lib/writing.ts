import type { Post } from "./posts";
export function readingMinutes(body = ""): number {
  const text = body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "");
  return Math.max(
    1,
    Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 220),
  );
}
export function postLink(post: Post): string {
  return `/blog/${post.id}/`;
}
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function adjacentPosts(
  posts: Post[],
  id: string,
): { previous?: Post; next?: Post } {
  const index = posts.findIndex((post) => post.id === id);
  if (index < 0) return {};
  return {
    previous: posts[index + 1],
    next: index > 0 ? posts[index - 1] : undefined,
  };
}
