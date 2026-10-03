// Terminal token palette; token scopes are shared by Markdown and MDX.
export const terminalTheme = {
  name: "terminal",
  type: "dark",
  colors: { "editor.background": "#0A0C0F", "editor.foreground": "#E8ECF1" },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#808B99" },
    },
    {
      scope: ["string", "entity.name.tag"],
      settings: { foreground: "#7AA2FF" },
    },
    { scope: ["keyword", "storage"], settings: { foreground: "#C6F432" } },
    {
      scope: ["constant.numeric", "constant.language"],
      settings: { foreground: "#F5B83D" },
    },
  ],
};
export const codeLabels = {
  name: "terminal-code-labels",
  pre(node) {
    node.properties["data-language"] = this.options.lang || "text";
    const meta = this.options.meta?.__raw || "";
    const filename = meta.match(/(?:^|\s)filename=["']([^"']+)["']/)?.[1];
    if (filename) node.properties["data-filename"] = filename;
  },
};
