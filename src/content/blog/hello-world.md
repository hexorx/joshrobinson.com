---
title: 'Hello, world'
description: 'Template post kept out of the public site until Josh reviews which notes to publish.'
draft: true
pubDate: '2026-09-29'
heroImage: '../../assets/blog-placeholder-1.jpg'
tags: ['meta']
---

This is a **placeholder post** showing the blog setup. Posts are Markdown (or MDX) files in `src/content/blog/`. Frontmatter is checked against the schema in `src/content.config.ts`.

- Add `tags: ['some-tag']` to group posts. Each tag gets a page under `/tags/`.
- Set `draft: true` to keep a post out of production builds and the RSS feed.
- Put images in `src/assets/` and reference them from `heroImage` or inline. Astro optimizes them at build time.

## Template example

The following example is placeholder content for checking the post template.

```js filename="example.js"
// Placeholder example
const message = "Hello, world";
console.log(message, 42);
```

## Reading notes

A footnote can provide context without interrupting the main text.[^example]

[^example]: This is a placeholder footnote for the template.
