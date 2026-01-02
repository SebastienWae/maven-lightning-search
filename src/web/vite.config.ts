import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    cloudflare({ viteEnvironment: { name: "ssr" }, persistState: { path: "../../.wrangler/state" } }),
    tanstackStart(),
    viteReact(),
    tailwindcss(),
  ],
});
