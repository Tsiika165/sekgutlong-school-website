import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Vercel serves from "/", GitHub Pages serves from "/<repo-name>/".
  // The Pages workflow sets VITE_BASE_PATH; everywhere else defaults to "/".
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: "./src/test/setup.js",
    css: false,
  },
});
