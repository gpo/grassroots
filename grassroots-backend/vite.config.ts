//import { defineConfig } from "vite";
import { defineConfig } from "vitest/config";

import { VitePluginNode } from "vite-plugin-node";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    ...VitePluginNode({
      adapter: "nest",
      appPath: "./src/Main.ts",
      tsCompiler: "swc",
    }),
    viteCommonjs(),
  ],
  test: {
    globals: false,
    globalSetup: "./src/testing/GlobalSetup.ts",
    root: "./",
    exclude: ["./src/testing/typetests/**", "node_modules/**", "dist/**"],
    include: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
  },
});
