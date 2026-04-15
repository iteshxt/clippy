import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    fileParallelism: false, // Run tests sequentially since they might race with the DB setup depending on memory constraint
    hookTimeout: 120000,
    testTimeout: 60000,
  },
});
