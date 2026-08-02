import { setupServer } from "msw/node";

import { handlersFor, type Mode } from "./handlers";

/**
 * The cart's GraphQL calls happen in server actions and server components —
 * Node-side `fetch` from the Next server, which `page.route` cannot see and a
 * browser-side worker never touches. `msw/node` patches the process's own http
 * stack, so it is the only layer that catches both those and the content
 * queries a page render makes.
 */
export function startMockWordPress(mode: Mode) {
  const server = setupServer(...handlersFor(mode));

  server.listen({ onUnhandledRequest: "bypass" });

  console.log(`[mock-wp] ${mode} — WordPress answers from e2e/fixtures/wp`);

  return server;
}
