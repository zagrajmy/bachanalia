import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  /**
   * WordPress is mocked, so nothing here waits on a server that answers in
   * ~10s. What is left is Turbopack: the first test to reach a route pays for
   * compiling it, and the first to submit a form pays again for the server
   * action — 15s each on a cold `.next-mock`, against under a second once warm.
   * A tighter budget passes locally and fails the whole cart suite in CI, which
   * always starts cold. It used to be 90s purely to survive the live shop.
   */
  timeout: 60_000,
  expect: { timeout: 20_000 },
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 30_000,
    locale: "pl-PL",
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  /**
   * The suite runs against WordPress recorded into `e2e/fixtures/wp` and
   * replayed by `msw` inside the Next server, so a run writes nothing to the
   * live shop, needs no network, and is not at the mercy of a server that
   * answers in ~10s under load.
   *
   * It is a dev server rather than `next start` on purpose: `start` serves
   * whatever was built last, which is a stale build with live data baked into
   * it more often than not.
   */
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `bun run e2e:server --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
