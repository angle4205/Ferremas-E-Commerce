import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";

export default defineConfig({
  base: "/static/landing/",
  plugins: [react(), vitePluginInjectDataLocator()],
  server: {
    allowedHosts: true,
  },
});