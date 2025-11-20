import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["lib", "node_modules"],
    // These tests flakily timeout at the default of 5 seconds on my machine.
    testTimeout: 15000,
    printConsoleTrace: true,
  },
});
