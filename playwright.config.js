import { defineConfig } from "@playwright/test";

export default defineConfig({
  reporter: [["list"], ["html"]],

  use: {
    headless: false,
    baseURL: "http://localhost:5173",
    // baseURL: "demo.playwright.dev/todomvc"
  },
  // remove webServer if api only test
  // webServer: {
  //   command: "npm run dev",
  //   port: 5173,
  //   reuseExistingServer: true,
  // },
});
