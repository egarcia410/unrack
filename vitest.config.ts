import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["src/stores/polaris/__tests__/setup.ts"],
    include: ["src/stores/polaris/__tests__/**/*.test.ts"],
  },
});
