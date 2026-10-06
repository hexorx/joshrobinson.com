import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  // Markdown and MDX posts live in `src/content/blog/`.
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.optional(image()),
      // Lowercase, hyphenated tags. Each tag gets a page at /tags/<tag>/.
      tags: z.array(z.string()).default([]),
      // Drafts show in `astro dev` but are left out of production builds, RSS, and tag pages.
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
