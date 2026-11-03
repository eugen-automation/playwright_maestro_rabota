export const WEB_TEST_SETTINGS = {
  timeouts: { test: 30_000, expect: 5_000, action: 10_000, navigation: 20_000 },
  workers: { ci: 2, local: 1 },
} as const;
