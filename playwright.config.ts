import { defineConfig } from "@playwright/test";
const port = Number(process.env.TEST_PORT || 4337);
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  use: { baseURL: `http://localhost:${port}` },
  workers: 1,
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${port} --ignore-lock`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
  },
});
