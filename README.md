# Bachanalia Fantastyczne

The website of [Bachanalia Fantastyczne](https://bachanaliafantastyczne.pl/), an
SF&F convention run by ZKF Ad Astra in Zielona Góra. The 2026 edition is the
40th and holds Polcon rank, 25–27 September 2026.

Next.js on Vercel, with the existing WordPress kept as a headless CMS behind
WPGraphQL and WooGraphQL.

```sh
vercel env pull .env.local   # dev and build both need it
bun install
bun run dev
bun run test                       # unit
bunx playwright test --workers=2   # e2e, and the worker count is not optional
```

**[`docs/architecture.md`](./docs/architecture.md) is the source of truth** —
site map, design system, how the shop is wired, and the traps this codebase has
already fallen into. Read it before changing anything.
[`IN_PROGRESS.md`](./IN_PROGRESS.md) is what is still open.
