// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    // 1. Tell Nitro NOT to render the React code dynamically
    routeRules: {
      '/**': { ssr: false }
    },
    // 2. Force Nitro to generate a blank SPA fallback file named 200.html
    prerender: {
      routes: ['/200.html']
    }
  }
});
