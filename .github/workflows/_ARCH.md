# GitHub Actions（营销站发布）

| 文件 | 职责 |
|------|------|
| `website-release.yml` | `website-v*` tag push → preflight（`REQUIRE_BAKED_RELEASE=1` + build+test）→ POST `CF_PAGES_DEPLOY_HOOK` → post-deploy curl `myrmagent.ai/desktop-release.json`（version + ≥4 targets + Win `.msi`） |

Secrets：`CF_PAGES_DEPLOY_HOOK`（必填）；`GITHUB_TOKEN`（内置，供 bake GitHub API 限额）。

本地应急：`bun run release:website`（`myrm-website/scripts/release-website.ts`）。
