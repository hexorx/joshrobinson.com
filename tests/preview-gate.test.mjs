import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const workflow = await readFile(
  new URL("../.github/workflows/hosting.yml", import.meta.url),
  "utf8",
);
const gate = workflow
  .split("      - name: Check preview prerequisites")[1]
  .split("        run: |\n")[1]
  .split("      - if:")[0]
  .split("\n")
  .map((line) => line.replace(/^          /, ""))
  .join("\n");

for (const [name, variables, ready, reason] of [
  [
    "approval absent even with credentials",
    {
      PREVIEWS_ENABLED: "",
      CLOUDFLARE_API_TOKEN: "test-only",
      CLOUDFLARE_ACCOUNT_ID: "test-only",
    },
    false,
    "approve public preview exposure",
  ],
  [
    "token missing after approval",
    {
      PREVIEWS_ENABLED: "true",
      CLOUDFLARE_API_TOKEN: "",
      CLOUDFLARE_ACCOUNT_ID: "test-only",
    },
    false,
    "supply CLOUDFLARE_API_TOKEN",
  ],
  [
    "account missing after approval",
    {
      PREVIEWS_ENABLED: "true",
      CLOUDFLARE_API_TOKEN: "test-only",
      CLOUDFLARE_ACCOUNT_ID: "",
    },
    false,
    "supply CLOUDFLARE_API_TOKEN",
  ],
  [
    "all prerequisites present",
    {
      PREVIEWS_ENABLED: "true",
      CLOUDFLARE_API_TOKEN: "test-only",
      CLOUDFLARE_ACCOUNT_ID: "test-only",
    },
    true,
    null,
  ],
]) {
  test(`preview gate: ${name}`, async () => {
    const root = await mkdtemp(join(tmpdir(), "preview-gate-"));
    const output = join(root, "output");
    const summary = join(root, "summary");
    execFileSync("bash", ["-e", "-u", "-c", gate], {
      env: {
        ...variables,
        GITHUB_OUTPUT: output,
        GITHUB_STEP_SUMMARY: summary,
      },
    });
    assert.equal(await readFile(output, "utf8"), `ready=${ready}\n`);
    if (reason) assert.ok((await readFile(summary, "utf8")).includes(reason));
  });
}
