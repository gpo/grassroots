import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  envDir: "..",
  plugins: [
    react({ tsDecorators: true }),
    TanStackRouterVite({
      target: "react",
      autoCodeSplitting: true,
    }),
  ],
  server: {
    strictPort: true,
    allowedHosts: ["grassroots.org"],
  },
});
