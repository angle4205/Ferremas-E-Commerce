import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";
import { resolve } from "path";

export default defineConfig({
  base: "",
  plugins: [react(), vitePluginInjectDataLocator()],
  server: {
    allowedHosts: true,
  },
  build: {
    outDir: resolve(__dirname, "../backend/core/static/landing"),
    emptyOutDir: true,
  },
});