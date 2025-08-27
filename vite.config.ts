import path from "path";
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    open: true,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "src/components/ui/atoms/**",
        "src/components/ui/molecules/**",
        "**/*.ts",
        "**/*.js",
        "src/providers/**",
        "src/config/**",
        "src/utils/**",
        "src/assets/**",
        "src/App.tsx",
        "src/main.tsx",
      ],
    },
  },
});
