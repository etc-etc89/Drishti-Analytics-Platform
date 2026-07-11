// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    // Tell Nitro to generate a static HTML file of our routes at the end of the build
    prerender: {
      routes: ['/'],
      crawlLinks: true
    }
  }
});
