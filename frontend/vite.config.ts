// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // 1. Completely disable the SSR build step (fixes the rolldown error)
    ssr: false, 
  },
  nitro: {
    // 2. Force the output to be a static site (generates the missing index.html)
    preset: 'static', 
    prerender: {
      routes: ['/'],
      crawlLinks: true
    }
  }
});
