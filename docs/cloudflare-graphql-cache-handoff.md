# Bachanalia GraphQL edge-cache handoff

## Goal

Reduce WordPress/Wordfence load and Vercel build latency by caching safe public GraphQL reads at Cloudflare. Do not build a custom LiteSpeed caching layer.

## Current state

- Repository: this repository root
- Branch: `main`, aligned with `origin/main` at `7f997a6` when this handoff was written.
- Existing request split is good:
  - public content GETs: `src/utils/fetchGraphQL.ts`
  - cart/session POSTs: `src/components/Cart/session.ts`
  - preview GETs carry `Authorization`
- Existing WordPress invalidation: `wordpress/bachanalia-revalidate/bachanalia-revalidate.php`
- The rejected uncommitted LiteSpeed draft and its README section were removed. No replacement has been implemented.

## Review result

`thermo-nuclear-code-quality-review` verdict: reject current draft.

- P0: its cache predicate misses WordPress login cookies and WooGraphQL `Cart-Token`; those GETs are wrongly classed public.
- P1: manual purge hooks duplicate `bachanalia-revalidate` and miss product/variation changes such as price, name, and attributes.
- P1: LiteSpeed is origin caching. Live responses showed Cloudflare `DYNAMIC`, so this does not implement edge caching.

PHP lint passed. Classifier smoke testing confirmed public GET/POST/session/auth basics, and reproduced the `Cart-Token` and WordPress-login-cookie failures.

## Agreed design

Make cache eligibility explicit and fail closed.

1. Add `X-Bachanalia-Public: 1` only to non-preview calls from `fetchGraphQL` and `fetchGraphQLAtBuild`. It is an opt-in marker, not authentication.
2. WordPress treats a request as a public content read only if every condition holds:
   - GraphQL HTTP request
   - method `GET`
   - marker present
   - no `Cookie`
   - no `Authorization`
   - no `woocommerce-session`
   - no `Cart-Token`
   - no logged-in WordPress user
3. Only for that class, replace WooGraphQL's JWT session handler with standard `WC_Session_Handler`. No LiteSpeed hooks. This should prevent guest JWT/session headers on known public content reads without affecting cart POSTs.
4. Verify origin responses first: public marked reads must emit no `woocommerce-session`, `Cart-Token`, or `Set-Cookie`; cart and preview behavior must remain intact.
5. Configure two disjoint Cloudflare Cache Rules:
   - `/graphql` requests outside the public predicate: bypass
   - public predicate: cache eligible, retain full query string, edge TTL 3 hours
6. Extend the existing revalidation flow to purge Cloudflare `/graphql` by prefix on relevant edits. Avoid a second hook matrix.

The marker may be spoofed, so security must continue to rely on the absence of all credentials/cookies and the GET-only boundary.

## Blocker

Current user has no Cloudflare access. Before implementation/rollout, obtain either dashboard access or help from the Cloudflare administrator. Inspect existing Cache Rules before adding anything. Automatic purge later needs a zone identifier and a narrowly scoped cache-purge API token; do not put either in Git.

## Next-session sequence

1. Inspect Cloudflare plan, existing Cache Rules, GraphQL hostname, and who can provide access.
2. Implement the marker plus WordPress session suppression as a small isolated change; do not restore the LiteSpeed draft.
3. Test classifier matrix, PHP lint, frontend tests/typecheck, public origin headers, cart round-trip, preview, and content queries.
4. Get code review.
5. Add Cloudflare rules, then verify first request `MISS`, repeat `HIT`, and all private/cart cases `BYPASS` or `DYNAMIC`.
6. Add and test Cloudflare purge through the existing revalidation plugin.

## Suggested skills

- `thermo-nuclear-code-quality-review`: rerun on the replacement implementation before activation.
- `agent-browser`: exercise add/update/remove cart and preview/content behavior after origin changes.
- `github:yeet`: commit and push only after tests and code review readiness.

## References

- Cloudflare Cache Rules: https://developers.cloudflare.com/cache/how-to/cache-rules/
- Cloudflare prefix purge: https://developers.cloudflare.com/cache/how-to/purge-cache/purge_by_prefix/
