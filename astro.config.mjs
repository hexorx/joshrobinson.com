import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import { terminalTheme, codeLabels } from "./src/lib/code-theme.mjs";

export default defineConfig({
  site: "https://joshrobinson.com",
  output: "static",
  markdown: {
    shikiConfig: { theme: terminalTheme, transformers: [codeLabels] },
  },
  integrations: [mdx(), sitemap()],
});
