import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        lazy: resolve(import.meta.dirname, "lazy.html"),
        popup: resolve(import.meta.dirname, "popup.html"),
      },
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name].js",
      },
    },
    sourcemap: true,
  },
  plugins: [react()],
});
