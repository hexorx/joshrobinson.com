import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://localhost:4337" },
  workers: 1,
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4337 --ignore-lock",
    url: "http://localhost:4337",
    reuseExistingServer: false,
  },
});
