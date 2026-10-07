import { test } from "node:test";
import assert from "node:assert/strict";
import { readingMinutes, adjacentPosts, isoDate } from "../src/lib/writing.ts";

test("reading estimates ignore fenced code and never report zero", () => {
  assert.equal(readingMinutes(""), 1);
  assert.equal(readingMinutes("word ".repeat(441)), 3);
  assert.equal(readingMinutes("```js\n" + "word ".repeat(441) + "\n```"), 1);
});
test("adjacent post links handle first, middle, last and missing posts", () => {
  const posts = [{ id: "newest" }, { id: "middle" }, { id: "oldest" }];
  assert.deepEqual(adjacentPosts(posts, "newest"), {
    previous: posts[1],
    next: undefined,
  });
  assert.deepEqual(adjacentPosts(posts, "middle"), {
    previous: posts[2],
    next: posts[0],
  });
  assert.deepEqual(adjacentPosts(posts, "oldest"), {
    previous: undefined,
    next: posts[1],
  });
  assert.deepEqual(adjacentPosts(posts, "absent"), {});
  assert.equal(isoDate(new Date("2026-09-29T23:00:00Z")), "2026-09-29");
});
