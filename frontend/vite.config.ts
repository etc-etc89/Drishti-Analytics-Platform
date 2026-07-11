// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Keep the server entry so the framework doesn't crash (fixes the rolldown error)
    server: { entry: "server" },
  },
  nitro: {
    // Tell Nitro NOT to render the React code during the build process
    routeRules: {
      '/**': { ssr: false }
    }
  }
});
