import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react({ tsDecorators: true }),
  ],
  resolve: {
    alias: {
      typeorm: path.resolve(
        __dirname,
        "./node_modules/typeorm/typeorm-model-shim",
      ),
    },
  },
});
