import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://joshrobinson.com",
  output: "static",
  integrations: [mdx(), sitemap()],
});
