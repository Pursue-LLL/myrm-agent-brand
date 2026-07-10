# Contributing to myrm-agent-brand

This **closed-source** repository hosts the public marketing website and product documentation for [Myrm Agent](https://github.com/Pursue-LLL/myrm-agent). The MIT-licensed application (server, WebUI, desktop) lives in the main product repo, not here.

| Package | What to change |
| --- | --- |
| `myrm-website/` | Landing pages, download UX, legal pages, i18n copy |
| `myrm-docs/` | Mintlify docs (`docs/**/*.mdx`, `docs.json` navigation) |

## Before you open a PR

1. Read [ARCHITECTURE.md](ARCHITECTURE.md) and [_ARCH.md](_ARCH.md) for repo layout, deploy flow, and cross-package contracts.
2. For product behavior or API docs, also read the main repo guides linked from [docs.myrmagent.ai](https://docs.myrmagent.ai/contributing/development-setup).
3. Run checks from `myrm-website/`:

```bash
cd myrm-website
bun install
bun run lint
bun run validate:locales
bun run validate:docs-slugs
bun run test
bun run validate:fractal-docs  # also covered by test; explicit for doc-only PRs
```

4. For docs-only changes in `myrm-docs/`, run Mintlify locally: `cd myrm-docs && mint dev`.

Pull requests that touch `myrm-website/` run `.github/workflows/pr-check.yml` (same checks as above).

## Conventions

- **Single README at repo root** — module details live in `_ARCH.md` files (see `ARCHITECTURE.md`).
- **Bilingual copy** — website: `myrm-website/locales/en.json` + `zh.json`; docs: mirror under `docs/` and `docs/zh/`.
- **No build artifacts in git** — `out/`, `.next/`, `public/desktop-release.json` are generated locally or in CI.
- **Release** — production deploy: push `website-v*` tag → GHA → CF Deploy Hook; local emergency: `bun run release:website`. See [README.md](README.md).

## Where to learn more

- [Development setup (docs)](https://docs.myrmagent.ai/contributing/development-setup)
- [Commit conventions (docs)](https://docs.myrmagent.ai/contributing/commit-conventions)
- [Architecture overview (docs)](https://docs.myrmagent.ai/contributing/architecture-overview)
