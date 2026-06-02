# myrm-agent-brand

Closed-source marketing and documentation for MyrmAgent.

## Layout

| Directory | Stack | Deploy target |
| --- | --- | --- |
| `myrm-website/` | Next.js | Vercel → `myrmagent.ai` |
| `myrm-docs/` | Mintlify | Mintlify → `docs.myrmagent.ai` |

Website and docs are **separate runtimes** (two releases). Navigation links use `NEXT_PUBLIC_DOCS_URL` (see `myrm-website/.env.example`).

## CI

- `myrm-website/`: `.github/workflows/website-ci.yml`
- Desktop release manifest: `bun run bake:release` in `myrm-website/` (GitHub Releases on `Pursue-LLL/myrm-agent`)

## Development

```bash
cd myrm-website && bun install && bun run dev
```

Docs: use [Mintlify CLI](https://mintlify.com/docs/development) from `myrm-docs/`.
