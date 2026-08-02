/**
 * `MOCK_WP` is what Playwright's server runs with. Nothing reads it in
 * production, and the mock is only imported once it is set, so neither `msw`
 * nor the fixtures reach a deployed bundle's execution path.
 *
 * - `replay` — answer from `e2e/fixtures/wp`, never touch the network.
 * - `record` — pass through to the live WordPress and save what came back.
 */
export async function register() {
  const mode = process.env.MOCK_WP;

  if (mode !== "replay" && mode !== "record") return;
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startMockWordPress } = await import("../mocks/server");

  startMockWordPress(mode);
}
