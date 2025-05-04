import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules/**", "src/assets/**", "src/tests/**"],
    },
    setupFiles: ["./src/tests/setup.ts"],
    include: ["./src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["./src/tests/e2e/**", "node_modules/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
