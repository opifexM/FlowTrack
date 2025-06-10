import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'test-data/__tests__',
  testMatch: /.*\.test\.js/,
});
