// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// ...
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Force the underlying engine to build a static site instead of a Cloudflare worker
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  }
});
