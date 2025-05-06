// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [],
    },
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias:
        process.env.NODE_ENV === 'production'
          ? {
              'react-dom/server': 'react-dom/server.edge',
            }
          : undefined,
    },
    // Make environment variables available
    define: {
      'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
      'process.env.SUPABASE_PUBLIC_KEY': JSON.stringify(process.env.SUPABASE_PUBLIC_KEY),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(process.env.OPENROUTER_API_KEY),
      'import.meta.env.OPENROUTER_API_KEY': JSON.stringify(process.env.OPENROUTER_API_KEY),
    }
  },
  adapter: cloudflare(),
  experimental: {
    session: true,
  },
});