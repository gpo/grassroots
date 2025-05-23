import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

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
    allowedHosts: ["grassroots.local"],
  },
  resolve: {
    alias: {
      typeorm: path.resolve(
        __dirname,
        "./node_modules/typeorm/typeorm-model-shim",
      ),
    },
  },
});
