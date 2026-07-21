import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(import.meta.dirname, "src/content.tsx"),
      fileName: () => "assets/content.js",
      formats: ["iife"],
      name: "ChromeCtlpContent",
    },
    minify: "oxc",
    sourcemap: true,
  },
  plugins: [react()],
});
