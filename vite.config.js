import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/generate/",
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "build/generate",
    rollupOptions: {
      input: "./index.html",
    },
  },
  publicDir: "public",
});
