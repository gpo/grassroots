import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  envDir: "..",
  plugins: [
    react({ tsDecorators: true }),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "src/Routes",
    }),
  ],
  server: {
    strictPort: true,
    allowedHosts: ["grassroots.org"],
  },
  // Must be in tsconfig.json as well as here: [https://github.com/vitejs/vite/issues/6828](https://github.com/vitejs/vite/issues/6828).
  // tsconfig.json is more standard, and required for editor support.
  resolve: {
    alias: {
      "@nestjs/common": path.resolve(__dirname, "./src/NestCommonShim"),
      "@nestjs/swagger": path.resolve(__dirname, "./src/NestCommonShim"),
    },
  },
});
