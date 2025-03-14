# Elemental

> A minimal audius api + ui using the existing audius db schema.

## Dev:

- create `.env` file with `discoveryDbUrl='postgresql://...'`
- `pnpm i`
- `pnpm dev:server`
- `pnpm dev`

For opensearch:

- `pnpm dev:support` (wait a minute)
- `pnpm reindex`

See PROD.md for production setup + deploy
