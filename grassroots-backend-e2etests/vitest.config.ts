import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";

export default defineConfig({
  plugins: [
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: "es6" },
    }),
  ],
  test: {
    globals: false,
    globalSetup: "../grassroots-backend/src/testing/GlobalSetup.ts",
    root: "./",
    exclude: ["node_modules/**", "dist/**"],
    include: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
  },
});
