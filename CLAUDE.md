# cors-gate — repo card

> A map, not a manual. Keep it ~1 screen; point to detail, don't inline it.

## What it is
Connect/Express-compatible middleware that gates requests by enforcing the `Origin` header against the server's own origin plus CORS response headers — a CSRF alternative for modern browsers. Original Mixmax-authored library (not a fork), published to npm as `cors-gate`; pairs with the sibling `cors` middleware, which must run before it.

## serves
role: Origin-enforcement middleware — rejects cross-origin requests not permitted by CORS; ships `originFallbackToReferrer` to patch missing `Origin` from `Referer`.
referenced-by: [cors]

## Code map
- middleware + `originFallbackToReferrer` -> index.js
- type declarations -> index.d.ts
- tests -> test/cors-gate.spec.js

## Conventions
- Package manager: npm (package-lock.json; no `packageManager` field).
- Test framework: Mocha (no config file; runs default `./test`); assertions via supertest + express.
- No build step — single-file CommonJS `main: index.js` with hand-written `.d.ts`.
- Lint: eslint (`eslint-config-mixmax`), prettier; `lint` enforced as a pre-commit hook.
- CI: Jenkins `npmModulePipeline` (Jenkinsfile). README's Travis badge is stale — ignore it.
- Publish: npm public package (not private), via the Jenkins npm-module pipeline.

## Run / test
- `npm test` — Mocha suite
- `npm run lint` — eslint
- `npm run ci` — lint + test

## Load the matching domain card
- Cross-cutting library — load the consuming capability's card, not a domain-* for this repo.
