# GitHub Actions（营销站发布）

| 文件 | 职责 |
|------|------|
| `website-release.yml` | `website-v*` tag push → preflight（build+test）→ POST `CF_PAGES_DEPLOY_HOOK` |

Secret：`CF_PAGES_DEPLOY_HOOK`（brand 仓库 Settings → Secrets）。

本地应急：`bun run release:website`（`myrm-website/scripts/release-website.ts`）。
