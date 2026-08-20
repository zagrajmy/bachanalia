#!/bin/bash
#
# Makes a fresh clone able to run `typecheck`, `lint`, `test` and `build`.
#
# What every one of those needs is absent from both git and a cold container:
# `node_modules`, the codegen output under `src/gql`, the env vars
# `next.config.ts` reads at import time, and `next-env.d.ts`. Without the last
# two, `tsc` and `oxlint` report every `*.webp` import as a missing module and
# bury the real errors under thirty invented ones.
set -euo pipefail

# Locally you already have all of this, and `bun run dev` regenerates what it
# does not; the hook would only cost you the wait.
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

# Claude sets CLAUDE_PROJECT_DIR; the fallback is for running this by hand.
cd "${CLAUDE_PROJECT_DIR:-"$(dirname "$0")/../.."}"

# `install`, not `ci`: the container image is cached once this hook returns, so
# a warm `node_modules` is the thing worth keeping.
bun install

# The README says `vercel env pull`, which wants credentials no sandbox has.
# The three NEXT_PUBLIC_ vars are public and already committed in
# `.env.example`, and `next.config.ts` throws on an undefined
# `images.remotePatterns` hostname, so the example file is both enough and
# required.
[ -f .env.local ] || cp .env.example .env.local

# Reads the committed `src/gql/schema.gql` — only `WP_SCHEMA_REFRESH=1` asks
# WordPress — so `@/gql` resolves with no network at all.
bun run codegen

# Everything above this line works offline; the two crawls below are the only
# part that needs the network, and a sandbox under a restrictive network policy
# has none. Probe once rather than letting them discover it the slow way: their
# retry ladders take minutes to give up on a host that is blocked outright, and
# this hook is synchronous, so that is minutes before the session starts.
set -a && . ./.env.local && set +a
if curl -fsS -m 10 -o /dev/null -X POST "$NEXT_PUBLIC_WORDPRESS_API_URL/graphql" \
  -H 'content-type: application/json' -d '{"query":"{__typename}"}'; then
  # Image data for content that is not in the repo yet. Both write nothing when
  # a fetch fails, so a partial crawl leaves the committed artwork alone.
  bun run lqip || echo "session-start: lqip crawl failed; using committed image data" >&2
  bun run exhibitor-logos || echo "session-start: exhibitor logo crawl failed; using committed list" >&2
else
  echo "session-start: WordPress unreachable, skipping image crawls" >&2
fi

# The rest of `bun run build`, whose other three steps just ran. Worth running
# even when the crawls were skipped: it is the compile and typecheck gate, and
# it writes `next-env.d.ts` before it collects page data, so the typings that
# `tsc` and `oxlint` need land even on a build that dies prerendering against a
# WordPress it cannot reach.
bunx next build || echo "session-start: build did not finish; install, codegen and typegen still succeeded" >&2
