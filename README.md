# MeSpace

Monorepo for the MeSpace product: web (Next.js), mobile (Expo/React Native,
iOS + Android, CarPlay in a later phase), and shared logic.

- `apps/web` — Next.js web app
- `apps/mobile` — Expo React Native app (iOS, Android)
- `packages/core` — shared types and validation schemas
- `packages/api-client` — shared typed data-fetching layer

See `docs/superpowers/specs/2026-08-01-crossplatform-app-design.md` in the
infra repo for the architecture rationale.

## Commands

- `pnpm install` — install all workspace dependencies
- `pnpm turbo run build` — build all apps/packages
- `pnpm turbo run test` — run all tests
- `pnpm turbo run lint` — lint all apps/packages
